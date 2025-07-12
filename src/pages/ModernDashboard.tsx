import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { TimeLogDialog } from '@/components/TimeLogDialog';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { InternManagement } from '@/components/InternManagement';
import { CoinManagement } from '@/components/CoinManagement';
import { MyCoins } from '@/components/MyCoins';
import { EnhancedDashboardWidgets } from '@/components/EnhancedDashboardWidgets';
import { ProjectManagement } from '@/components/ProjectManagement';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Coins, Clock, CheckCircle, Plus } from 'lucide-react';

export default function ModernDashboard() {
  const { user, profile, loading } = useAuth();
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();
  const { timeLogs, logTime, isLogging } = useTimeLogs();
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

  const myTasks = tasks.filter(task => 
    profile?.role === 'admin' ? true : task.assigned_to === profile?.id
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EnhancedDashboardWidgets />;
      
      case 'tasks':
        return (
          <KanbanBoard
            tasks={myTasks}
            onUpdateStatus={updateTaskStatus}
            onVerifyTask={verifyTask}
            onUpdateTask={updateTask}
            isUpdating={isUpdating}
          />
        );
      
      case 'projects':
        return <ProjectManagement />;
      
      case 'training':
        // Redirect to training page instead of inline component
        window.location.href = '/training';
        return null;
      
      case 'time':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Time Logs</h3>
                <p className="text-muted-foreground">Track your working hours across tasks</p>
              </div>
              {profile?.role === 'intern' && (
                <TimeLogDialog onLogTime={logTime} isLogging={isLogging} />
              )}
            </div>
            
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
                <CardDescription>Your latest time logs and activity</CardDescription>
              </CardHeader>
              <CardContent>
                {timeLogs.length > 0 ? (
                  <div className="space-y-4">
                    {timeLogs
                      .filter(log => profile?.role === 'admin' || log.user_id === profile?.id)
                      .slice(0, 10)
                      .map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover-scale">
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
        );
      
      case 'coins':
        return profile?.role === 'admin' ? <CoinManagement /> : null;
      
      case 'interns':
        return profile?.role === 'admin' ? <InternManagement /> : null;
      
      case 'my-coins':
        return profile?.role === 'intern' ? <MyCoins /> : null;
      
      case 'analytics':
        return <AnalyticsPage />;
      
      default:
        return <EnhancedDashboardWidgets />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                  Welcome back, {profile?.full_name}!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-lg">
                  {profile?.role === 'admin' 
                    ? 'Manage tasks, track progress, and assign SLT Coins to your team.'
                    : 'View your assigned tasks, log your hours, and earn SLT Coins.'
                  }
                </p>
              </div>
              
              <div className="animate-fade-in">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}