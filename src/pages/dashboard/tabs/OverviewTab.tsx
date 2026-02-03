/**
 * Overview Tab Component
 * Role-based dashboard with widgets
 */

import { useUserRole } from '@/hooks/useUserRole';
import { EnhancedDashboardWidgets } from '@/components/EnhancedDashboardWidgets';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';
import { 
  EmployeeDashboard, 
  ManagerDashboard, 
  HRAdminDashboard, 
  FinanceManagerDashboard, 
  ProjectManagerDashboard 
} from '@/components/dashboard';

export function OverviewTab() {
  const { role, isAdmin, isHRAdmin, isFinanceManager, isProjectManager, isManager, isTeamLead } = useUserRole();

  // Render role-specific dashboard
  const renderDashboard = () => {
    if (isHRAdmin && !isAdmin) return <HRAdminDashboard />;
    if (isFinanceManager && !isAdmin) return <FinanceManagerDashboard />;
    if (isProjectManager && !isAdmin) return <ProjectManagerDashboard />;
    if (isManager || isTeamLead) return <ManagerDashboard />;
    if (isAdmin) return <EnhancedDashboardWidgets />;
    return <EmployeeDashboard />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <DashboardBuilder />
      </div>
      {renderDashboard()}
    </div>
  );
}
