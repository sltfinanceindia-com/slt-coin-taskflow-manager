
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Clock, User, Calendar, Edit } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
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

  const isAssignedToMe = task.assigned_to === profile?.id;
  const isAdmin = profile?.role === 'admin';

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'verified': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
            {task.title}
          </h3>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1 rounded-lg border border-amber-200">
              <Coins className="h-3 w-3 text-amber-600 mr-1" />
              <span className="font-bold text-amber-800 text-xs">{task.slt_coin_value}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-1">
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
        
        <div className="flex flex-wrap gap-2">
          <Badge className={`${getStatusColor(task.status)} text-xs font-medium px-2 py-1 rounded-md`}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge className={`${getPriorityColor(task.priority)} text-xs font-medium px-2 py-1 rounded-md`}>
            {task.priority}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <TaskDescription description={task.description} />

      {/* Task Details */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Assigned to</p>
            <p className="font-semibold text-gray-900 truncate text-sm">{task.assigned_profile?.full_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Due Date</p>
            <p className="font-semibold text-gray-900 text-sm">{format(new Date(task.end_date), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Submission Notes */}
      {task.submission_notes && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
          <p className="text-xs font-semibold text-blue-800 mb-1">Submission Notes:</p>
          <p className="text-xs text-blue-700 whitespace-pre-wrap leading-relaxed">{task.submission_notes}</p>
        </div>
      )}

      {/* Admin Feedback */}
      {task.admin_feedback && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
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
          className="w-full text-xs bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
        >
          <Edit className="h-3 w-3 mr-2" />
          Admin Override Status
        </Button>
      )}

      {/* Task Comments - Collapsible */}
      <TaskComments taskId={task.id} />
    </div>
  );
}
