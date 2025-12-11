import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, isToday, addMonths, subMonths,
  startOfWeek, endOfWeek, isPast, addDays
} from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  assigned: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  verified: 'bg-emerald-600',
  rejected: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  verified: 'Verified',
  rejected: 'Rejected',
};

interface TaskDetailModalProps {
  task: any;
  open: boolean;
  onClose: () => void;
}

function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{task.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn('w-2 h-2 rounded-full', statusColors[task.status])} />
                <span className="font-medium">{statusLabels[task.status]}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Priority</span>
              <Badge variant="outline" className="mt-1 capitalize">{task.priority}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Due Date</span>
              <p className="font-medium mt-1">
                {task.due_date ? format(new Date(task.due_date), 'PPP') : 'No due date'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Coins</span>
              <p className="font-medium mt-1">{task.coins} coins</p>
            </div>
          </div>

          {task.assigned_user && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Assigned to: {task.assigned_user.full_name}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TaskCalendar() {
  const { tasks, isLoading } = useTasks();
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const days = view === 'month' 
    ? eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    : eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterStatus]);

  const getTasksForDay = (day: Date) => {
    return filteredTasks.filter((task: any) => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -7) : addDays(currentDate, 7));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Task Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Task Calendar
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday}>Today</Button>
            </div>
            <h3 className="text-lg font-semibold">
              {view === 'month' 
                ? format(currentDate, 'MMMM yyyy')
                : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              }
            </h3>
          </div>
        </CardHeader>

        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className={cn(
            'grid grid-cols-7 gap-1',
            view === 'week' && 'min-h-[300px]'
          )}>
            {days.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isOverdue = dayTasks.some((t: any) => t.due_date && isPast(new Date(t.due_date)) && !['completed', 'verified'].includes(t.status));

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg transition-colors',
                    !isCurrentMonth && view === 'month' && 'bg-muted/30 opacity-50',
                    isToday(day) && 'bg-primary/10 border-primary',
                    isOverdue && 'border-red-500/50'
                  )}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    isToday(day) && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'text-xs p-1 rounded cursor-pointer truncate',
                          statusColors[task.status],
                          'text-white hover:opacity-80 transition-opacity'
                        )}
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {Object.entries(statusColors).slice(0, 5).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <div className={cn('w-3 h-3 rounded', color)} />
                <span className="text-muted-foreground">{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
