
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useOrganization } from '@/hooks/useOrganization';

export function DashboardWidgets() {
  const { profile } = useAuth();
  const { stats } = useProfile();
  const { tasks } = useTasks();
  const { getWeeklyHours } = useTimeLogs();
  const { organization } = useOrganization();

  const coinName = organization?.coin_name || 'Coins';
  
  const myTasks = tasks.filter(task => task.assigned_to === profile?.id);
  const pendingTasks = myTasks.filter(task => 
    task.status === 'assigned' || task.status === 'in_progress'
  );

  const weeklyHours = getWeeklyHours();

  const widgets = [
    {
      title: `${coinName} Earned`,
      value: stats?.totalCoins || 0,
      icon: Coins,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      change: '+12 this week',
      trending: true,
    },
    {
      title: 'Hours This Week',
      value: weeklyHours,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      change: `Goal: 40h`,
      progress: Math.min((weeklyHours / 40) * 100, 100),
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks.length,
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      change: `${myTasks.length} total`,
      urgent: pendingTasks.some(task => task.priority === 'urgent'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget, index) => (
          <Card key={index} className="min-h-[180px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{widget.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">{widget.value}</p>
                    {widget.urgent && (
                      <Badge variant="urgent">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-600 mr-1"></span>
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {widget.trending && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {widget.change}
                  </p>
                  {widget.progress !== undefined && (
                    <Progress value={widget.progress} className="h-2 max-w-full" />
                  )}
                </div>
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 ml-3">
                  <widget.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
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
                </div>
              ))}
              {myTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hours Logged</span>
                  <span>{weeklyHours}h / 40h</span>
                </div>
                <Progress value={Math.min((weeklyHours / 40) * 100, 100)} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Completed Tasks</span>
                  <p className="font-medium">{myTasks.filter(t => t.status === 'verified').length}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Pending Tasks</span>
                  <p className="font-medium">{pendingTasks.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
