import { useMemo, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useViewMode } from '@/hooks/useViewMode';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrganization } from '@/hooks/useOrganization';
import { useTabPersistence } from '@/hooks/useTabPersistence';
import { Navigate, useNavigate } from 'react-router-dom';
import { getTabComponent } from './dashboard/tab-registry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { TimeLogDialog } from '@/components/TimeLogDialog';
import { EnhancedDashboardWidgets } from '@/components/EnhancedDashboardWidgets';
import { TabBasedKanban } from '@/components/kanban/TabBasedKanban';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/BottomNavigation';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';
import { BreadcrumbNav, BreadcrumbItem } from '@/components/navigation/BreadcrumbNav';
import { getNavGroupsForRole } from '@/config/navigation/index';
import type { AppRole, NavItem } from '@/config/navigation/types';

import { Coins, Clock, CheckCircle, Plus, Crown, ArrowRight, Shield, Building2 } from 'lucide-react';

export default function ModernDashboard() {
  const { user, profile, loading } = useAuth();
  const { role, isSuperAdmin, isAdmin, isLoading: roleLoading, organizationId } = useUserRole();
  const { isViewingSuperAdmin, isViewingOrgAdmin, canSwitchView } = useViewMode();
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();
  const { timeLogs, logTime, isLogging } = useTimeLogs();
  const { organization } = useOrganization();
  const { activeTab, setActiveTab } = useTabPersistence({
    defaultTab: 'overview',
    paramName: 'tab',
    storageKey: 'dashboard_active_tab'
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const coinName = organization?.coin_name || 'Coins';

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
    // Handle special tabs that need inline logic or redirects
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-end gap-2">
              <DashboardBuilder />
            </div>
            <EnhancedDashboardWidgets />
          </div>
        );
      
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
              <TabBasedKanban
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
              <TabBasedKanban
                tasks={myTasks}
                onUpdateStatus={updateTaskStatus}
                onVerifyTask={verifyTask}
                onUpdateTask={updateTask}
                isUpdating={isUpdating}
              />
            </div>
          );
        }
      
      case 'time':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">Time Logs</h3>
                <p className="text-muted-foreground text-sm">Track your working hours across tasks</p>
              </div>
              {(role === 'intern' || role === 'employee') && (
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
      
      case 'training':
        // Redirect to standalone training page
        navigate('/training');
        return null;
      
      case 'roles':
        // Redirect to standalone roles page
        navigate('/admin/roles-permissions');
        return null;
      
      case 'org-chart':
        // Redirect to standalone org chart page
        navigate('/organization/chart');
        return null;
      
      default:
        // Load all other tabs dynamically from tab registry
        const tabConfig = getTabComponent(activeTab, isAdmin);
        if (tabConfig) {
          const TabComponent = tabConfig.component;
          return (
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            }>
              <TabComponent />
            </Suspense>
          );
        }
        return <EnhancedDashboardWidgets />;
    }
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Admin'; // Same as admin
      case 'admin': return 'Admin';
      case 'hr_admin': return 'HR Admin';
      case 'project_manager': return 'Project Manager';
      case 'finance_manager': return 'Finance Manager';
      case 'manager': return 'Manager';
      case 'team_lead': return 'Team Lead';
      case 'employee': return 'Employee';
      case 'intern': return 'Intern';
      default: return 'User';
    }
  };

  // Generate breadcrumb items based on active tab
  const getBreadcrumbItems = (tab: string, userRole: AppRole): BreadcrumbItem[] => {
    const navGroups = getNavGroupsForRole(userRole);
    
    // Find the group and item for this tab
    for (const group of navGroups) {
      const item = group.items.find((i: NavItem) => i.url === tab || i.url.split('?')[0] === tab);
      if (item) {
        return [
          { label: group.label },
          { label: item.title }
        ];
      }
    }
    
    // Fallback - safely show the tab name
    const tabStr = typeof tab === 'string' ? tab : 'overview';
    return [{ label: tabStr.charAt(0).toUpperCase() + tabStr.slice(1).replace(/-/g, ' ') }];
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AppHeader />
          
          <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0" role="main">
            {/* Full-screen communication on mobile */}
            {activeTab === 'communication' && isMobile ? (
              <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              }>
                {(() => {
                  const tabConfig = getTabComponent('communication', isAdmin);
                  if (tabConfig) {
                    const TabComponent = tabConfig.component;
                    return (
                      <div className="h-full">
                        <TabComponent />
                      </div>
                    );
                  }
                  return null;
                })()}
              </Suspense>
            ) : (
              <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6">
                {/* Breadcrumb Navigation */}
                {activeTab !== 'overview' && !(activeTab === 'communication' && isMobile) && (
                  <BreadcrumbNav 
                    items={getBreadcrumbItems(activeTab, role as AppRole)} 
                    className="mb-3 sm:mb-4"
                  />
                )}


                {/* Main Content Area */}
                {renderTabContent()}
              </div>
            )}
          </main>
          
          {/* Mobile Bottom Navigation */}
          <BottomNavigation variant="private" activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </SidebarProvider>
  );
}
