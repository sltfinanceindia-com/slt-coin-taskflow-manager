import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, Edit, User, Calendar, Coins, BarChart3, Download } from 'lucide-react';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { exportToCSV } from '@/lib/export';
import { toast } from 'sonner';

interface KanbanTableViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
}

export function KanbanTableView({ tasks, onUpdateStatus, onVerifyTask }: KanbanTableViewProps) {
  const { profile } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const isAdmin = profile?.role === 'admin';
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

  const handleExport = () => {
    exportToCSV(tasks.map(t => ({
      'Task ID': t.task_number || t.id.slice(0, 8),
      Title: t.title,
      Status: t.status,
      Priority: t.priority,
      'Assigned To': t.assigned_profile?.full_name || '',
      'Due Date': format(new Date(t.end_date), 'yyyy-MM-dd'),
      'SLT Coins': t.slt_coin_value,
      Description: t.description || '',
    })), 'tasks');
    toast.success('Exported tasks');
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Tasks
        </Button>
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                    Title
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                    Status
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                    Priority
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                    Assigned To
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                    Due Date
                  </div>
                </TableHead>
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3 text-right">
                  Coins
                </TableHead>
                <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-sm px-6 py-3 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">No tasks found</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        There are no tasks matching your current filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task, index) => (
                  <TableRow 
                    key={task.id}
                    className={`
                      border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                      ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900/50'}
                    `}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="font-semibold text-base text-gray-900 dark:text-gray-50 mb-1 truncate">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="px-6 py-4">{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {task.assigned_profile?.full_name || <span className="text-gray-500 dark:text-gray-500 italic">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {task.end_date ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {format(new Date(task.end_date), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-500 italic">No due date</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge variant="outline" className="font-mono font-semibold">
                        {task.slt_coin_value || 0} 🪙
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 font-medium"
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
