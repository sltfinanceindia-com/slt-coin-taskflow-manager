
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckSquare, Trophy, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { TaskManager } from '@/components/TaskManager';
import { InternManager } from '@/components/InternManager';
import { ProfileSettings } from '@/components/ProfileSettings';
import { TrainingAdmin } from '@/components/TrainingAdmin';
import { CertificateGenerator } from '@/components/CertificateGenerator';
import { Calendar } from '@/components/Calendar';
import { supabase } from '@/integrations/supabase/client';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeTasks: 0,
    coinsDistributed: 0,
    trainingModules: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total interns
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'intern');
        
        // Fetch active tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .in('status', ['assigned', 'in_progress']);
        
        // Fetch total coins distributed
        const { data: coins } = await supabase
          .from('coin_transactions')
          .select('coins_earned');
        
        // Fetch training modules
        const { data: videos } = await supabase
          .from('training_videos')
          .select('id')
          .eq('is_published', true);

        setStats({
          totalInterns: profiles?.length || 0,
          activeTasks: tasks?.length || 0,
          coinsDistributed: coins?.reduce((sum, coin) => sum + coin.coins_earned, 0) || 0,
          trainingModules: videos?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage interns, tasks, and system settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interns">Interns</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInterns}</div>
                <p className="text-xs text-muted-foreground">
                  Active interns in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Currently assigned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coins Distributed</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coinsDistributed}</div>
                <p className="text-xs text-muted-foreground">
                  Total rewards given
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.trainingModules}</div>
                <p className="text-xs text-muted-foreground">
                  Available modules
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent system activity to display.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interns">
          <InternManager />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManager />
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

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
