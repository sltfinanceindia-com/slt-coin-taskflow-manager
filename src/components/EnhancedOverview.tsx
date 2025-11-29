import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Monitor,
  Users
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { SimpleLineChart } from '@/components/SimpleChart';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function EnhancedOverview() {
  const { profile } = useAuth();
  const { stats } = useProfile();
  const { tasks } = useTasks();
  const { getWeeklyHours } = useTimeLogs();
  const { getTotalEarned, getPendingCoins } = useCoinTransactions();
  const { getUserSessionStats } = useSessionLogs();

  const myTasks = tasks.filter(task => 
    profile?.role === 'admin' ? true : task.assigned_to === profile?.id
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
  const completionRate = myTasks.length > 0 ? (myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length / myTasks.length) * 100 : 0;
  const totalEarned = getTotalEarned();
  const pendingCoins = getPendingCoins();
  const sessionStats = getUserSessionStats();

  // Fetch latest coin rate
  const { data: latestCoinRate } = useQuery({
    queryKey: ['latest-coin-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_rates')
        .select('*')
        .order('rate_date', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Generate weekly activity data
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    
    return days.map((day, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index));
      
      const dayTasks = myTasks.filter(task => {
        const taskDate = new Date(task.updated_at);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const dayHours = weeklyHours > 0 ? Math.random() * 8 + 1 : 0;
      
      return { 
        day, 
        hours: Math.round(dayHours * 10) / 10, 
        tasks: dayTasks.length 
      };
    });
  };

  const weeklyData = generateWeeklyData();

  const taskStatusData = [
    { name: 'Completed', value: myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: myTasks.filter(t => t.status === 'in_progress').length, color: 'hsl(var(--warning))' },
    { name: 'Assigned', value: myTasks.filter(t => t.status === 'assigned').length, color: 'hsl(var(--primary))' },
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
      title: 'SLT Coins',
      value: profile?.total_coins || 0,
      icon: Coins,
      color: 'text-coin-gold',
      bgColor: 'bg-coin-gold/10',
      change: latestCoinRate 
        ? `Rate: $${Number(latestCoinRate.rate).toFixed(4)}` 
        : pendingCoins > 0 ? `+${pendingCoins} pending` : 'All verified',
      pending: pendingCoins,
      subtitle: latestCoinRate && `Value: $${(Number(latestCoinRate.rate) * (profile?.total_coins || 0)).toFixed(2)}`,
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(completionRate)}%`,
      icon: Award,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: `${myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length}/${myTasks.length} tasks`,
      progress: completionRate,
    },
    {
      title: 'Screen Time Today',
      value: `${sessionStats.todayHours}h`,
      icon: Monitor,
      color: 'text-info',
      bgColor: 'bg-info/10',
      change: `${sessionStats.totalHours}h total`,
      progress: sessionStats.todayHours > 0 ? Math.min((sessionStats.todayHours / 8) * 100, 100) : 0,
    },
  ];

  const quickActions = [
    { 
      title: 'Due Today', 
      count: myTasks.filter(task => {
        if (!task.end_date) return false;
        const today = new Date().toDateString();
        return new Date(task.end_date).toDateString() === today;
      }).length,
      icon: AlertCircle,
      color: 'text-warning'
    },
    { 
      title: 'High Priority', 
      count: myTasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length,
      icon: TrendingUp,
      color: 'text-destructive'
    },
    { 
      title: 'Verified', 
      count: myTasks.filter(task => task.status === 'verified').length,
      icon: CheckCircle,
      color: 'text-success'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card key={index} className="hover-scale card-gradient min-h-[180px]">
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">{stat.value}</p>
                    {stat.pending && stat.pending > 0 && (
                      <Badge variant="outline" className="text-xs animate-pulse">
                        +{stat.pending}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {stat.trending && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {stat.change}
                  </p>
                  {(stat as any).subtitle && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {(stat as any).subtitle}
                    </p>
                  )}
                  {stat.progress !== undefined && (
                    <Progress value={stat.progress} className="h-2 max-w-full" />
                  )}
                </div>
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 hover-glow flex items-center justify-center flex-shrink-0 ml-3">
                  <stat.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover-scale min-h-[100px]">
            <CardContent className="p-4 flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.title}</p>
                  <p className={`text-lg font-bold ${action.color}`}>{action.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="card-gradient min-h-[400px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SimpleLineChart 
              data={weeklyData}
              dataKey="hours"
              xAxisKey="day"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="card-gradient min-h-[400px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {taskStatusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-50">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Stats for Admins */}
      {profile?.role === 'admin' && (
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Activity Overview
            </CardTitle>
            <CardDescription>Recent session and activity statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">{sessionStats.totalSessions}</h4>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">{sessionStats.totalHours}h</h4>
                <p className="text-sm text-muted-foreground">Total Screen Time</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">{sessionStats.todayHours}h</h4>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">{Math.round((sessionStats.completedSessions / sessionStats.totalSessions) * 100) || 0}%</h4>
                <p className="text-sm text-muted-foreground">Session Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-scale">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{task.title}</p>
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
                <div className="text-xs text-muted-foreground">
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