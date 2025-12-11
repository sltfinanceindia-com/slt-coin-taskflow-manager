import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, Users, Clock, Download, BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

      // Get user's organization
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

  // Task status distribution
  const taskStatusData = [
    { status: 'Assigned', count: tasks.filter(t => t.status === 'assigned').length, color: 'bg-blue-500' },
    { status: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'bg-yellow-500' },
    { status: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: 'bg-purple-500' },
    { status: 'Verified', count: tasks.filter(t => t.status === 'verified').length, color: 'bg-green-500' },
    { status: 'Rejected', count: tasks.filter(t => t.status === 'rejected').length, color: 'bg-red-500' },
  ];

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
    a.download = `slt-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Comprehensive performance metrics and team insights
          </p>
        </div>
        <Button onClick={exportData} variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total SLT Coins</CardTitle>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-coin-gold" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-coin-gold">{totalCoinsAwarded}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Awarded to team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Task Completion</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Tasks</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{pendingTasks}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm">Team</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="coins" className="text-xs sm:text-sm">Coins</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Current status of all tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskStatusData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{item.count}</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${totalTasks > 0 ? (item.count / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest SLT Coin earners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance
                    .filter(member => member.role === 'intern')
                    .slice(0, 5)
                    .map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
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
                            task.status === 'verified' ? 'bg-green-100 text-green-800' :
                            task.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">SLT Coin Transactions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Recent coin awards and transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Recipient</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Task</TableHead>
                      <TableHead className="text-xs sm:text-sm">Coins</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-xs sm:text-sm">{format(new Date(transaction.transaction_date), 'MMM dd')}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{transaction.user_profile?.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm max-w-[150px] truncate">{transaction.task?.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-coin-gold" />
                            <span className="font-bold text-coin-gold text-xs sm:text-sm">{transaction.coins_earned}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] sm:text-xs ${
                            transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
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