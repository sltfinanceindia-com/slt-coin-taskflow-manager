import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { Clock, FolderOpen, Calendar as CalendarIcon, Video, Plus } from 'lucide-react';

// Timesheet Calendar Component
function TimesheetCalendar() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timesheet-calendar', profile?.id, month],
    queryFn: async () => {
      if (!profile?.id) return [];
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('time_logs')
        .select('*, task:tasks(title), project:projects(name)')
        .eq('user_id', profile.id)
        .gte('log_date', start)
        .lte('log_date', end);
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['leaves-calendar', profile?.id, month],
    queryFn: async () => {
      if (!profile?.id) return [];
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', profile.id)
        .eq('status', 'approved')
        .or(`start_date.lte.${end},end_date.gte.${start}`);
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays-calendar', profile?.organization_id, month],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('holidays')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .gte('date', start)
        .lte('date', end);
      
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = timeLogs.filter(log => log.date_logged === dateStr);
    const totalHours = dayLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
    const isHoliday = holidays.some(h => h.holiday_date === dateStr);
    const isOnLeave = leaves.some(l => {
      const start = parseISO(l.start_date);
      const end = parseISO(l.end_date);
      return date >= start && date <= end;
    });
    
    return { dayLogs, totalHours, isHoliday, isOnLeave };
  };

  const selectedDayData = getDayData(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timesheet Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border w-full"
            modifiers={{
              hasLogs: (date) => getDayData(date).totalHours > 0,
              holiday: (date) => getDayData(date).isHoliday,
              leave: (date) => getDayData(date).isOnLeave,
            }}
            modifiersStyles={{
              hasLogs: { backgroundColor: 'hsl(var(--primary) / 0.1)' },
              holiday: { backgroundColor: 'hsl(var(--destructive) / 0.1)' },
              leave: { backgroundColor: 'hsl(142 76% 36% / 0.1)' },
            }}
          />
          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span>Has time logs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive/20" />
              <span>Holiday</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500/20" />
              <span>On Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(selectedDate, 'EEEE, MMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayData.isHoliday && (
            <Badge variant="destructive" className="mb-3">Holiday</Badge>
          )}
          {selectedDayData.isOnLeave && (
            <Badge className="bg-green-500 mb-3">On Leave</Badge>
          )}
          
          {selectedDayData.dayLogs.length > 0 ? (
            <div className="space-y-3">
              <div className="text-2xl font-bold">{selectedDayData.totalHours}h logged</div>
              {selectedDayData.dayLogs.map((log) => (
                <div key={log.id} className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">{(log.project as any)?.name}</p>
                  <p className="text-xs text-muted-foreground">{(log.task as any)?.title}</p>
                  <p className="text-sm mt-1">{log.hours_worked}h - {log.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No time logged for this day</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Project Calendar Component
function ProjectCalendar() {
  const { profile } = useAuth();
  const [month, setMonth] = useState<Date>(new Date());

  const { data: projects = [] } = useQuery({
    queryKey: ['project-calendar', profile?.organization_id, month],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, start_date, end_date')
        .eq('organization_id', profile.organization_id)
        .not('start_date', 'is', null);
      
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones-calendar', profile?.organization_id, month],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('project_milestones')
        .select('*, project:projects(name)')
        .eq('organization_id', profile.organization_id)
        .gte('due_date', start)
        .lte('due_date', end);
      
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-muted-foreground text-sm">No milestones this month</p>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{milestone.name}</p>
                    <p className="text-xs text-muted-foreground">{(milestone.project as any)?.name}</p>
                  </div>
                  <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                    {format(new Date(milestone.due_date), 'MMM d')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Meetings Calendar Component
function MeetingsCalendar() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const { data: events = [] } = useQuery({
    queryKey: ['meetings-calendar', profile?.id, month],
    queryFn: async () => {
      if (!profile?.id) return [];
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`user_id.eq.${profile.id},attendees.cs.{${profile.id}}`)
        .gte('start_time', start)
        .lte('start_time', end + 'T23:59:59');
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const selectedDayEvents = events.filter(event => 
    isSameDay(new Date(event.start_time), selectedDate)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Meetings Calendar
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Meeting
          </Button>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border w-full"
            modifiers={{
              hasEvents: (date) => events.some(e => isSameDay(new Date(e.start_time), date)),
            }}
            modifiersStyles={{
              hasEvents: { backgroundColor: 'hsl(var(--primary) / 0.1)', fontWeight: 'bold' },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(selectedDate, 'EEEE, MMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No meetings scheduled</p>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                  </p>
                  {event.is_online && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  )}
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Calendar Hub
export function CalendarHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          Calendar Hub
        </h1>
        <p className="text-muted-foreground">Manage your timesheets, projects, and meetings</p>
      </div>

      <Tabs defaultValue="timesheet">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="timesheet">
            <Clock className="h-4 w-4 mr-2" />
            Timesheet
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderOpen className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="meetings">
            <Video className="h-4 w-4 mr-2" />
            Meetings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timesheet" className="mt-6">
          <TimesheetCalendar />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectCalendar />
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <MeetingsCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CalendarHub;
