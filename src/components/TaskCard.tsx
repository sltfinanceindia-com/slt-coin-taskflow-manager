import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, User, Calendar, Edit } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { TaskComments } from '@/components/TaskComments';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';
import { TaskDescription } from '@/components/TaskDescription';
import { TaskActions } from '@/components/TaskActions';
import { TaskStatusIndicator } from '@/components/TaskStatusIndicator';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  isUpdating?: boolean;
  onAdminOverride?: (task: Task, newStatus?: Task['status']) => void;
}

export function TaskCard({ task, onUpdateStatus, onVerifyTask, onUpdateTask, isUpdating, onAdminOverride }: TaskCardProps) {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'completed': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      case 'verified': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <article 
      className="bg-card border border-border rounded-lg p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 space-y-2"
      aria-label={`Task: ${task.title}`}
    >
      {/* Header - Task ID, Title, Coins */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Task ID and Title */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.task_number && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1 py-0.5 rounded shrink-0">
                {task.task_number}
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <Coins className="h-3 w-3 text-primary" />
              <span className="font-bold text-primary text-xs">{task.slt_coin_value}</span>
            </div>
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {task.title}
          </h3>
        </div>
        
        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-0.5 shrink-0">
            <TaskDetailDialog task={task} />
            {onUpdateTask && (
              <TaskEditDialog task={task} onUpdateTask={onUpdateTask} isUpdating={isUpdating || false} />
            )}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        <Badge className={`${getStatusColor(task.status)} text-[10px] font-medium border h-5 px-1.5`}>
          {task.status.replace('_', ' ')}
        </Badge>
        <Badge className={`${getPriorityColor(task.priority)} text-[10px] font-medium border h-5 px-1.5`}>
          {task.priority}
        </Badge>
      </div>

      {/* Compact Details Row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 min-w-0">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{task.assigned_profile?.full_name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Calendar className="h-3 w-3" />
          <time dateTime={task.end_date}>{format(new Date(task.end_date), 'MMM dd')}</time>
        </div>
      </div>

      {/* Description - Collapsible */}
      <TaskDescription description={task.description} />

      {/* Notes - Compact */}
      {task.submission_notes && (
        <div className="bg-blue-500/5 border-l-2 border-blue-500 p-1.5 rounded-r text-xs">
          <span className="font-medium text-blue-700 dark:text-blue-400">Submitted: </span>
          <span className="text-blue-600 dark:text-blue-300 line-clamp-2">{task.submission_notes}</span>
        </div>
      )}
      {task.admin_feedback && (
        <div className="bg-orange-500/5 border-l-2 border-orange-500 p-1.5 rounded-r text-xs">
          <span className="font-medium text-orange-700 dark:text-orange-400">Feedback: </span>
          <span className="text-orange-600 dark:text-orange-300 line-clamp-2">{task.admin_feedback}</span>
        </div>
      )}

      {/* Actions */}
      <TaskActions task={task} onUpdateStatus={onUpdateStatus} onVerifyTask={onVerifyTask} />
      <TaskStatusIndicator status={task.status} coinValue={task.slt_coin_value} />

      {/* Admin Override - Compact */}
      {isAdmin && onAdminOverride && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdminOverride(task)}
          className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <Edit className="h-3 w-3 mr-1" />
          Admin Override
        </Button>
      )}

      <TaskComments taskId={task.id} />
    </article>
  );
}
