import { useCustomFields } from '@/hooks/useCustomFields';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface CustomFieldsDisplayProps {
  taskId: string;
}

export function CustomFieldsDisplay({ taskId }: CustomFieldsDisplayProps) {
  const { definitions, values, isLoadingDefinitions, isLoadingValues, getFieldValue } = useCustomFields('task', taskId);

  if (isLoadingDefinitions || isLoadingValues) return null;
  if (definitions.length === 0 || values.length === 0) return null;

  const formatValue = (field: typeof definitions[0], value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === '') return null;

    switch (field.field_type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';

      case 'date':
        return new Date(value as string).toLocaleDateString();

      case 'url':
        return (
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            Link <ExternalLink className="h-3 w-3" />
          </a>
        );

      case 'select':
        const options = (field.options as { label: string; value: string }[] | undefined) || [];
        const option = options.find(o => o.value === value);
        return (option?.label || String(value)) as React.ReactNode;

      case 'multiselect':
        const multiOptions = (field.options as { label: string; value: string }[]) || [];
        const selectedValues = (value as string[]) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map(v => {
              const opt = multiOptions.find(o => o.value === v);
              return (
                <Badge key={v} variant="secondary" className="text-xs">
                  {opt?.label || v}
                </Badge>
              );
            })}
          </div>
        );

      default:
        return String(value);
    }
  };

  const fieldsWithValues = definitions.filter(field => {
    const value = getFieldValue(field.id);
    return value !== null && value !== undefined && value !== '';
  });

  if (fieldsWithValues.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Fields</p>
      <div className="grid grid-cols-2 gap-2">
        {fieldsWithValues.map((field) => {
          const value = getFieldValue(field.id);
          const formattedValue = formatValue(field, value);
          
          if (!formattedValue) return null;

          return (
            <div key={field.id} className="text-sm">
              <span className="text-muted-foreground">{field.name}: </span>
              <span className="font-medium">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
