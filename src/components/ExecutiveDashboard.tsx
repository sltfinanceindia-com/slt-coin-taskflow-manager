import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, CheckCircle2, Clock, TrendingUp, Coins, 
  BookOpen, Calendar, Target, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity, Award, Briefcase
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, change, icon: Icon, color, subtitle }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn('p-2 sm:p-3 rounded-lg', color)}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-3 text-sm',
            isPositive && 'text-green-500',
            isNegative && 'text-red-500',
            !isPositive && !isNegative && 'text-muted-foreground'
          )}>
            {isPositive && <ArrowUpRight className="h-4 w-4" />}
            {isNegative && <ArrowDownRight className="h-4 w-4" />}
            <span>{Math.abs(change)}% from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExecutiveDashboard() {
  const { profile } = useAuth();
  const { tasks } = useTasks();
  const { employees, departments } = useEmployeeDirectory();
  const { leaderboard } = useLeaderboard('week');

  // Fetch additional stats
  const { data: stats } = useQuery({
    queryKey: ['executive-stats', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      // Get attendance stats
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceToday } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('attendance_date', today);

      // Get coin transactions this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
      const { data: coinsThisWeek } = await supabase
        .from('coin_transactions')
        .select('coins_earned')
        .eq('organization_id', profile.organization_id)
        .gte('transaction_date', weekStart)
        .eq('status', 'approved');

      const totalCoinsThisWeek = coinsThisWeek?.reduce((sum, t) => sum + t.coins_earned, 0) || 0;

      return {
        attendanceToday: attendanceToday?.length || 0,
        avgTrainingProgress: 65, // Placeholder
        totalCoinsThisWeek,
      };
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate task stats
  const taskStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0, overdue: 0 };

    return {
      total: tasks.length,
      completed: tasks.filter(t => ['completed', 'verified'].includes(t.status)).length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
    };
  }, [tasks]);

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  const attendanceRate = employees.length > 0 
    ? Math.round(((stats?.attendanceToday || 0) / employees.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Executive Dashboard</h2>
          <p className="text-muted-foreground">
            Overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Activity className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Employees"
          value={employees.length}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${departments.length} departments`}
        />
        <StatCard
          title="Tasks Completed"
          value={taskStats.completed}
          change={12}
          icon={CheckCircle2}
          color="bg-green-500"
          subtitle={`${completionRate}% completion rate`}
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          icon={Calendar}
          color="bg-purple-500"
          subtitle={`${stats?.attendanceToday || 0} checked in`}
        />
        <StatCard
          title="Coins Distributed"
          value={(stats?.totalCoinsThisWeek || 0).toLocaleString()}
          change={8}
          icon={Coins}
          color="bg-yellow-500"
          subtitle="This week"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Task Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Task Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-500">{taskStats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-red-500">{taskStats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Completion</span>
                <span className="font-semibold">{stats?.avgTrainingProgress || 0}%</span>
              </div>
              <Progress value={stats?.avgTrainingProgress || 0} className="h-2" />
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Award className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Keep up the great work!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Performers This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.user_id} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 && 'bg-yellow-500 text-white',
                    index === 1 && 'bg-gray-400 text-white',
                    index === 2 && 'bg-amber-600 text-white',
                    index > 2 && 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.full_name}</p>
                  </div>
                  <div className="text-sm font-semibold text-yellow-500">
                    {entry.total_coins} 🪙
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data yet this week
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      {departments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {departments.map((dept) => {
                const deptEmployees = employees.filter(e => e.department_id === dept.id);
                return (
                  <div 
                    key={dept.id} 
                    className="p-4 rounded-lg border text-center"
                    style={{ borderColor: dept.color + '50' }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: dept.color + '20' }}
                    >
                      <Users className="h-5 w-5" style={{ color: dept.color }} />
                    </div>
                    <p className="font-medium text-sm truncate">{dept.name}</p>
                    <p className="text-2xl font-bold mt-1">{deptEmployees.length}</p>
                    <p className="text-xs text-muted-foreground">members</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
