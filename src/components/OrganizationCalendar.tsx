import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, CheckCircle2, Briefcase, Plane, Home, Users
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, isToday, addMonths, subMonths,
  startOfWeek, endOfWeek, addDays, parseISO
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'task' | 'meeting' | 'leave' | 'wfh' | 'shift';
  date: Date;
  endDate?: Date;
  status?: string;
  user?: { name: string; avatar?: string };
  color: string;
  metadata?: any;
}

const eventColors: Record<string, string> = {
  task: 'bg-blue-500',
  meeting: 'bg-purple-500',
  leave: 'bg-red-500',
  wfh: 'bg-amber-500',
  shift: 'bg-green-500',
};

const eventLabels: Record<string, string> = {
  task: 'Task',
  meeting: 'Meeting',
  leave: 'Leave',
  wfh: 'Work From Home',
  shift: 'Shift',
};

interface EventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
}

function EventDetailModal({ event, open, onClose }: EventDetailModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', event.color)} />
            {event.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type</span>
              <Badge className="mt-1 capitalize">{eventLabels[event.type]}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Date</span>
              <p className="font-medium mt-1">{format(event.date, 'PPP')}</p>
            </div>
            {event.endDate && (
              <div>
                <span className="text-muted-foreground">End Date</span>
                <p className="font-medium mt-1">{format(event.endDate, 'PPP')}</p>
              </div>
            )}
            {event.status && (
              <div>
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="mt-1 capitalize">{event.status}</Badge>
              </div>
            )}
          </div>

          {event.user && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{event.user.name}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationCalendar() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch calendar events
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendar-events', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('calendar_events')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('organization_id', profile.organization_id);
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch leave requests
  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leave-requests-calendar', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('leave_requests')
        .select('*, profiles:employee_id(full_name, avatar_url)')
        .eq('organization_id', profile.organization_id)
        .in('status', ['approved', 'pending']);
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch WFH requests
  const { data: wfhRequests = [] } = useQuery({
    queryKey: ['wfh-requests-calendar', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('wfh_requests')
        .select('*, profiles:employee_id(full_name, avatar_url)')
        .eq('organization_id', profile.organization_id)
        .in('status', ['approved', 'pending']);
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const days = view === 'month' 
    ? eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    : eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Combine all events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add tasks
    tasks?.forEach((task: any) => {
      if (task.due_date) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          type: 'task',
          date: new Date(task.due_date),
          status: task.status,
          user: task.assigned_user ? { name: task.assigned_user.full_name } : undefined,
          color: eventColors.task,
          metadata: task
        });
      }
    });

    // Add calendar events (meetings)
    calendarEvents.forEach((event: any) => {
      events.push({
        id: `meeting-${event.id}`,
        title: event.title,
        type: 'meeting',
        date: new Date(event.start_time),
        endDate: new Date(event.end_time),
        user: event.profiles ? { name: event.profiles.full_name } : undefined,
        color: eventColors.meeting,
        metadata: event
      });
    });

    // Add leave requests
    leaveRequests.forEach((leave: any) => {
      events.push({
        id: `leave-${leave.id}`,
        title: `${leave.profiles?.full_name || 'Employee'} - Leave`,
        type: 'leave',
        date: new Date(leave.start_date),
        endDate: new Date(leave.end_date),
        status: leave.status,
        user: leave.profiles ? { name: leave.profiles.full_name } : undefined,
        color: eventColors.leave,
        metadata: leave
      });
    });

    // Add WFH requests
    wfhRequests.forEach((wfh: any) => {
      events.push({
        id: `wfh-${wfh.id}`,
        title: `${wfh.profiles?.full_name || 'Employee'} - WFH`,
        type: 'wfh',
        date: new Date(wfh.request_date),
        status: wfh.status,
        user: wfh.profiles ? { name: wfh.profiles.full_name } : undefined,
        color: eventColors.wfh,
        metadata: wfh
      });
    });

    return events;
  }, [tasks, calendarEvents, leaveRequests, wfhRequests]);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return allEvents;
    return allEvents.filter((event) => event.type === filterType);
  }, [allEvents, filterType]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => {
      // For multi-day events (leave)
      if (event.endDate) {
        return day >= event.date && day <= event.endDate;
      }
      return isSameDay(event.date, day);
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

  const isLoading = tasksLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Organization Calendar
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
              Organization Calendar
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="leave">Leaves</SelectItem>
                  <SelectItem value="wfh">Work From Home</SelectItem>
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
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg transition-colors',
                    !isCurrentMonth && view === 'month' && 'bg-muted/30 opacity-50',
                    isToday(day) && 'bg-primary/10 border-primary'
                  )}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    isToday(day) && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-xs p-1 rounded cursor-pointer truncate',
                          event.color,
                          'text-white hover:opacity-80 transition-opacity'
                        )}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {Object.entries(eventColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs">
                <div className={cn('w-3 h-3 rounded', color)} />
                <span className="text-muted-foreground capitalize">{eventLabels[type]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
