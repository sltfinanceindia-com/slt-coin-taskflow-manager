/**
 * Approvals Tab Component
 * Approval center and workflow config
 */

import { useUserRole } from '@/hooks/useUserRole';
import { ApprovalCenter } from '@/components/approvals/ApprovalCenter';
import { ApprovalWorkflowConfig } from '@/components/approvals/ApprovalWorkflowConfig';

export function ApprovalsTab() {
  const { isAdmin } = useUserRole();
  
  return (
    <div className="space-y-6">
      <ApprovalCenter />
      {isAdmin && <ApprovalWorkflowConfig />}
    </div>
  );
}
