import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { TaskComments } from '@/components/TaskComments';
import { Eye, Clock, User, Calendar, Coins, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface TaskDetailDialogProps {
  task: Task;
}

export function TaskDetailDialog({ task }: TaskDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const { timeLogs } = useTimeLogs();
  const { getUserSessionStats } = useSessionLogs();

  // Filter time logs for this task
  const taskTimeLogs = timeLogs.filter(log => log.task_id === task.id);
  const totalHours = taskTimeLogs.reduce((sum, log) => sum + log.hours_worked, 0);

  // Get session stats for the assigned user
  const sessionStats = task.assigned_to ? getUserSessionStats(task.assigned_to) : null;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30';
      case 'verified': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Details & Analytics
          </DialogTitle>
          <DialogDescription>
            Comprehensive overview of task progress, time tracking, and user activity
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(task.status)} border`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={`${getPriorityColor(task.priority)} border`}>
                  {task.priority.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{task.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-muted-foreground">Assigned to</p>
                    <p className="truncate">{task.assigned_profile?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-muted-foreground">Created by</p>
                    <p className="truncate">{task.creator_profile?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-muted-foreground">Due Date</p>
                    <p>{task.end_date ? format(new Date(task.end_date), 'MMM dd, yyyy') : 'No due date'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Coins className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-muted-foreground">Coin Value</p>
                    <p className="text-primary font-bold">{task.slt_coin_value}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Tracking
              </CardTitle>
              <CardDescription>Hours logged for this task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-lg">{totalHours}h</h4>
                    <p className="text-sm text-muted-foreground">Total Hours Logged</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-lg">{taskTimeLogs.length}</h4>
                    <p className="text-sm text-muted-foreground">Time Entries</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Time Logs</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {taskTimeLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                        <span>{format(new Date(log.date_logged), 'MMM dd')}</span>
                        <span className="font-medium">{log.hours_worked}h</span>
                      </div>
                    ))}
                    {taskTimeLogs.length === 0 && (
                      <p className="text-sm text-muted-foreground">No time logs recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Session Stats */}
          {sessionStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Activity Stats
                </CardTitle>
                <CardDescription>Session activity for {task.assigned_profile?.full_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">{sessionStats.totalSessions}</h4>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">{sessionStats.totalHours}h</h4>
                    <p className="text-sm text-muted-foreground">Total Screen Time</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">{sessionStats.todayHours}h</h4>
                    <p className="text-sm text-muted-foreground">Today's Time</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-lg">{Math.round((sessionStats.completedSessions / sessionStats.totalSessions) * 100) || 0}%</h4>
                    <p className="text-sm text-muted-foreground">Session Completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission & Feedback */}
          {(task.submission_notes || task.admin_feedback) && (
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.submission_notes && (
                  <div>
                    <h4 className="font-medium mb-2">Submission Notes</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{task.submission_notes}</p>
                    </div>
                  </div>
                )}
                
                {task.admin_feedback && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Feedback</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{task.admin_feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Task Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Discussion and updates for this task</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskComments taskId={task.id} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}