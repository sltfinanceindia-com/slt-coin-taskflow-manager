import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useViewMode } from '@/hooks/useViewMode';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrganization } from '@/hooks/useOrganization';
import { useTabPersistence } from '@/hooks/useTabPersistence';
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
import { ProjectPortfolioHub } from '@/components/project/ProjectPortfolioHub';
import { ProjectScheduleHub } from '@/components/project/ProjectScheduleHub';
import { TabBasedKanban } from '@/components/kanban/TabBasedKanban';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import ModernCommunication from '@/components/ModernCommunication';
import { Button } from '@/components/ui/button';
import { ShiftManagement } from '@/components/workforce/ShiftManagement';
import { LeaveManagement } from '@/components/workforce/LeaveManagement';
import { GeoAttendance } from '@/components/workforce/GeoAttendance';
import { WFHManagement } from '@/components/workforce/WFHManagement';
import { FeedbackManagement } from '@/components/performance/FeedbackManagement';
import { OKRManagement } from '@/components/performance/OKRManagement';
import { OneOnOneMeetings } from '@/components/performance/OneOnOneMeetings';
import { PIPManagement } from '@/components/performance/PIPManagement';
import { ProjectUpdatesFeed } from '@/components/updates/ProjectUpdatesFeed';
import { WorkHealthDashboard } from '@/components/health/WorkHealthDashboard';
import { AutomationBuilder } from '@/components/automation/AutomationBuilder';
import { RuleTemplates } from '@/components/automation/RuleTemplates';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { ApprovalCenter } from '@/components/approvals/ApprovalCenter';
import { ApprovalWorkflowConfig } from '@/components/approvals/ApprovalWorkflowConfig';
import { CapacityHub } from '@/components/capacity/CapacityHub';
import { RequestHub } from '@/components/requests/RequestHub';
import { ProjectBaselineHub } from '@/components/baselines/ProjectBaselineHub';
import { ChangeRequestHub } from '@/components/changes/ChangeRequestHub';
import { ScoringHub } from '@/components/scoring/ScoringHub';
import { AuditHub } from '@/components/audit/AuditHub';
import { LifecycleHub } from '@/components/lifecycle/LifecycleHub';
import { BottomNavigation } from '@/components/BottomNavigation';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import { OrganizationCalendar } from '@/components/OrganizationCalendar';
import { PayrollDashboard } from '@/components/payroll/PayrollDashboard';
import { ExpenseManagement } from '@/components/expenses/ExpenseManagement';
import { DocumentManager } from '@/components/documents/DocumentManager';
import { AssetManagement } from '@/components/assets/AssetManagement';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { TimesheetManager } from '@/components/timesheet/TimesheetManager';
import { HolidayCalendar } from '@/components/workforce/HolidayCalendar';
import { LoanManagement } from '@/components/loans/LoanManagement';
import { ExpenseCategoryManager } from '@/components/expenses/ExpenseCategoryManager';
import { GanttChart } from '@/components/project/GanttChart';
import { EmployeeSelfServicePortal } from '@/components/employee/EmployeeSelfServicePortal';
import { KudosWall } from '@/components/kudos/KudosWall';
import { PulseSurveyWidget } from '@/components/pulse/PulseSurveyWidget';
import { PulseSurveyAdmin } from '@/components/pulse/PulseSurveyAdmin';
import { PersonalGoalsWidget } from '@/components/goals/PersonalGoalsWidget';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';
import { QuickActionsMenu } from '@/components/QuickActionsMenu';

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
      
      case 'projects':
        return <ProjectPortfolioHub />;
      
      case 'calendar':
        return <OrganizationCalendar />;
      
      case 'training':
        // Redirect to standalone training page
        navigate('/training');
        return null;
      
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
      
      case 'coins':
        return isAdmin ? <CoinManagement /> : null;
      
      case 'interns':
        return isAdmin ? <InternManagement /> : null;
      
      case 'my-coins':
        return (role === 'intern' || role === 'employee') ? <MyCoins /> : null;
      
      case 'analytics':
        return <AnalyticsPage />;
      
      case 'shifts':
        return isAdmin ? <ShiftManagement /> : null;
      
      case 'leave':
        return <LeaveManagement />;
      
      case 'attendance':
        return <GeoAttendance />;
      
      case 'wfh':
        return <WFHManagement />;
      
      case 'okrs':
        return <OKRManagement />;
      
      case 'feedback':
        return isAdmin ? <FeedbackManagement /> : null;
      
      case 'meetings':
        return <OneOnOneMeetings />;
      
      case 'pips':
        return isAdmin ? <PIPManagement /> : null;
      
      case 'communication':
        return (
          <div className="h-[calc(100vh-16rem)] min-h-[500px]">
            <ModernCommunication />
          </div>
        );
      
      case 'updates':
        return <ProjectUpdatesFeed />;
      
      case 'work-health':
        return isAdmin ? <WorkHealthDashboard /> : null;
      
      case 'automation':
        return isAdmin ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AutomationBuilder />
            </div>
            <div>
              <RuleTemplates />
            </div>
          </div>
        ) : null;
      
      case 'templates':
        return isAdmin ? (
          <div className="space-y-6">
            <TemplateLibrary />
            <TemplateBuilder />
          </div>
        ) : null;
      
      case 'approvals':
        return (
          <div className="space-y-6">
            <ApprovalCenter />
            {isAdmin && <ApprovalWorkflowConfig />}
          </div>
        );
      
      case 'capacity':
        return isAdmin ? <CapacityHub /> : null;
      
      case 'requests':
        return <RequestHub />;
      
      case 'baselines':
        return isAdmin ? <ProjectBaselineHub /> : null;
      
      case 'changes':
        return isAdmin ? <ChangeRequestHub /> : null;
      
      case 'scoring':
        return isAdmin ? <ScoringHub /> : null;
      
      case 'audit':
        return isAdmin ? <AuditHub /> : null;
      
      case 'lifecycle':
        return isAdmin ? <LifecycleHub /> : null;
      
      case 'payroll':
        return isAdmin ? <PayrollDashboard /> : null;
      
      case 'expenses':
        return <ExpenseManagement />;
      
      case 'documents':
        return <DocumentManager />;
      
      case 'assets':
        return isAdmin ? <AssetManagement /> : null;
      
      case 'reports':
        return isAdmin ? <CustomReportBuilder /> : null;
      
      case 'roles':
        // Redirect to standalone roles page
        navigate('/admin/roles-permissions');
        return null;
      
      case 'org-chart':
        // Redirect to standalone org chart page
        navigate('/organization/chart');
        return null;
      
      case 'app-feedback':
        return <FeedbackForm userEmail={profile?.email} userName={profile?.full_name} />;
      
      case 'timesheets':
        return <TimesheetManager />;
      
      case 'holidays':
        return isAdmin ? <HolidayCalendar /> : null;
      
      case 'loans':
        return <LoanManagement />;
      
      case 'expense-categories':
        return isAdmin ? <ExpenseCategoryManager /> : null;
      
      case 'gantt':
        return <GanttChart />;
      
      case 'self-service':
        return <EmployeeSelfServicePortal />;
      
      case 'kudos':
        return <KudosWall />;
      
      case 'pulse-surveys':
        return isAdmin ? <PulseSurveyAdmin /> : <PulseSurveyWidget />;
      
      case 'my-goals':
        return <PersonalGoalsWidget />;
      
      default:
        return <EnhancedDashboardWidgets />;
    }
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Admin'; // Same as admin
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'team_lead': return 'Team Lead';
      case 'employee': return 'Employee';
      case 'intern': return 'Intern';
      default: return 'User';
    }
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
              <div className="h-full">
                <ModernCommunication />
              </div>
            ) : (
              <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6">
                {/* Super Admin Banner removed - use header toggle instead */}

                {/* Header - hide on communication tab on mobile */}
                {!(activeTab === 'communication' && isMobile) && (
                  <header className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 mb-2">
                      <h1 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight break-words hyphens-auto">
                        Welcome back, {profile?.full_name?.split(' ')[0] || profile?.full_name}!
                      </h1>
                      <Badge variant="outline" className="w-fit text-xs">
                        {getRoleDisplayName()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed">
                      {isAdmin 
                        ? `Manage tasks, track progress, and assign ${coinName} to your team.`
                        : `View your assigned tasks, log your hours, and earn ${coinName}.`
                      }
                    </p>
                  </header>
                )}
                
                <div className="animate-fade-in w-full">
                  {renderTabContent()}
                </div>
              </div>
            )}
          </main>
        </div>
        
        {/* Bottom Navigation for Mobile */}
        <BottomNavigation variant="private" activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Quick Actions Menu for Mobile */}
        <QuickActionsMenu />
      </div>
    </SidebarProvider>
  );
}