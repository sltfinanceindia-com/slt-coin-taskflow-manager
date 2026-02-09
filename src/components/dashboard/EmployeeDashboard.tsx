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
    <div className="section-spacing">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 sm:p-6">
        <h2 className="text-page-title">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Main Stats */}
      <div className="dashboard-grid-stats">
        <Card className="hover:shadow-md transition-shadow h-full card-stat">
          <CardContent className="card-padding h-full flex flex-col justify-between">
            <div className="flex items-start justify-between flex-1">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-stat-label">My Tasks</p>
                <p className="text-stat-value">{pendingTasks.length}</p>
                <p className="text-caption">
                  {completedTasks.length} completed
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-primary/10 shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow h-full card-stat">
          <CardContent className="card-padding h-full flex flex-col justify-between">
            <div className="flex items-start justify-between flex-1">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-stat-label">Hours This Week</p>
                <p className="text-stat-value">{weeklyHours}h</p>
                <Progress value={(weeklyHours / 40) * 100} className="h-1.5 sm:h-2 mt-2" />
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-info/10 shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow h-full card-stat">
          <CardContent className="card-padding h-full flex flex-col justify-between">
            <div className="flex items-start justify-between flex-1">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-stat-label">Leave Balance</p>
                <p className="text-stat-value">{totalLeaveBalance} days</p>
                <p className="text-caption">
                  {leaveBalance?.length || 0} leave types
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-success/10 shrink-0">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow h-full card-stat">
          <CardContent className="card-padding h-full flex flex-col justify-between">
            <div className="flex items-start justify-between flex-1">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-stat-label">Completion Rate</p>
                <p className="text-stat-value">{completionRate}%</p>
                <Progress value={completionRate} className="h-1.5 sm:h-2 mt-2" />
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-warning/10 shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Status */}
      <Card className="card-gradient">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-card-title flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Today&apos;s Status
          </CardTitle>
        </CardHeader>
        <CardContent className="card-padding-compact pt-0">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-sm sm:text-base">Attendance</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
      <div className="dashboard-grid-3">
        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all h-full card-compact"
          onClick={() => navigateToTab('tasks')}
        >
          <CardContent className="card-padding-compact h-full flex items-center">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">Due Today</p>
                <p className="text-base sm:text-lg font-bold text-warning">{dueTodayTasks.length}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all h-full card-compact"
          onClick={() => navigateToTab('leave')}
        >
          <CardContent className="card-padding-compact h-full flex items-center">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">Apply Leave</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{totalLeaveBalance} days available</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all h-full card-compact"
          onClick={() => navigateToTab('time')}
        >
          <CardContent className="card-padding-compact h-full flex items-center">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-info shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">Log Time</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{weeklyHours}h this week</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card className="card-gradient">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-card-title flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="card-padding-compact pt-0">
            <div className="space-y-2 sm:space-y-3">
              {upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{event.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {format(parseISO(event.start_time), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 ml-2">{event.event_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      <Card className="card-gradient card-list">
        <CardHeader className="pb-3 sm:pb-4 flex-row items-center justify-between">
          <CardTitle className="text-card-title flex items-center gap-2">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            My Tasks
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('tasks')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="card-padding-compact pt-0">
          {myTasks.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {myTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover-scale"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{task.title}</p>
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
                  <div className="flex items-center gap-1 text-coin-gold shrink-0 ml-2">
                    <Coins className="h-4 w-4" />
                    <span className="font-medium">{task.slt_coin_value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No tasks assigned yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
