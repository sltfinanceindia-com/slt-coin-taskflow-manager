
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Trophy, BookOpen, MessageCircle } from 'lucide-react';
import { TaskList } from '@/components/TaskList';
import { ProfileSettings } from '@/components/ProfileSettings';
import { useAuth } from '@/hooks/useAuth';
import { TrainingCenter } from '@/components/TrainingCenter';
import { useCoinRates } from '@/hooks/useCoinRates';
import { formatINR, formatCoinRate } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export function InternDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile } = useAuth();
  const { latestRate } = useCoinRates();
  const [stats, setStats] = useState({
    activeTasks: 0,
    hoursLogged: 0,
    trainingProgress: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id) return;

      try {
        // Fetch active tasks assigned to this user
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .eq('assigned_to', profile.id)
          .in('status', ['assigned', 'in_progress']);

        // Fetch hours logged this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const { data: timeLogs } = await supabase
          .from('time_logs')
          .select('hours_worked')
          .eq('user_id', profile.id)
          .gte('date_logged', startOfWeek.toISOString());

        // Fetch training progress (completed video views)
        const { data: videoProgress } = await supabase
          .from('training_video_progress')
          .select('id')
          .eq('user_id', profile.id)
          .gte('completion_percentage', 100);

        setStats({
          activeTasks: tasks?.length || 0,
          hoursLogged: timeLogs?.reduce((sum, log) => sum + (log.hours_worked || 0), 0) || 0,
          trainingProgress: videoProgress?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [profile?.id]);

  const currentRate = latestRate ? Number(latestRate.rate) : 1.0;
  const totalCoins = profile?.total_coins || 0;
  const totalUsdValue = totalCoins * currentRate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          <span className="font-normal text-muted-foreground">Welcome back, </span>
          <span className="font-bold">{profile?.full_name || 'Intern'}</span>!
        </h1>
        <p className="text-base text-muted-foreground">
          Track your progress and manage your tasks.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5">
            <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm whitespace-nowrap">Tasks</TabsTrigger>
            <TabsTrigger value="training" className="text-xs sm:text-sm whitespace-nowrap">Training</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs sm:text-sm whitespace-nowrap">Feedback</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm whitespace-nowrap">Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="min-h-[140px] bg-gradient-to-br from-coin-gold/10 to-coin-gold/5 border-coin-gold/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Coins</CardTitle>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.activeTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Currently assigned
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hours Logged</CardTitle>
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.hoursLogged}h</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Training Progress</CardTitle>
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.trainingProgress}</div>
                <p className="text-xs text-muted-foreground">
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

        <TabsContent value="feedback">
          <FeedbackForm userEmail={profile?.email} userName={profile?.full_name} />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
