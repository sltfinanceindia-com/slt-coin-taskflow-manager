/**
 * Employee Dashboard
 * Shows employee-specific widgets: My Tasks, Attendance, Leave Balance, Upcoming Events
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target, Clock, Calendar, CheckCircle, AlertCircle, TrendingUp, 
  Coins, ArrowRight, CalendarDays
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, isToday, isFuture, parseISO } from 'date-fns';

export function EmployeeDashboard() {
  const { profile } = useAuth();
  const { tasks } = useTasks();
  const { getWeeklyHours } = useTimeLogs();
  const { organization } = useOrganization();
  
  const coinName = organization?.coin_name || 'Coins';

  // Filter tasks for current user
  const myTasks = tasks.filter(task => task.assigned_to === profile?.id);
  const pendingTasks = myTasks.filter(task => 
    task.status === 'assigned' || task.status === 'in_progress'
  );
  const completedTasks = myTasks.filter(task => 
    task.status === 'completed' || task.status === 'verified'
  );
  const dueTodayTasks = myTasks.filter(task => {
    if (!task.end_date) return false;
    return isToday(parseISO(task.end_date));
  });

  // Fetch leave balance
  const { data: leaveBalance } = useQuery({
    queryKey: ['leave-balance', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*, leave_types:leave_type_id(name)')
        .eq('employee_id', profile?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ['today-attendance', profile?.id],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile?.id)
        .eq('attendance_date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch upcoming events (calendar events + leave requests)
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events', profile?.id],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', profile?.id)
        .gte('start_time', today)
        .order('start_time')
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const weeklyHours = getWeeklyHours();
  const completionRate = myTasks.length > 0 
    ? Math.round((completedTasks.length / myTasks.length) * 100) 
    : 0;

  const totalLeaveBalance = leaveBalance?.reduce((sum, lb) => sum + (lb.total_days - lb.used_days), 0) || 0;

  const navigateToTab = (tab: string) => {
    const event = new CustomEvent('navigate-to-tab', { detail: { tab } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h2>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Tasks</p>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  {completedTasks.length} completed
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hours This Week</p>
                <p className="text-2xl font-bold">{weeklyHours}h</p>
                <Progress value={(weeklyHours / 40) * 100} className="h-1.5 mt-2" />
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leave Balance</p>
                <p className="text-2xl font-bold">{totalLeaveBalance} days</p>
                <p className="text-xs text-muted-foreground">
                  {leaveBalance?.length || 0} leave types
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <CalendarDays className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <Progress value={completionRate} className="h-1.5 mt-2" />
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today&apos;s Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Attendance</p>
              <p className="text-sm text-muted-foreground">
                {todayAttendance?.clock_in_time 
                  ? `Clocked in at ${format(parseISO(todayAttendance.clock_in_time), 'h:mm a')}`
                  : 'Not clocked in yet'}
              </p>
            </div>
            <Badge variant={todayAttendance?.clock_in_time ? 'default' : 'secondary'}>
              {todayAttendance?.status || 'Pending'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('tasks')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="font-medium">Due Today</p>
              <p className="text-lg font-bold text-warning">{dueTodayTasks.length}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('leave')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Apply Leave</p>
              <p className="text-sm text-muted-foreground">{totalLeaveBalance} days available</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('time')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-info" />
            <div className="flex-1">
              <p className="font-medium">Log Time</p>
              <p className="text-sm text-muted-foreground">{weeklyHours}h this week</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(event.start_time), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge variant="outline">{event.event_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            My Tasks
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('tasks')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {myTasks.length > 0 ? (
            <div className="space-y-3">
              {myTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {task.end_date && (
                        <span className="text-xs text-muted-foreground">
                          Due {format(parseISO(task.end_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Coins className="h-4 w-4" />
                    <span className="font-medium">{task.slt_coin_value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No tasks assigned yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
