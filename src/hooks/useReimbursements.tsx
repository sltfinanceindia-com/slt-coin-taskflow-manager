import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Reimbursement {
  id: string;
  organization_id: string | null;
  employee_id: string;
  category: string;
  amount: number;
  description: string | null;
  receipt_url: string | null;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'paid';
  submitted_date: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  payment_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  approver?: {
    id: string;
    full_name: string | null;
  };
}

export type ReimbursementInput = {
  category: string;
  amount: number;
  description?: string;
  receipt_url?: string;
};

export function useReimbursements() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all reimbursements for the organization
  const reimbursementsQuery = useQuery({
    queryKey: ['reimbursements', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await (supabase as any)
        .from('reimbursements')
        .select(`
          *,
          employee:employee_id(id, full_name, email, avatar_url),
          approver:approved_by(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('submitted_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Reimbursement[];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch my reimbursements only
  const myReimbursementsQuery = useQuery({
    queryKey: ['my-reimbursements', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await (supabase as any)
        .from('reimbursements')
        .select('*')
        .eq('employee_id', profile.id)
        .order('submitted_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Reimbursement[];
    },
    enabled: !!profile?.id,
  });

  // Create reimbursement
  const createMutation = useMutation({
    mutationFn: async (input: ReimbursementInput) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await (supabase as any)
        .from('reimbursements')
        .insert({
          ...input,
          organization_id: profile.organization_id,
          employee_id: profile.id,
          status: 'pending',
          submitted_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      queryClient.invalidateQueries({ queryKey: ['my-reimbursements'] });
      toast.success('Reimbursement claim submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit reimbursement claim');
    },
  });

  // Approve reimbursement
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!profile?.id) throw new Error('User not authenticated');
      
      const { data, error } = await (supabase as any)
        .from('reimbursements')
        .update({
          status: 'approved',
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      toast.success('Reimbursement approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve reimbursement');
    },
  });

  // Reject reimbursement
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      if (!profile?.id) throw new Error('User not authenticated');
      
      const { data, error } = await (supabase as any)
        .from('reimbursements')
        .update({
          status: 'rejected',
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      toast.success('Reimbursement rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject reimbursement');
    },
  });

  // Mark as paid
  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase as any)
        .from('reimbursements')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      toast.success('Reimbursement marked as paid');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update reimbursement');
    },
  });

  // Calculate stats
  const reimbursements = reimbursementsQuery.data || [];
  const myReimbursements = myReimbursementsQuery.data || [];
  
  const stats = {
    pendingCount: reimbursements.filter(r => r.status === 'pending').length,
    approvedAmount: reimbursements
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + Number(r.amount), 0),
    processingAmount: reimbursements
      .filter(r => r.status === 'processing')
      .reduce((sum, r) => sum + Number(r.amount), 0),
    myPendingAmount: myReimbursements
      .filter(r => r.status === 'pending' || r.status === 'approved')
      .reduce((sum, r) => sum + Number(r.amount), 0),
  };

  return {
    reimbursements,
    myReimbursements,
    isLoading: reimbursementsQuery.isLoading,
    error: reimbursementsQuery.error,
    stats,
    createReimbursement: createMutation.mutateAsync,
    approveReimbursement: approveMutation.mutateAsync,
    rejectReimbursement: rejectMutation.mutateAsync,
    markAsPaid: markPaidMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isApproving: approveMutation.isPending,
  };
}
