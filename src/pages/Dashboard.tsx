
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useOrganization } from '@/hooks/useOrganization';
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
import { EnhancedOverview } from '@/components/EnhancedOverview';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { ProjectManagement } from '@/components/ProjectManagement';
import { AttendanceTracker } from '@/components/attendance/AttendanceTracker';
import { Coins, LogOut, User, Clock, CheckCircle, BarChart3, Users, Plus, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin } = useUserRole();
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();
  const { startSession } = useSessionLogs();
  const { timeLogs, logTime, isLogging, getWeeklyHours } = useTimeLogs();
  const { getTotalEarned, getPendingCoins } = useCoinTransactions();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('overview');
  
  const coinName = organization?.coin_name || 'SLT Coins';

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
    try {
      const { error } = await signOut();
      
      // Always show success and redirect - state is cleared regardless of API response
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      // Force navigation to auth page after sign out
      window.location.href = '/auth';
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Even on error, force redirect to ensure clean state
      toast({
        title: "Signed Out",
        description: "Session ended. Redirecting to login.",
      });
      window.location.href = '/auth';
    }
  };

  // Calculate stats
  const weeklyHours = getWeeklyHours();
  const myTasks = tasks.filter(task => 
    isAdmin ? true : task.assigned_to === profile?.id
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
                  src="/slt-hub-icon.png" 
                  alt="SLT work HuB"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl text-primary">
                    <span className="font-black">SLT</span>
                    <span className="font-normal"> work </span>
                    <span className="font-black">HuB</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">Task Management System</p>
                </div>
              </div>
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                {isAdmin ? 'Admin' : 'Intern'}
              </Badge>
            </div>
            
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Coins className="h-4 w-4 text-coin-gold" />
                <span className="font-semibold text-coin-gold text-sm sm:text-base">
                  {profile?.total_coins || 0}
                  <span className="hidden sm:inline"> {coinName}</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            <span className="font-normal text-gray-600 dark:text-gray-400">Welcome back, </span>
            <span className="font-bold">{profile?.full_name}</span>!
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {isAdmin 
              ? `Manage tasks, track progress, and assign ${coinName} to your team.`
              : `View your assigned tasks, log your hours, and earn ${coinName}.`
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className={`grid w-full min-w-max ${isAdmin ? 'grid-cols-9' : 'grid-cols-7'} ${isAdmin ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`}>
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2 sm:px-4">Tasks</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs sm:text-sm px-2 sm:px-4">Projects</TabsTrigger>
              <TabsTrigger value="attendance" className="text-xs sm:text-sm px-2 sm:px-4">Attendance</TabsTrigger>
              <TabsTrigger value="time" className="text-xs sm:text-sm px-2 sm:px-4">Time Logs</TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="coins" className="text-xs sm:text-sm px-2 sm:px-4">Coins</TabsTrigger>
                  <TabsTrigger value="interns" className="text-xs sm:text-sm px-2 sm:px-4">Interns</TabsTrigger>
                </>
              )}
              {!isAdmin && (
                <TabsTrigger value="my-coins" className="text-xs sm:text-sm px-2 sm:px-4">My Coins</TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <EnhancedOverview />
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {isAdmin ? 'All Tasks' : 'My Tasks'}
                </h3>
                {isAdmin && (
                  <div className="flex gap-2">
                    <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />
                  </div>
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
                      onUpdateTask={updateTask}
                      isUpdating={isUpdating}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        {isAdmin 
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

          <TabsContent value="attendance">
            <AttendanceTracker />
          </TabsContent>

          <TabsContent value="time">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Time Logs</h3>
                {!isAdmin && (
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
                        .filter(log => isAdmin || log.user_id === profile?.id)
                        .slice(0, 10)
                        .map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{log.task?.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {log.description || 'No description'}
                              </p>
                              {isAdmin && (
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

          {isAdmin && (
            <>
              <TabsContent value="coins">
                <CoinManagement />
              </TabsContent>

              <TabsContent value="interns">
                <InternManagement />
              </TabsContent>
            </>
          )}

          {!isAdmin && (
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
