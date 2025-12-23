import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, Users, Clock, Download, BarChart3, Target, CheckCircle, Timer } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ExportWrapper } from '@/components/ExportButton';
import { TaskPieChart, ProductivityLineChart, TeamPerformanceBarChart, CoinsAreaChart, KPIGaugeCard } from '@/components/charts';

export function AnalyticsPage() {
  const { tasks } = useTasks();
  const { timeLogs } = useTimeLogs();
  const { transactions } = useCoinTransactions();

  // Get organization-filtered profiles for team overview
  const { data: profiles } = useQuery({
    queryKey: ['org-profiles'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return [];

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (!userProfile?.organization_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('total_coins', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'verified').length;
  const pendingTasks = tasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
  const totalCoinsAwarded = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + t.coins_earned, 0);
  
  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours_worked, 0);
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Team performance data
  const teamPerformance = profiles?.map(profile => {
    const userTasks = tasks.filter(t => t.assigned_to === profile.id);
    const userCompletedTasks = userTasks.filter(t => t.status === 'verified').length;
    const userHours = timeLogs
      .filter(log => log.user_id === profile.id)
      .reduce((sum, log) => sum + log.hours_worked, 0);
    
    return {
      ...profile,
      taskCount: userTasks.length,
      completedTasks: userCompletedTasks,
      completionRate: userTasks.length > 0 ? (userCompletedTasks / userTasks.length) * 100 : 0,
      totalHours: userHours,
    };
  }) || [];

  const exportData = () => {
    const csvContent = [
      ['Name', 'Role', 'Total Coins', 'Tasks Assigned', 'Tasks Completed', 'Hours Logged', 'Completion Rate'],
      ...teamPerformance.map(member => [
        member.full_name,
        member.role,
        member.total_coins,
        member.taskCount,
        member.completedTasks,
        member.totalHours.toFixed(1),
        `${member.completionRate.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Comprehensive performance metrics and interactive insights
          </p>
        </div>
        <ExportWrapper>
          <Button onClick={exportData} variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </ExportWrapper>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPIGaugeCard
          title="Task Completion"
          value={completedTasks}
          target={totalTasks || 1}
          unit="tasks"
          trend={completionRate > 50 ? 'up' : 'down'}
          trendValue={`${completionRate.toFixed(0)}%`}
          icon={<CheckCircle className="h-4 w-4" />}
          color="green"
        />
        <KPIGaugeCard
          title="Total Coins Awarded"
          value={totalCoinsAwarded}
          target={10000}
          unit="coins"
          trend="up"
          icon={<Coins className="h-4 w-4" />}
          color="yellow"
        />
        <KPIGaugeCard
          title="Hours Logged"
          value={Math.round(totalHours)}
          target={500}
          unit="hours"
          icon={<Timer className="h-4 w-4" />}
          color="blue"
        />
        <KPIGaugeCard
          title="Team Members"
          value={profiles?.length || 0}
          target={50}
          unit="active"
          icon={<Users className="h-4 w-4" />}
          color="purple"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs sm:text-sm">Charts</TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm">Team</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="coins" className="text-xs sm:text-sm">Coins</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskPieChart />
            <ProductivityLineChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamPerformanceBarChart />
            <CoinsAreaChart />
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ProductivityLineChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskPieChart />
            <CoinsAreaChart />
          </div>
          <TeamPerformanceBarChart />
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Team Performance</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Individual performance metrics for all team members</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm min-w-[120px]">Name</TableHead>
                      <TableHead className="text-xs sm:text-sm">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm">Coins</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Tasks</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Completion</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamPerformance.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{member.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-coin-gold" />
                            <span className="font-bold text-coin-gold text-xs sm:text-sm">{member.total_coins}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{member.completedTasks}/{member.taskCount}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            <Progress value={member.completionRate} className="w-12 sm:w-16" />
                            <span className="text-xs sm:text-sm">{member.completionRate.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{member.totalHours.toFixed(1)}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Tasks</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest task activities and status updates</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm min-w-[140px]">Task</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Assigned To</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Coins</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.slice(0, 10).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{task.title}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{task.assigned_profile?.full_name}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] sm:text-xs ${
                            task.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            task.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            task.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-coin-gold" />
                            <span className="text-xs sm:text-sm">{task.slt_coin_value}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{format(new Date(task.end_date), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coins">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CoinsAreaChart />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-coin-gold" />
                  Top Earners
                </CardTitle>
                <CardDescription>Highest coin earners this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance
                    .sort((a, b) => b.total_coins - a.total_coins)
                    .slice(0, 5)
                    .map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30' :
                            index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30' :
                            index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{member.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Coins className="h-4 w-4 text-coin-gold" />
                          <span className="font-bold text-coin-gold">{member.total_coins}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Coin Transactions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Recent coin awards and transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Task</TableHead>
                      <TableHead className="text-xs sm:text-sm">Coins</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                          Task completion reward
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-coin-gold" />
                            <span className="font-bold text-coin-gold text-xs sm:text-sm">
                              +{transaction.coins_earned}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'approved' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
