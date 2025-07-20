
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
    <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 ease-out animate-fade-in transform hover:-translate-y-2 hover:scale-[1.02] bg-gradient-to-br from-background via-background/95 to-muted/20 border-2 border-border/30 hover:border-primary/40 backdrop-blur-sm">
      <CardHeader className="pb-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4 flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
              {task.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getStatusColor(task.status)} shadow-md border-2 font-bold px-4 py-2 text-sm tracking-wide uppercase hover:scale-105 transition-transform duration-200`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${getPriorityColor(task.priority)} shadow-md border-2 font-bold px-4 py-2 text-sm tracking-wide uppercase hover:scale-105 transition-transform duration-200`}>
                {task.priority}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 px-4 py-3 rounded-xl border-2 border-amber-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Coins className="h-6 w-6 text-amber-600 animate-pulse" />
              <span className="font-black text-amber-800 text-lg">{task.slt_coin_value}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
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
        
        {/* Task Description - More Prominent */}
        <div className="mt-6">
          <TaskDescription description={task.description} />
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Task Details - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-muted/40 via-muted/30 to-background/50 rounded-2xl border-2 border-border/40 shadow-inner">
          <div className="flex items-center space-x-4 group hover:scale-105 transition-transform duration-300">
            <div className="p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl shadow-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wide">Assigned to</p>
              <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors duration-300">{task.assigned_profile?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 group hover:scale-105 transition-transform duration-300">
            <div className="p-3 bg-gradient-to-r from-orange-200 to-orange-100 rounded-xl shadow-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wide">Due Date</p>
              <p className="text-lg font-black text-foreground group-hover:text-orange-600 transition-colors duration-300">{format(new Date(task.end_date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Submission Notes - More Prominent */}
        {task.submission_notes && (
          <Card className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50 border-l-8 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-[1.01] transform">
            <CardContent className="p-6">
              <p className="text-lg font-black mb-4 text-blue-800 uppercase tracking-wide">Submission Notes:</p>
              <p className="text-base leading-relaxed text-blue-700 whitespace-pre-wrap font-medium">{task.submission_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Admin Feedback - More Prominent */}
        {task.admin_feedback && (
          <Card className="bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50 border-l-8 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-[1.01] transform">
            <CardContent className="p-6">
              <p className="text-lg font-black mb-4 text-orange-800 uppercase tracking-wide">Admin Feedback:</p>
              <p className="text-base leading-relaxed text-orange-700 whitespace-pre-wrap font-medium">{task.admin_feedback}</p>
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

        {/* Task Comments - Ultra Prominent */}
        <div className="pt-8 border-t-4 border-gradient-to-r from-primary/30 via-primary/20 to-primary/30">
          <TaskComments taskId={task.id} />
        </div>
      </CardContent>
    </Card>
  );
}
