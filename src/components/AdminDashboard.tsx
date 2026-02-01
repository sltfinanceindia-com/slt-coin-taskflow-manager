import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckSquare, Trophy, BookOpen, Calendar as CalendarIcon, Coins, Settings, Building2, MessageCircle, Activity } from 'lucide-react';
import { TaskManager } from '@/components/TaskManager';
import { InternManager } from '@/components/InternManager';
import { ProfileSettings } from '@/components/ProfileSettings';
import { TrainingAdmin } from '@/components/TrainingAdmin';
import { CertificateGenerator } from '@/components/CertificateGenerator';
import { CoinRateManagement } from '@/components/CoinRateManagement';
import { CompactCoinRate } from '@/components/CompactCoinRate';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import Calendar from '@/components/Calendar';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  activity_type: string;
  timestamp: string;
  user_id: string;
  metadata?: Record<string, unknown>;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { organization, userCount } = useOrganization();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeTasks: 0,
    coinsDistributed: 0,
    trainingModules: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // All queries are now automatically filtered by organization via RLS
        const profilesResult = await supabase
          .from('profiles')
          .select('id')
          .eq('is_active', true);
        
        const internCount = profilesResult?.data?.length || 0;
        
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .in('status', ['assigned', 'in_progress']);
        
        const { data: coins } = await supabase
          .from('coin_transactions')
          .select('coins_earned')
          .eq('status', 'approved');
        
        const { data: videos } = await supabase
          .from('training_videos')
          .select('id')
          .eq('is_published', true);

        // Fetch real activity logs
        const { data: activityData } = await supabase
          .from('activity_logs')
          .select('id, activity_type, timestamp, user_id, metadata')
          .order('timestamp', { ascending: false })
          .limit(5);

        setStats({
          totalInterns: internCount || 0,
          activeTasks: tasks?.length || 0,
          coinsDistributed: coins?.reduce((sum, coin) => sum + (coin.coins_earned || 0), 0) || 0,
          trainingModules: videos?.length || 0
        });

        setRecentActivity((activityData as ActivityLog[]) || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Helper function to format activity types for display
  const formatActivityType = (activityType: string): string => {
    const typeMap: Record<string, string> = {
      'login': 'User logged in',
      'logout': 'User logged out',
      'task_created': 'New task created',
      'task_completed': 'Task completed',
      'task_assigned': 'Task assigned',
      'clock_in': 'Clock in recorded',
      'clock_out': 'Clock out recorded',
      'coin_earned': 'Coins earned',
      'training_completed': 'Training completed',
      'profile_updated': 'Profile updated',
      'message_sent': 'Message sent',
    };
    return typeMap[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            {organization && (
              <Badge variant="outline" className="text-sm">
                <Building2 className="h-3 w-3 mr-1" />
                {organization.name}
              </Badge>
            )}
          </div>
          <p className="text-base text-muted-foreground">
            Manage your organization's employees, tasks, and settings.
          </p>
        </div>
        <Link to="/admin/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Organization Settings
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interns">Interns</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="coin-rate">Coin Rate</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Interns</CardTitle>
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stats.totalInterns}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active interns in system
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</CardTitle>
                <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stats.activeTasks}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Currently assigned
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Coins Distributed</CardTitle>
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stats.coinsDistributed}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total rewards given
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[140px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Modules</CardTitle>
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stats.trainingModules}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Available modules
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Coin Rate Widget */}
          <div className="grid gap-6 md:grid-cols-2">
            <CompactCoinRate className="md:col-span-1" />
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Manage Coin Rate</h3>
                  <p className="text-sm text-muted-foreground">Update the current coin rate and view history</p>
                </div>
                <Button onClick={() => setActiveTab('coin-rate')} className="bg-emerald-600 hover:bg-emerald-700">
                  <Coins className="h-4 w-4 mr-2" />
                  Update Rate
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">System Online</p>
                      <p className="text-xs text-muted-foreground">All services operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Database Active</p>
                      <p className="text-xs text-muted-foreground">Connected and syncing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Backup Running</p>
                      <p className="text-xs text-muted-foreground">Daily backup in progress</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Analytics</p>
                      <p className="text-xs text-muted-foreground">Data collection active</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <p key={activity.id}>
                          • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}: {formatActivityType(activity.activity_type)}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic">No recent activity recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interns">
          <InternManager />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManager />
        </TabsContent>

        <TabsContent value="coin-rate">
          <CoinRateManagement />
        </TabsContent>

        <TabsContent value="training">
          <TrainingAdmin />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificateGenerator />
        </TabsContent>

        <TabsContent value="calendar">
          <Calendar />
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
