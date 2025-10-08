import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, Edit, User, Calendar, Coins, BarChart3 } from 'lucide-react';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface KanbanTableViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
}

export function KanbanTableView({ tasks, onUpdateStatus, onVerifyTask }: KanbanTableViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { timeLogs } = useTimeLogs();
  const { getUserSessionStats } = useSessionLogs();

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    onUpdateStatus(taskId, updates.status || tasks.find(t => t.id === taskId)?.status || 'assigned');
  };

  const getStatusBadge = (status: Task['status']) => {
    const variants = {
      assigned: { variant: 'secondary' as const, icon: Clock, color: 'text-blue-600' },
      in_progress: { variant: 'default' as const, icon: AlertCircle, color: 'text-yellow-600' },
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-purple-600' },
      verified: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const variants = {
      urgent: { variant: 'destructive' as const, label: 'Urgent' },
      high: { variant: 'default' as const, label: 'High' },
      medium: { variant: 'secondary' as const, label: 'Medium' },
      low: { variant: 'outline' as const, label: 'Low' },
    };

    const config = variants[priority as keyof typeof variants] || variants.medium;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {task.assigned_profile?.full_name || 'Unassigned'}
                  </div>
                </TableCell>
                <TableCell>
                  {task.end_date ? (
                    <div className="text-sm">
                      {format(new Date(task.end_date), 'MMM dd, yyyy')}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No due date</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {task.slt_coin_value || 0} 🪙
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTask(task);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <TaskEditDialog 
                      task={task} 
                      onUpdateTask={handleUpdateTask}
                      isUpdating={false}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found.
          </div>
        )}
      </div>

      {selectedTask && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
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
                  <CardTitle className="text-lg">{selectedTask.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedTask.status === 'verified' ? 'default' : 'secondary'}>
                      {selectedTask.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={selectedTask.priority === 'urgent' ? 'destructive' : 'outline'}>
                      {selectedTask.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{selectedTask.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Assigned to</p>
                        <p>{selectedTask.assigned_profile?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Created by</p>
                        <p>{selectedTask.creator_profile?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Due Date</p>
                        <p>{selectedTask.end_date ? format(new Date(selectedTask.end_date), 'MMM dd, yyyy') : 'No due date'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Coin Value</p>
                        <p className="font-bold">{selectedTask.slt_coin_value}</p>
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
                        <h4 className="font-semibold text-lg">
                          {timeLogs.filter(log => log.task_id === selectedTask.id).reduce((sum, log) => sum + log.hours_worked, 0)}h
                        </h4>
                        <p className="text-sm text-muted-foreground">Total Hours Logged</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold text-lg">
                          {timeLogs.filter(log => log.task_id === selectedTask.id).length}
                        </h4>
                        <p className="text-sm text-muted-foreground">Time Entries</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Recent Time Logs</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {timeLogs.filter(log => log.task_id === selectedTask.id).slice(0, 5).map((log) => (
                          <div key={log.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                            <span>{format(new Date(log.date_logged), 'MMM dd')}</span>
                            <span className="font-medium">{log.hours_worked}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission & Feedback */}
              {(selectedTask.submission_notes || selectedTask.admin_feedback) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Communications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTask.submission_notes && (
                      <div>
                        <h4 className="font-medium mb-2">Submission Notes</h4>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{selectedTask.submission_notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedTask.admin_feedback && (
                      <div>
                        <h4 className="font-medium mb-2">Admin Feedback</h4>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{selectedTask.admin_feedback}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
