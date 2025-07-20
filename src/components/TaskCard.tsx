
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      case 'assigned': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      case 'verified': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'rejected': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'high': return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 animate-fade-in transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 hover:border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground leading-tight">
              {task.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${getStatusColor(task.status)} shadow-sm border font-medium px-3 py-1 text-xs`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`${getPriorityColor(task.priority)} shadow-sm border font-medium px-3 py-1 text-xs`}>
                {task.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-2 rounded-lg border border-yellow-200 shadow-sm">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-yellow-800 text-sm">{task.slt_coin_value}</span>
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
        
        {/* Task Description */}
        <div className="mt-4">
          <TaskDescription description={task.description} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Task Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg border border-border/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Assigned to</p>
              <p className="text-sm font-semibold text-foreground">{task.assigned_profile?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Due Date</p>
              <p className="text-sm font-semibold text-foreground">{format(new Date(task.end_date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Submission Notes */}
        {task.submission_notes && (
          <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-2 text-blue-800">Submission Notes:</p>
              <p className="text-sm leading-relaxed text-blue-700 whitespace-pre-wrap">{task.submission_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Admin Feedback */}
        {task.admin_feedback && (
          <Card className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-2 text-orange-800">Admin Feedback:</p>
              <p className="text-sm leading-relaxed text-orange-700 whitespace-pre-wrap">{task.admin_feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Task Actions */}
        <TaskActions task={task} onUpdateStatus={onUpdateStatus} onVerifyTask={onVerifyTask} />

        {/* Status Messages */}
        <TaskStatusIndicator status={task.status} coinValue={task.slt_coin_value} />

        {/* Admin Override */}
        {isAdmin && onAdminOverride && (
          <div className="pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdminOverride(task)}
              className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              <Edit className="h-3 w-3 mr-2" />
              Admin Override Status
            </Button>
          </div>
        )}

        {/* Task Comments - More Prominent */}
        <div className="pt-4 border-t border-border/50">
          <TaskComments taskId={task.id} />
        </div>
      </CardContent>
    </Card>
  );
}
