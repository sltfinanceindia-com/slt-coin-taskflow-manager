/**
 * Overview Tab Component
 * Dashboard overview with widgets
 */

import { EnhancedDashboardWidgets } from '@/components/EnhancedDashboardWidgets';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';

export function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <DashboardBuilder />
      </div>
      <EnhancedDashboardWidgets />
    </div>
  );
}
