import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomFields, CustomFieldDefinition } from '@/hooks/useCustomFields';
import { ExternalLink } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface CustomFieldsEditorProps {
  taskId: string;
  compact?: boolean;
}

export function CustomFieldsEditor({ taskId, compact = false }: CustomFieldsEditorProps) {
  const { definitions, values, isLoadingDefinitions, saveValue, getFieldValue } = useCustomFields('task', taskId);
  const [localValues, setLocalValues] = useState<Record<string, Json>>({});

  useEffect(() => {
    if (values.length > 0) {
      const valueMap: Record<string, Json> = {};
      values.forEach(v => {
        valueMap[v.field_id] = v.value;
      });
      setLocalValues(valueMap);
    }
  }, [values]);

  const handleChange = (fieldId: string, value: Json) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: value }));
    saveValue({ fieldId, entityId: taskId, value });
  };

  if (isLoadingDefinitions) return null;
  if (definitions.length === 0) return null;

  const renderField = (field: CustomFieldDefinition) => {
    const value = localValues[field.id] ?? getFieldValue(field.id);
    const options = (field.options as { label: string; value: string }[]) || [];

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className={compact ? 'h-8' : undefined}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            rows={2}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder="0"
            className={compact ? 'h-8' : undefined}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={compact ? 'h-8' : undefined}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(field.id, !!checked)}
            />
            <Label htmlFor={field.id} className="cursor-pointer font-normal text-sm">
              Yes
            </Label>
          </div>
        );

      case 'url':
        return (
          <div className="flex gap-2">
            <Input
              type="url"
              value={(value as string) || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder="https://..."
              className={compact ? 'h-8 flex-1' : 'flex-1'}
            />
            {value && (
              <a
                href={value as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => handleChange(field.id, v)}
          >
            <SelectTrigger className={compact ? 'h-8' : undefined}>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${opt.value}`}
                  checked={selectedValues.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter(v => v !== opt.value);
                    handleChange(field.id, newValues);
                  }}
                />
                <Label htmlFor={`${field.id}-${opt.value}`} className="cursor-pointer font-normal text-sm">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-${compact ? '2' : '4'}`}>
      {compact && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Fields</p>}
      {definitions.map((field) => (
        <div key={field.id} className={`space-y-${compact ? '1' : '2'}`}>
          <Label className={compact ? 'text-xs' : 'text-sm'}>
            {field.name}
            {field.is_required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
