import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useCoinRates } from '@/hooks/useCoinRates';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, Clock, CheckCircle, Trophy, Calendar, XCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { formatINR, formatCoinRate } from '@/lib/currency';

export function MyCoins() {
  const { profile } = useAuth();
  const { organization } = useOrganization();
  const { transactions, getUserTransactions, getTotalEarned, getPendingCoins } = useCoinTransactions();
  const { tasks } = useTasks();
  const { latestRate } = useCoinRates();
  
  const coinName = organization?.coin_name || 'Coins';

  // Get user's transactions
  const myTransactions = getUserTransactions(profile?.id);
  const totalEarned = getTotalEarned(profile?.id);
  const pendingCoins = getPendingCoins(profile?.id);

  // Get user's tasks
  const myTasks = tasks.filter(task => task.assigned_to === profile?.id);
  const completedTasks = myTasks.filter(task => task.status === 'verified');
  const pendingTasks = myTasks.filter(task => task.status === 'completed');

  // Calculate monthly earnings for the last 6 months
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyEarnings = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthTransactions = myTransactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= monthStart && transactionDate <= monthEnd && t.status === 'approved';
    });
    const earnings = monthTransactions.reduce((sum, t) => sum + t.coins_earned, 0);
    return {
      month: format(month, 'MMM yyyy'),
      earnings
    };
  });

  // Calculate completion rate
  const completionRate = myTasks.length > 0 ? (completedTasks.length / myTasks.length) * 100 : 0;

  // Calculate average coins per task
  const avgCoinsPerTask = completedTasks.length > 0 ? totalEarned / completedTasks.length : 0;

  // Calculate USD values
  const currentRate = latestRate ? Number(latestRate.rate) : 1.0;
  const totalUsdValue = totalEarned * currentRate;
  const pendingUsdValue = pendingCoins * currentRate;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">My {coinName}</h2>
        <p className="text-muted-foreground text-sm">Track your earnings and performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-coin-gold/20 to-coin-gold/5 border-coin-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Earned</CardTitle>
            <Coins className="h-4 w-4 text-coin-gold shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-coin-gold">{totalEarned}</div>
            <p className="text-xs text-muted-foreground truncate">
              {formatINR(totalUsdValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-500">{pendingCoins}</div>
            <p className="text-xs text-muted-foreground truncate">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-500">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground truncate">
              {completionRate.toFixed(0)}% rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Avg/Task</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-500">
              {avgCoinsPerTask.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground truncate">Coins per task</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your task completion and earning progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Task Completion Rate</span>
              <span className="text-sm text-muted-foreground">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold">{myTasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">{completedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold">{pendingTasks.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full">
            <TabsTrigger value="history" className="flex-1 text-xs sm:text-sm whitespace-nowrap">History</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-xs sm:text-sm whitespace-nowrap">Monthly</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1 text-xs sm:text-sm whitespace-nowrap">Tasks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest coin earnings and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {myTransactions.length > 0 ? (
                <div className="space-y-4">
                  {myTransactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {transaction.status === 'approved' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : transaction.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-orange-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.task?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Coins className="h-4 w-4 text-coin-gold" />
                          <span className="font-bold text-coin-gold">
                            {transaction.coins_earned}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatINR(transaction.coins_earned * currentRate)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === 'approved' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground">
                    Complete tasks to start earning coins!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
              <CardDescription>Your coin earnings over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyEarnings.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{month.month}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-coin-gold" />
                      <span className="font-bold text-coin-gold">{month.earnings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task-wise Earnings</CardTitle>
              <CardDescription>Breakdown of coins earned from each completed task</CardDescription>
            </CardHeader>
            <CardContent>
              {completedTasks.length > 0 ? (
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed: {format(new Date(task.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Coins className="h-4 w-4 text-coin-gold" />
                          <span className="font-bold text-coin-gold">{task.slt_coin_value}</span>
                        </div>
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed tasks yet</h3>
                  <p className="text-muted-foreground">
                    Your completed tasks and their coin rewards will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}