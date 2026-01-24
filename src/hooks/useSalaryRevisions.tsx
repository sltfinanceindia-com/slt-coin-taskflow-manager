import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SalaryRevision {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  previous_salary: number;
  new_salary: number;
  effective_date: string;
  revision_type: 'annual' | 'promotion' | 'special' | 'market_adjustment' | 'performance' | null;
  approved_by: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  remarks: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
  approver?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useSalaryRevisions() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const revisionsQuery = useQuery({
    queryKey: ['salary-revisions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('salary_revisions')
        .select(`
          *,
          employee:profiles!salary_revisions_employee_id_fkey(id, full_name, email, department),
          approver:profiles!salary_revisions_approved_by_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SalaryRevision[];
    },
    enabled: !!profile?.organization_id,
  });

  const createRevision = useMutation({
    mutationFn: async (revision: Omit<SalaryRevision, 'id' | 'created_at' | 'updated_at' | 'employee' | 'approver' | 'organization_id' | 'approved_by'> & { approved_by?: string | null }) => {
      const { data, error } = await supabase
        .from('salary_revisions')
        .insert({ ...revision, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-revisions'] });
      toast.success('Salary revision created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateRevision = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SalaryRevision> & { id: string }) => {
      const { data, error } = await supabase
        .from('salary_revisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-revisions'] });
      toast.success('Salary revision updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const approveRevision = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('salary_revisions')
        .update({ 
          status: 'approved', 
          approved_by: profile?.id 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-revisions'] });
      toast.success('Salary revision approved');
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectRevision = useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks: string }) => {
      const { data, error } = await supabase
        .from('salary_revisions')
        .update({ 
          status: 'rejected', 
          approved_by: profile?.id,
          remarks 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-revisions'] });
      toast.success('Salary revision rejected');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteRevision = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salary_revisions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-revisions'] });
      toast.success('Salary revision deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    revisions: revisionsQuery.data || [],
    isLoading: revisionsQuery.isLoading,
    error: revisionsQuery.error,
    createRevision,
    updateRevision,
    approveRevision,
    rejectRevision,
    deleteRevision,
  };
}
