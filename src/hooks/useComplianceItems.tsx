import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export interface ComplianceItem {
  id: string;
  organization_id: string | null;
  name: string;
  type: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'upcoming';
  last_filed?: string | null;
  amount?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Generate dynamic compliance items based on current date
function generateComplianceSchedule(): Omit<ComplianceItem, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[] {
  const now = new Date();
  
  return [
    {
      name: 'PF Monthly Return',
      type: 'pf',
      due_date: format(addDays(now, 5), 'yyyy-MM-dd'),
      status: 'pending',
      amount: null,
    },
    {
      name: 'ESI Contribution',
      type: 'esi',
      due_date: format(addDays(now, 10), 'yyyy-MM-dd'),
      status: 'pending',
      amount: null,
    },
    {
      name: 'Professional Tax',
      type: 'pt',
      due_date: format(addDays(now, 15), 'yyyy-MM-dd'),
      status: 'upcoming',
      amount: null,
    },
    {
      name: 'TDS Quarterly Return',
      type: 'tds',
      due_date: format(addDays(now, 30), 'yyyy-MM-dd'),
      status: 'upcoming',
      last_filed: null,
    },
    {
      name: 'LWF Contribution',
      type: 'lwf',
      due_date: format(addDays(now, 20), 'yyyy-MM-dd'),
      status: 'upcoming',
      amount: null,
    },
  ];
}

export function useComplianceItems() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const complianceQuery = useQuery({
    queryKey: ['compliance-items', profile?.organization_id],
    queryFn: async (): Promise<ComplianceItem[]> => {
      // Generate dynamic schedule based on current date
      // In future, this can be stored in a database table
      const schedule = generateComplianceSchedule();
      
      return schedule.map((item, index) => ({
        ...item,
        id: `compliance-${index + 1}`,
        organization_id: profile?.organization_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ComplianceItem['status'] }) => {
      // In future, update the database
      toast.success(`Compliance item marked as ${status}`);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-items'] });
    },
  });

  return {
    complianceItems: complianceQuery.data || [],
    isLoading: complianceQuery.isLoading,
    error: complianceQuery.error,
    updateStatus,
  };
}
