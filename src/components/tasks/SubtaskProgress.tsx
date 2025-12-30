import { GitBranch } from 'lucide-react';
import { useSubtasks } from '@/hooks/useSubtasks';
import { cn } from '@/lib/utils';

interface SubtaskProgressProps {
  taskId: string;
  className?: string;
}

export function SubtaskProgress({ taskId, className }: SubtaskProgressProps) {
  const { completedCount, totalCount } = useSubtasks(taskId);

  if (totalCount === 0) return null;

  const progress = (completedCount / totalCount) * 100;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <GitBranch className="h-3 w-3" />
      <span>{completedCount}/{totalCount}</span>
      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
