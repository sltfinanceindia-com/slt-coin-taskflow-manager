import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Circle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSubtasks } from '@/hooks/useSubtasks';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface SubtaskListProps {
  parentTaskId: string;
  readOnly?: boolean;
}

const statusConfig = {
  assigned: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  completed: { icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  verified: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  rejected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function SubtaskList({ parentTaskId, readOnly = false }: SubtaskListProps) {
  const { subtasks, createSubtask, updateSubtaskStatus, deleteSubtask, isCreating, progress, completedCount, totalCount } = useSubtasks(parentTaskId);
  const [isOpen, setIsOpen] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      createSubtask({ title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewSubtaskTitle('');
    }
  };

  const cycleStatus = (subtask: Task) => {
    const statusOrder: Task['status'][] = ['assigned', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(subtask.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateSubtaskStatus(subtask.id, nextStatus);
  };

  if (subtasks.length === 0 && readOnly) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto hover:bg-transparent">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              Subtasks
              {totalCount > 0 && (
                <span className="text-muted-foreground ml-1">
                  ({completedCount}/{totalCount})
                </span>
              )}
            </span>
          </Button>
        </CollapsibleTrigger>

        {!readOnly && !isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {totalCount > 0 && (
        <Progress value={progress} className="h-1.5" />
      )}

      <CollapsibleContent className="space-y-2">
        {subtasks.map((subtask) => {
          const config = statusConfig[subtask.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={subtask.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors group",
                subtask.status === 'verified' && "bg-muted/50"
              )}
            >
              <button
                onClick={() => !readOnly && cycleStatus(subtask)}
                className={cn("transition-colors", config.color)}
                disabled={readOnly}
              >
                <StatusIcon className="h-4 w-4" />
              </button>

              <span
                className={cn(
                  "flex-1 text-sm",
                  subtask.status === 'verified' && "line-through text-muted-foreground"
                )}
              >
                {subtask.title}
              </span>

              <Badge variant="outline" className={cn("text-xs", config.bg, config.color)}>
                {subtask.status.replace('_', ' ')}
              </Badge>

              {subtask.assigned_profile && (
                <span className="text-xs text-muted-foreground">
                  {subtask.assigned_profile.full_name?.split(' ')[0]}
                </span>
              )}

              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteSubtask(subtask.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}

        {isAdding && (
          <div className="flex gap-2">
            <Input
              placeholder="Subtask title..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newSubtaskTitle.trim()) {
                  setIsAdding(false);
                }
              }}
              className="flex-1"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim() || isCreating}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
