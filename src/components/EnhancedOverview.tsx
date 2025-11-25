import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Users,
  Plus,
  MessageSquare,
  Info
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { useCountUp } from '@/hooks/useCountUp';
import { SimpleLineChart } from '@/components/SimpleChart';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function EnhancedOverview() {
  const { profile } = useAuth();
  const { stats } = useProfile();
  const { tasks } = useTasks();
  const { getWeeklyHours } = useTimeLogs();
  const { getTotalEarned, getPendingCoins } = useCoinTransactions();
  const { getUserSessionStats } = useSessionLogs();
  const navigate = useNavigate();

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
  
  // Count up animations for main stats
  const animatedTaskCount = useCountUp(myTasks.length, 1500);
  const animatedCoinCount = useCountUp(profile?.total_coins || 0, 2000);
  const animatedCompletionRate = useCountUp(Math.round(completionRate), 1500);
  const animatedScreenTime = useCountUp(sessionStats.todayHours, 1500);

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
      change: pendingCoins > 0 ? `+${pendingCoins} pending` : 'All verified',
      pending: pendingCoins,
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
    <TooltipProvider>
      <div className="space-y-8">
        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button className="gap-2 h-auto py-3" onClick={() => navigate('/dashboard?action=new-task')}>
                <Plus className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">New Task</p>
                  <p className="text-xs opacity-80">Create a new task</p>
                </div>
              </Button>
              <Button variant="outline" className="gap-2 h-auto py-3" onClick={() => navigate('/dashboard?action=log-time')}>
                <Clock className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">Log Time</p>
                  <p className="text-xs opacity-80">Track work hours</p>
                </div>
              </Button>
              <Button variant="outline" className="gap-2 h-auto py-3" onClick={() => navigate('/dashboard?tab=communication')}>
                <MessageSquare className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-semibold">Send Message</p>
                  <p className="text-xs opacity-80">Chat with team</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => {
            const displayValue = index === 0 ? animatedTaskCount : 
                                index === 1 ? animatedCoinCount :
                                index === 2 ? `${animatedCompletionRate}%` :
                                `${animatedScreenTime}h`;
            
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Card className="hover-scale card-gradient cursor-pointer bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                              {displayValue}
                            </p>
                            {stat.pending && stat.pending > 0 && (
                              <Badge variant="outline" className="text-xs animate-pulse">
                                +{stat.pending}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stat.trending && <TrendingUp className="h-3 w-3 text-success" />}
                            {stat.change}
                          </p>
                          {stat.progress !== undefined && (
                            <Progress value={stat.progress} className="h-2" />
                          )}
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor} transition-transform hover:scale-110`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{stat.title === 'Total Tasks' ? 'All tasks assigned to you' :
                                         stat.title === 'SLT Coins' ? 'Total coins earned for completed tasks' :
                                         stat.title === 'Completion Rate' ? 'Percentage of completed tasks' :
                                         'Hours active today'}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover-scale">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
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
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={weeklyData}
              dataKey="hours"
              xAxisKey="day"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskStatusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-lg">{entry.value}</span>
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

      {/* Recent Activity with Avatars */}
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard?tab=tasks')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myTasks.slice(0, 5).map((task) => {
              const icon = task.status === 'verified' ? CheckCircle :
                          task.status === 'completed' ? Award :
                          task.status === 'in_progress' ? Clock :
                          Target;
              const IconComponent = icon;
              
              return (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover-scale transition-all hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {task.slt_coin_value}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
            {myTasks.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/dashboard?action=new-task')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}