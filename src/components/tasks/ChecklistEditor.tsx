import { useState } from 'react';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useChecklists, ChecklistItem } from '@/hooks/useChecklists';
import { cn } from '@/lib/utils';

interface ChecklistEditorProps {
  taskId: string;
  readOnly?: boolean;
}

export function ChecklistEditor({ taskId, readOnly = false }: ChecklistEditorProps) {
  const { items, addItem, toggleItem, updateItem, deleteItem, isAdding } = useChecklists(taskId);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const completedCount = items.filter(item => item.is_completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      addItem(newItemTitle.trim());
      setNewItemTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      updateItem(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingTitle('');
    }
  };

  if (items.length === 0 && readOnly) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Check className="h-4 w-4" />
          Checklist
          {items.length > 0 && (
            <span className="text-muted-foreground">
              ({completedCount}/{items.length})
            </span>
          )}
        </h4>
      </div>

      {items.length > 0 && (
        <Progress value={progress} className="h-2" />
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors group",
              item.is_completed && "bg-muted/50"
            )}
          >
            {!readOnly && (
              <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
            )}
            
            <Checkbox
              checked={item.is_completed}
              onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
              disabled={readOnly}
            />

            {editingId === item.id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleEditKeyDown}
                className="flex-1 h-7"
                autoFocus
              />
            ) : (
              <span
                className={cn(
                  "flex-1 text-sm cursor-pointer",
                  item.is_completed && "line-through text-muted-foreground"
                )}
                onClick={() => !readOnly && handleStartEdit(item)}
              >
                {item.title}
              </span>
            )}

            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Add checklist item..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleAddItem}
            disabled={!newItemTitle.trim() || isAdding}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
