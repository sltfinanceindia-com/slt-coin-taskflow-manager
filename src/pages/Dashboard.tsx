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
import { InternManagement } from '@/components/InternManagement';
import { CoinManagement } from '@/components/CoinManagement';
import { MyCoins } from '@/components/MyCoins';
import { DashboardWidgets } from '@/components/DashboardWidgets';
import { ProjectManagement } from '@/components/ProjectManagement';
import { Coins, LogOut, User, Clock, CheckCircle, BarChart3, Users, Plus, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
                  alt="SLT Finance India"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
                <div className="hidden sm:block">
                  <h1 className="font-bold text-lg sm:text-xl text-primary">SLT Finance India</h1>
                  <p className="text-xs text-muted-foreground">Task Management System</p>
                </div>
              </div>
              <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {profile?.role === 'admin' ? 'Admin' : 'Intern'}
              </Badge>
            </div>
            
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Coins className="h-4 w-4 text-coin-gold" />
                <span className="font-semibold text-coin-gold text-sm sm:text-base">
                  {profile?.total_coins || 0}
                  <span className="hidden sm:inline"> SLT Coins</span>
                </span>
                {pendingCoins > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{pendingCoins}
                  </Badge>
                )}
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{profile?.full_name}</span>
              </div>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <UserCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
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
          <div className="w-full overflow-x-auto">
            <TabsList className={`grid w-full min-w-max ${profile?.role === 'admin' ? 'grid-cols-7' : 'grid-cols-5'} ${profile?.role === 'admin' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto`}>
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2 sm:px-4">Tasks</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs sm:text-sm px-2 sm:px-4">Projects</TabsTrigger>
              <TabsTrigger value="time" className="text-xs sm:text-sm px-2 sm:px-4">Time</TabsTrigger>
              {profile?.role === 'admin' && (
                <>
                  <TabsTrigger value="coins" className="text-xs sm:text-sm px-2 sm:px-4">Coins</TabsTrigger>
                  <TabsTrigger value="interns" className="text-xs sm:text-sm px-2 sm:px-4">Interns</TabsTrigger>
                </>
              )}
              {profile?.role === 'intern' && (
                <TabsTrigger value="my-coins" className="text-xs sm:text-sm px-2 sm:px-4">My Coins</TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <DashboardWidgets />
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

          <TabsContent value="projects">
            <ProjectManagement />
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

          {profile?.role === 'admin' && (
            <>
              <TabsContent value="coins">
                <CoinManagement />
              </TabsContent>

              <TabsContent value="interns">
                <InternManagement />
              </TabsContent>
            </>
          )}

          {profile?.role === 'intern' && (
            <TabsContent value="my-coins">
              <MyCoins />
            </TabsContent>
          )}

          <TabsContent value="analytics">
            <AnalyticsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}