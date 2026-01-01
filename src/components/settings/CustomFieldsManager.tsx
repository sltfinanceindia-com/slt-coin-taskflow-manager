import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, GripVertical, Settings2 } from 'lucide-react';
import { useCustomFields, CustomFieldType, CustomFieldDefinition } from '@/hooks/useCustomFields';

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text (Single Line)' },
  { value: 'textarea', label: 'Text (Multi Line)' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown (Single)' },
  { value: 'multiselect', label: 'Dropdown (Multi)' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'url', label: 'URL' },
];

export function CustomFieldsManager() {
  const { definitions, createDefinition, updateDefinition, deleteDefinition, isCreating } = useCustomFields('task');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    field_type: 'text' as CustomFieldType,
    is_required: false,
    options: [] as { label: string; value: string }[],
  });
  const [optionInput, setOptionInput] = useState('');

  const handleCreateField = () => {
    createDefinition({
      name: newField.name,
      field_type: newField.field_type,
      entity_type: 'task',
      is_required: newField.is_required,
      is_active: true,
      position: definitions.length,
      options: ['select', 'multiselect'].includes(newField.field_type) ? newField.options : undefined,
    });
    setDialogOpen(false);
    setNewField({ name: '', field_type: 'text', is_required: false, options: [] });
    setOptionInput('');
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setNewField(prev => ({
        ...prev,
        options: [...prev.options, { label: optionInput.trim(), value: optionInput.trim().toLowerCase().replace(/\s+/g, '_') }],
      }));
      setOptionInput('');
    }
  };

  const removeOption = (index: number) => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Custom Task Fields
          </CardTitle>
          <CardDescription>
            Define custom fields to capture additional task information
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Field</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Department, Cost Center"
                />
              </div>

              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={newField.field_type}
                  onValueChange={(v) => setNewField(prev => ({ ...prev, field_type: v as CustomFieldType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {['select', 'multiselect'].includes(newField.field_type) && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Add option..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    />
                    <Button type="button" variant="outline" onClick={addOption}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newField.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                        {opt.label}
                        <button onClick={() => removeOption(i)} className="text-muted-foreground hover:text-foreground">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-required"
                  checked={newField.is_required}
                  onCheckedChange={(checked) => setNewField(prev => ({ ...prev, is_required: !!checked }))}
                />
                <Label htmlFor="is-required" className="cursor-pointer font-normal">
                  Required field
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateField} disabled={!newField.name.trim() || isCreating}>
                  {isCreating ? 'Creating...' : 'Create Field'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {definitions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No custom fields defined yet. Click "Add Field" to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {definitions.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div>
                    <p className="font-medium">{field.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                      {field.is_required && ' • Required'}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete custom field?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the field and all its values from existing tasks.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteDefinition(field.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
