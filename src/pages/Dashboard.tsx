import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { TimeLogDialog } from '@/components/TimeLogDialog';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { Coins, LogOut, User, Clock, CheckCircle, BarChart3, Users, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const { tasks, createTask, updateTaskStatus, verifyTask, isCreating } = useTasks();
  const { timeLogs, logTime, isLogging, getWeeklyHours } = useTimeLogs();
  const { getTotalEarned, getPendingCoins } = useCoinTransactions();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Coins className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  // Calculate stats
  const weeklyHours = getWeeklyHours();
  const myTasks = tasks.filter(task => 
    profile?.role === 'admin' ? true : task.assigned_to === profile?.id
  );
  const completedTasksCount = myTasks.filter(task => task.status === 'verified').length;
  const pendingCoins = getPendingCoins();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Coins className="h-6 w-6 text-coin-gold mr-2" />
                <h1 className="text-xl font-bold text-primary">SLT Finance India</h1>
              </div>
              <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                {profile?.role === 'admin' ? 'Admin' : 'Intern'}
              </Badge>
            </div>
            
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-coin-gold" />
                <span className="font-semibold text-coin-gold">
                  {profile?.total_coins || 0} SLT Coins
                </span>
                {pendingCoins > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{pendingCoins} pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{profile?.full_name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h2>
          <p className="text-muted-foreground">
            {profile?.role === 'admin' 
              ? 'Manage tasks, track progress, and assign SLT Coins to your team.'
              : 'View your assigned tasks, log your hours, and earn SLT Coins.'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time">Time Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total SLT Coins</CardTitle>
                  <Coins className="h-4 w-4 text-coin-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-coin-gold">
                    {profile?.total_coins || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Earned through completed tasks
                  </p>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {profile?.role === 'admin' ? 'Total Tasks' : 'My Tasks'}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTasksCount}/{myTasks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {profile?.role === 'admin' ? 'Team completion rate' : 'Tasks completed'}
                  </p>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyHours.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Time logged this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  {profile?.role === 'admin' 
                    ? 'Manage your team and track progress' 
                    : 'Manage your tasks and track your time'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.role === 'admin' ? (
                    <>
                      <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />
                      <Button 
                        variant="outline" 
                        className="h-20 text-left flex-col items-start justify-center hover-scale"
                        onClick={() => setActiveTab('analytics')}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <BarChart3 className="h-4 w-4" />
                          <span className="font-semibold">View Analytics</span>
                        </div>
                        <span className="text-sm opacity-80">Performance metrics & reports</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 text-left flex-col items-start justify-center hover-scale"
                        onClick={() => setActiveTab('tasks')}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">Manage Tasks</span>
                        </div>
                        <span className="text-sm opacity-80">Review and approve submissions</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 text-left flex-col items-start justify-center hover-scale"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">Team Overview</span>
                        </div>
                        <span className="text-sm opacity-80">Monitor team performance</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        className="h-20 text-left flex-col items-start justify-center hover-scale"
                        onClick={() => setActiveTab('tasks')}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">My Tasks</span>
                        </div>
                        <span className="text-sm opacity-80">View and update assigned tasks</span>
                      </Button>
                      <TimeLogDialog onLogTime={logTime} isLogging={isLogging} />
                      <Button 
                        variant="outline" 
                        className="h-20 text-left flex-col items-start justify-center hover-scale"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Coins className="h-4 w-4" />
                          <span className="font-semibold">My Coins</span>
                        </div>
                        <span className="text-sm opacity-80">View earnings and history</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 text-left flex-col items-start justify-center hover-scale"
                        onClick={() => setActiveTab('time')}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold">Time Logs</span>
                        </div>
                        <span className="text-sm opacity-80">View your logged hours</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {profile?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
                </h3>
                {profile?.role === 'admin' && (
                  <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {myTasks.length > 0 ? (
                  myTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={updateTaskStatus}
                      onVerifyTask={verifyTask}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        {profile?.role === 'admin' 
                          ? "Start by creating tasks for your team members."
                          : "No tasks have been assigned to you yet. Check back later!"
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Time Logs</h3>
                {profile?.role === 'intern' && (
                  <TimeLogDialog onLogTime={logTime} isLogging={isLogging} />
                )}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Time Entries</CardTitle>
                  <CardDescription>Track your working hours across tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeLogs.length > 0 ? (
                    <div className="space-y-4">
                      {timeLogs
                        .filter(log => profile?.role === 'admin' || log.user_id === profile?.id)
                        .slice(0, 10)
                        .map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{log.task?.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {log.description || 'No description'}
                              </p>
                              {profile?.role === 'admin' && (
                                <p className="text-xs text-muted-foreground">
                                  By: {log.user_profile?.full_name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{log.hours_worked}h</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(log.date_logged).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No time logs yet</h3>
                      <p className="text-muted-foreground">
                        Start logging your work hours to track your progress.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}