import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, User, Calendar, Edit, MessageSquare } from 'lucide-react';
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

  const isAssignedToMe = task.assigned_to === profile?.id;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'verified': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <article 
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 hover-lift"
      aria-label={`Task: ${task.title}`}
    >
      {/* Header with Task Title - Always Visible */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-tight line-clamp-2 mb-1">
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-1">
              <Badge className={`${getStatusColor(task.status)} text-xs font-medium border px-1 py-0`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${getPriorityColor(task.priority)} text-xs font-medium border px-1 py-0`}>
                {task.priority}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 px-1 py-0.5 rounded border border-primary/20">
              <Coins className="h-2 w-2 text-primary mr-0.5" aria-hidden="true" />
              <span className="font-bold text-primary text-xs">{task.slt_coin_value}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-0.5">
                <TaskDetailDialog task={task} />
                {onUpdateTask && (
                  <TaskEditDialog 
                    task={task} 
                    onUpdateTask={onUpdateTask} 
                    isUpdating={isUpdating || false} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Assigned to</p>
            <p className="font-medium text-foreground truncate text-xs">{task.assigned_profile?.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Due Date</p>
            <time dateTime={task.end_date} className="font-medium text-foreground text-xs">
              {format(new Date(task.end_date), 'MMM dd, yyyy')}
            </time>
          </div>
        </div>
      </div>

      {/* Description */}
      <TaskDescription description={task.description} />

      {/* Submission Notes */}
      {task.submission_notes && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded-r-md">
          <p className="text-xs font-semibold text-blue-800 mb-1">Submission Notes:</p>
          <p className="text-xs text-blue-700 whitespace-pre-wrap leading-relaxed">{task.submission_notes}</p>
        </div>
      )}

      {/* Admin Feedback */}
      {task.admin_feedback && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-2 rounded-r-md">
          <p className="text-xs font-semibold text-orange-800 mb-1">Admin Feedback:</p>
          <p className="text-xs text-orange-700 whitespace-pre-wrap leading-relaxed">{task.admin_feedback}</p>
        </div>
      )}

      {/* Task Actions */}
      <TaskActions task={task} onUpdateStatus={onUpdateStatus} onVerifyTask={onVerifyTask} />

      {/* Status Messages */}
      <TaskStatusIndicator status={task.status} coinValue={task.slt_coin_value} />

      {/* Admin Override */}
      {isAdmin && onAdminOverride && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdminOverride(task)}
          aria-label="Override task status as admin"
          className="w-full gap-1 hover:bg-muted/50 transition-all duration-200 text-xs h-7 focus-ring"
        >
          <Edit className="h-3 w-3" aria-hidden="true" />
          Admin Override Status
        </Button>
      )}

      {/* Comments Section - Collapsible */}
      <TaskComments taskId={task.id} />
    </article>
  );
}
