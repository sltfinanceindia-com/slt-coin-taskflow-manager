import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  MessageCircle,
  Users,
  ArrowRight
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useOrganization } from '@/hooks/useOrganization';
import { SimpleLineChart } from '@/components/SimpleChart';
import { useCommunication } from '@/hooks/useCommunication';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

export function EnhancedDashboardWidgets() {
  const { profile } = useAuth();
  const { stats } = useProfile();
  const { tasks } = useTasks();
  const { getWeeklyHours, timeLogs } = useTimeLogs();
  const { getTotalEarned, getPendingCoins } = useCoinTransactions();
  const { isAdmin } = useUserRole();
  const { channels, teamMembers, status: commStatus } = useCommunication();
  const { organization } = useOrganization();
  
  const coinName = organization?.coin_name || 'Coins';

  // Fetch real daily hours from time_logs for the past 7 days
  const { data: dailyHoursData } = useQuery({
    queryKey: ['daily-hours-chart', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Filter time logs for this specific day
        const dayLogs = timeLogs.filter(log => log.date_logged === dateStr);
        const totalHours = dayLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
        
        // Count tasks updated on this day
        const dayTasks = tasks.filter(task => {
          const taskDate = format(new Date(task.updated_at), 'yyyy-MM-dd');
          return taskDate === dateStr;
        });
        
        days.push({
          day: dayNames[date.getDay()],
          hours: Math.round(totalHours * 10) / 10,
          tasks: dayTasks.length,
        });
      }
      
      return days;
    },
    enabled: !!profile?.id,
    staleTime: 60000, // Cache for 1 minute
  });

  // Calculate unread messages
  const unreadCount = channels.reduce((acc, channel) => acc + (channel.unread_count || 0), 0);
  const recentChannels = channels.slice(0, 3);

  const myTasks = tasks.filter(task =>
    isAdmin ? true : task.assigned_to === profile?.id
  );
  
  const pendingTasks = myTasks.filter(task => 
    task.status === 'assigned' || task.status === 'in_progress'
  );
  
  const completedThisWeek = myTasks.filter(task => {
    if (task.status !== 'completed' && task.status !== 'verified') return false;
    const taskDate = new Date(task.updated_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo;
  });

  const weeklyHours = getWeeklyHours();
  const completionRate = stats?.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const totalEarned = getTotalEarned();
  const pendingCoins = getPendingCoins();

  // Use real data or fallback to empty structure
  const weeklyData = dailyHoursData || [];

  const taskStatusData = [
    { name: 'Completed', value: stats?.completedTasks || 0, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: pendingTasks.length || 0, color: 'hsl(var(--warning))' },
    { name: 'Pending', value: (myTasks.length - (stats?.completedTasks || 0) - pendingTasks.length) || 0, color: 'hsl(var(--muted))' },
  ];

  const mainStats = [
    {
      title: 'Total Tasks',
      value: myTasks.length,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: `${completedThisWeek.length} completed this week`,
      trending: completedThisWeek.length > 0,
    },
    {
      title: `${coinName} Earned`,
      value: totalEarned,
      icon: Coins,
      color: 'text-coin-gold',
      bgColor: 'bg-coin-gold/10',
      change: pendingCoins > 0 ? `+${pendingCoins} pending` : 'All verified',
      pending: pendingCoins,
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(completionRate)}%`,
      icon: Award,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: `${stats?.completedTasks || 0}/${stats?.totalTasks || 0} tasks`,
      progress: completionRate,
    },
    {
      title: 'Hours This Week',
      value: weeklyHours,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info/10',
      change: 'Target: 40h',
      progress: Math.min((weeklyHours / 40) * 100, 100),
    },
  ];

  const navigateToTab = (tab: string, filter?: string) => {
    const event = new CustomEvent('navigate-to-tab', { detail: { tab, filter } });
    window.dispatchEvent(event);
  };

  const quickActions = [
    { 
      title: 'Tasks Due Today', 
      count: myTasks.filter(task => {
        if (!task.end_date) return false;
        const today = new Date().toDateString();
        return new Date(task.end_date).toDateString() === today;
      }).length,
      icon: AlertCircle,
      color: 'text-warning',
      onClick: () => navigateToTab('tasks', 'due-today')
    },
    { 
      title: 'High Priority', 
      count: myTasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length,
      icon: TrendingUp,
      color: 'text-destructive',
      onClick: () => navigateToTab('tasks', 'high-priority')
    },
    { 
      title: 'Verified Tasks', 
      count: myTasks.filter(task => task.status === 'verified').length,
      icon: CheckCircle,
      color: 'text-success',
      onClick: () => navigateToTab('tasks', 'verified')
    },
  ];

  return (
    <div className="section-spacing">
      {/* Main Stats Grid */}
      <div className="dashboard-grid-stats">
        {mainStats.map((stat, index) => (
          <Card key={index} className="hover-scale card-gradient h-full card-stat">
            <CardContent className="card-padding h-full flex flex-col justify-between">
              <div className="flex items-start justify-between flex-1">
                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                  <p className="text-stat-label truncate">{stat.title}</p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="text-stat-value truncate">{stat.value}</p>
                    {stat.pending && stat.pending > 0 && (
                      <Badge variant="outline" className="text-xs animate-pulse shrink-0">
                        +{stat.pending}
                      </Badge>
                    )}
                  </div>
                  <p className="text-caption flex items-center gap-1 truncate">
                    {stat.trending && <TrendingUp className="h-3 w-3 text-success shrink-0" />}
                    <span className="truncate">{stat.change}</span>
                  </p>
                  {stat.progress !== undefined && (
                    <Progress value={stat.progress} className="h-1.5 sm:h-2" />
                  )}
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} hover-glow shrink-0 ml-2`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="dashboard-grid-3">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className="hover-scale cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 h-full card-compact"
            onClick={action.onClick}
          >
            <CardContent className="card-padding-compact h-full flex items-center">
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium truncate">{action.title}</p>
                  <p className={`text-base sm:text-lg font-bold ${action.color}`}>{action.count}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Communication Quick Access Widget */}
      <Card className="card-gradient border-primary/20">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-card-title flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Team Communication
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commStatus === 'ready' ? (
            <>
              {/* Team Members Online */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{teamMembers.filter(m => m.is_online).length} online</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{teamMembers.length} total members</span>
              </div>

              {/* Recent Conversations */}
              {recentChannels.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recent Conversations
                  </p>
                  {recentChannels.map(channel => (
                    <div 
                      key={channel.id} 
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {channel.is_direct_message ? 'Direct Message' : channel.name}
                          </p>
                          {channel.last_message && (
                            <p className="text-xs text-muted-foreground truncate">
                              {channel.last_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                      {channel.unread_count > 0 && (
                        <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start chatting with your team members
                  </p>
                </div>
              )}

              {/* Quick Action Button */}
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  const event = new CustomEvent('navigate-to-tab', { detail: 'communication' });
                  window.dispatchEvent(event);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Open Communication
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="dashboard-grid-2">
        {/* Weekly Activity Chart */}
        <Card className="card-gradient h-full card-chart">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-card-title flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="card-padding pt-0 flex-1">
            {weeklyData.length > 0 ? (
              <SimpleLineChart 
                data={weeklyData}
                dataKey="hours"
                xAxisKey="day"
                height={250}
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No time logs this week</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="card-gradient h-full card-chart">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-card-title flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="card-padding pt-0 flex-1">
            <div className="space-y-3 sm:space-y-4">
              {taskStatusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium text-sm sm:text-base">{entry.name}</span>
                  </div>
                  <span className="font-bold text-base sm:text-lg">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-gradient card-list">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-card-title flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="card-padding-compact pt-0">
          <div className="space-y-2 sm:space-y-3">
            {myTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover-scale">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {task.slt_coin_value}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 ml-2">
                  {new Date(task.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks assigned yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
