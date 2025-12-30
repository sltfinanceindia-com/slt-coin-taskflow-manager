import { CheckSquare } from 'lucide-react';
import { useChecklists } from '@/hooks/useChecklists';
import { cn } from '@/lib/utils';

interface ChecklistProgressProps {
  taskId: string;
  className?: string;
}

export function ChecklistProgress({ taskId, className }: ChecklistProgressProps) {
  const { items } = useChecklists(taskId);

  if (items.length === 0) return null;

  const completedCount = items.filter(item => item.is_completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <CheckSquare className="h-3 w-3" />
      <span>{completedCount}/{items.length}</span>
      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
