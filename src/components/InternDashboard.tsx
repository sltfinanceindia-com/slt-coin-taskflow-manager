
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Trophy, BookOpen } from 'lucide-react';
import { TaskList } from '@/components/TaskList';
import { ProfileSettings } from '@/components/ProfileSettings';
import { useAuth } from '@/hooks/useAuth';
import { TrainingCenter } from '@/components/TrainingCenter';
import { useCoinRates } from '@/hooks/useCoinRates';
import { formatINR, formatCoinRate } from '@/lib/currency';

export function InternDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile } = useAuth();
  const { latestRate } = useCoinRates();

  const currentRate = latestRate ? Number(latestRate.rate) : 1.0;
  const totalCoins = profile?.total_coins || 0;
  const totalUsdValue = totalCoins * currentRate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          <span className="font-normal text-gray-600 dark:text-gray-400">Welcome back, </span>
          <span className="font-bold">{profile?.full_name || 'Intern'}</span>!
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Track your progress and manage your tasks.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="min-h-[140px] bg-gradient-to-br from-coin-gold/10 to-coin-gold/5 border-coin-gold/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Coins</CardTitle>
                <Trophy className="h-5 w-5 text-coin-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-coin-gold">{totalCoins} coins</div>
                <p className="text-xs text-muted-foreground">
                  {formatINR(totalUsdValue)} @ {formatCoinRate(currentRate)}/coin
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</CardTitle>
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">-</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Currently assigned
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Logged</CardTitle>
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">-</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Progress</CardTitle>
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">-</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Modules completed
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity to display.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskList />
        </TabsContent>

        <TabsContent value="training">
          <TrainingCenter />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
