import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FnFSettlement {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  last_working_day: string;
  notice_period_days: number | null;
  notice_served_days: number | null;
  basic_salary: number | null;
  leave_encashment: number | null;
  gratuity: number | null;
  bonus: number | null;
  other_earnings: number | null;
  notice_recovery: number | null;
  loan_recovery: number | null;
  other_deductions: number | null;
  net_payable: number | null;
  status: 'pending' | 'processing' | 'completed' | 'disputed';
  clearance_hr: boolean | null;
  clearance_it: boolean | null;
  clearance_finance: boolean | null;
  clearance_admin: boolean | null;
  clearance_manager: boolean | null;
  processed_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: { id: string; full_name: string | null; department: string | null } | null;
}

export function useFnFSettlements() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const settlementsQuery = useQuery({
    queryKey: ['fnf-settlements', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from('fnf_settlements').select(`*, employee:profiles!fnf_settlements_employee_id_fkey(id, full_name, department)`).eq('organization_id', profile.organization_id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as FnFSettlement[];
    },
    enabled: !!profile?.organization_id,
  });

  const createSettlement = useMutation({
    mutationFn: async (settlement: Omit<FnFSettlement, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase.from('fnf_settlements').insert({ ...settlement, organization_id: profile?.organization_id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fnf-settlements'] }); toast.success('F&F settlement created'); },
    onError: (error) => toast.error(error.message),
  });

  const updateSettlement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FnFSettlement> & { id: string }) => {
      const { data, error } = await supabase.from('fnf_settlements').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fnf-settlements'] }); toast.success('F&F settlement updated'); },
    onError: (error) => toast.error(error.message),
  });

  return { settlements: settlementsQuery.data || [], isLoading: settlementsQuery.isLoading, error: settlementsQuery.error, createSettlement, updateSettlement };
}
