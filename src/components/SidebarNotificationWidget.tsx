import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingCounts {
  leaveRequests: number;
  wfhRequests: number;
  taskApprovals: number;
  shiftSwapRequests: number;
  workRequests: number;
}

export function usePendingCounts() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();

  return useQuery({
    queryKey: ['pending-counts', profile?.organization_id, isAdmin],
    queryFn: async (): Promise<PendingCounts> => {
      if (!profile?.organization_id) {
        return { leaveRequests: 0, wfhRequests: 0, taskApprovals: 0, shiftSwapRequests: 0, workRequests: 0 };
      }

      const counts: PendingCounts = {
        leaveRequests: 0,
        wfhRequests: 0,
        taskApprovals: 0,
        shiftSwapRequests: 0,
        workRequests: 0,
      };

      // Only fetch admin-related counts if user is admin
      if (isAdmin) {
        // Pending leave requests
        const { count: leaveCount } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', profile.organization_id)
          .eq('status', 'pending');
        counts.leaveRequests = leaveCount || 0;

        // Pending WFH requests
        const { count: wfhCount } = await supabase
          .from('wfh_requests')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', profile.organization_id)
          .eq('status', 'pending');
        counts.wfhRequests = wfhCount || 0;

        // Tasks pending verification
        const { count: taskCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', profile.organization_id)
          .eq('status', 'completed');
        counts.taskApprovals = taskCount || 0;

        // Pending work requests
        const { count: workRequestCount } = await supabase
          .from('work_requests')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', profile.organization_id)
          .in('status', ['pending', 'in_progress']);
        counts.workRequests = workRequestCount || 0;
      }

      // Shift swap requests (for all users - requests targeting them)
      const { count: swapCount } = await supabase
        .from('shift_swap_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .eq('target_employee_id', profile.id)
        .eq('status', 'pending');
      counts.shiftSwapRequests = swapCount || 0;

      return counts;
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

interface SidebarNotificationWidgetProps {
  collapsed?: boolean;
}

export function SidebarNotificationWidget({ collapsed }: SidebarNotificationWidgetProps) {
  const { data: counts, isLoading } = usePendingCounts();

  const totalPending = counts
    ? counts.leaveRequests + counts.wfhRequests + counts.taskApprovals + counts.shiftSwapRequests + counts.workRequests
    : 0;

  if (isLoading || totalPending === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
      collapsed && "justify-center px-2"
    )}>
      <Bell className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="text-sm font-medium truncate">
          {totalPending} pending
        </span>
      )}
      <Badge variant="secondary" className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs">
        {totalPending}
      </Badge>
    </div>
  );
}
