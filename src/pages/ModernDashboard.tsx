import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useViewMode } from '@/hooks/useViewMode';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { Navigate, useNavigate } from 'react-router-dom';
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
import { EnhancedAttendanceTracker } from '@/components/attendance/EnhancedAttendanceTracker';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import ModernCommunication from '@/components/ModernCommunication';
import { Button } from '@/components/ui/button';

import { Coins, Clock, CheckCircle, Plus, Crown, ArrowRight, Shield, Building2 } from 'lucide-react';

export default function ModernDashboard() {
  const { user, profile, loading } = useAuth();
  const { role, isSuperAdmin, isAdmin, isLoading: roleLoading, organizationId } = useUserRole();
  const { isViewingSuperAdmin, isViewingOrgAdmin, canSwitchView } = useViewMode();
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();
  const { timeLogs, logTime, isLogging } = useTimeLogs();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  if (loading || roleLoading) {
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

  // Super admins can access org dashboard if they have an organization
  // Show a banner to go to super admin panel instead of auto-redirect

  const myTasks = tasks.filter(task => 
    isAdmin ? true : task.assigned_to === profile?.id
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EnhancedDashboardWidgets />;
      
      case 'tasks':
        if (isAdmin) {
          return (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Task Management</h2>
                  <p className="text-muted-foreground text-sm">Create and manage tasks for your team</p>
                </div>
                <div className="flex-shrink-0">
                  <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />
                </div>
              </div>
              <KanbanBoard
                tasks={myTasks}
                onUpdateStatus={updateTaskStatus}
                onVerifyTask={verifyTask}
                onUpdateTask={updateTask}
                isUpdating={isUpdating}
              />
            </div>
          );
        } else {
          return (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">My Tasks</h2>
                <p className="text-muted-foreground text-sm">View and manage your assigned tasks</p>
              </div>
              <KanbanBoard
                tasks={myTasks}
                onUpdateStatus={updateTaskStatus}
                onVerifyTask={verifyTask}
                onUpdateTask={updateTask}
                isUpdating={isUpdating}
              />
            </div>
          );
        }
      
      case 'projects':
        return <ProjectManagement />;
      
      case 'training':
        window.location.href = '/training';
        return null;
      
      case 'time':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">Time Logs</h3>
                <p className="text-muted-foreground text-sm">Track your working hours across tasks</p>
              </div>
              {role === 'intern' && (
                <div className="flex-shrink-0">
                  <TimeLogDialog onLogTime={logTime} isLogging={isLogging} />
                </div>
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
                      .filter(log => isAdmin || log.user_id === profile?.id)
                      .slice(0, 10)
                      .map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover-scale">
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
        );
      
      case 'coins':
        return isAdmin ? <CoinManagement /> : null;
      
      case 'interns':
        return isAdmin ? <InternManagement /> : null;
      
      case 'my-coins':
        return role === 'intern' ? <MyCoins /> : null;
      
      case 'analytics':
        return <AnalyticsPage />;
      
      case 'attendance':
        return isAdmin ? <EnhancedAttendanceTracker /> : null;
      
      case 'communication':
          return <ModernCommunication />;
      
      default:
        return <EnhancedDashboardWidgets />;
    }
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Organization Admin';
      case 'admin': return 'Admin';
      case 'intern': return 'Team Member';
      case 'employee': return 'Employee';
      default: return 'User';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AppHeader />
          
          <main id="main-content" className="flex-1 overflow-auto" role="main">
            <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6">
              {/* Super Admin Banner - only show when viewing as org admin */}
              {isSuperAdmin && isViewingOrgAdmin && (
                <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-800/50 px-2 py-0.5 rounded">
                        Organization View
                      </span>
                    </div>
                    <span className="text-sm text-purple-800 dark:text-purple-200">
                      Switch to Super Admin for platform management.
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/super-admin')}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/50 w-full sm:w-auto"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Super Admin Panel
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              <header className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
                    Welcome back, {profile?.full_name}!
                  </h1>
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {getRoleDisplayName()}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed">
                  {isAdmin 
                    ? 'Manage tasks, track progress, and assign SLT Coins to your team.'
                    : 'View your assigned tasks, log your hours, and earn SLT Coins.'
                  }
                </p>
              </header>
              
              <div className="animate-fade-in w-full">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}