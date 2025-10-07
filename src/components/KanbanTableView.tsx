import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { TaskDetailDialog } from '@/components/TaskDetailDialog';
import { useState } from 'react';

interface KanbanTableViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
}

export function KanbanTableView({ tasks, onUpdateStatus, onVerifyTask }: KanbanTableViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTask(task)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
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
        <TaskDetailDialog task={selectedTask} />
      )}
    </>
  );
}
