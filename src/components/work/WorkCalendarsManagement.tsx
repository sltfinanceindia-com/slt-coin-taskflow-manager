import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, CalendarDays, Star } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, addDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

export function WorkCalendarsManagement() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const { events, isLoading } = useCalendarEvents(monthStart, monthEnd);

  const { data: teamMembers } = useQuery({
    queryKey: ['team-calendar-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });

  const calendarStart = startOfWeek(monthStart);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: addDays(calendarStart, 41) });

  const getEventsForDay = (date: Date) => {
    return events?.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    }) || [];
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      deadline: 'bg-red-100 text-red-800 border-red-200',
      leave: 'bg-green-100 text-green-800 border-green-200',
      holiday: 'bg-purple-100 text-purple-800 border-purple-200',
      task: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[type] || colors.meeting;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Work Calendars
          </h2>
          <p className="text-muted-foreground">Team calendars and scheduling overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(v: 'month' | 'week') => setView(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{events?.length || 0}</span>
              <span className="text-muted-foreground">events</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {events?.filter(e => e.event_type === 'meeting').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {events?.filter(e => e.event_type === 'deadline').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {events?.filter(e => e.event_type === 'leave').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50">Meeting</Badge>
            <Badge variant="outline" className="bg-red-50">Deadline</Badge>
            <Badge variant="outline" className="bg-green-50">Leave</Badge>
            <Badge variant="outline" className="bg-yellow-50">Task</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading calendar...</div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-muted">
              {weekDays.map((day) => (
                <div key={day} className="bg-background p-2 text-center font-medium text-sm text-muted-foreground">
                  {day}
                </div>
              ))}
              {daysInMonth.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={idx}
                    className={`bg-background min-h-[100px] p-1 ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    } ${isTodayDate ? 'ring-2 ring-primary ring-inset' : ''}`}
                  >
                    <div className={`text-right text-sm p-1 ${
                      isTodayDate ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate border ${getEventColor(event.event_type)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events?.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.event_type === 'meeting' ? 'bg-blue-500' :
                      event.event_type === 'deadline' ? 'bg-red-500' :
                      event.event_type === 'leave' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.start_time), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{event.event_type}</Badge>
                </div>
              ))}
              {(!events || events.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers?.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-sm">{member.full_name}</span>
                  </div>
                  <Badge variant="default">Available</Badge>
                </div>
              ))}
              {(!teamMembers || teamMembers.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No team members found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
