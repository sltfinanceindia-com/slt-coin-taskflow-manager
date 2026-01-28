import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ShiftSwap {
  id: string;
  organization_id: string;
  requester_id: string;
  target_id: string;
  original_shift: string;
  requested_shift: string;
  swap_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  requester?: { full_name: string } | null;
  target?: { full_name: string } | null;
}

export type CreateShiftSwapData = Omit<ShiftSwap, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'requester' | 'target' | 'approved_by' | 'status'>;

export function useShiftSwaps() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const swapsQuery = useQuery({
    queryKey: ['shift-swaps', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('shift_swaps')
        .select('*, requester:profiles!requester_id(full_name), target:profiles!target_id(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShiftSwap[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (swap: CreateShiftSwapData) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .insert({
          ...swap,
          organization_id: profile?.organization_id,
          requester_id: profile?.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: 'Swap Request Submitted',
        description: 'Your shift swap request has been submitted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .update({ status: 'approved', approved_by: profile?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: 'Swap Approved',
        description: 'Shift swap request has been approved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .update({ status: 'rejected', approved_by: profile?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: 'Swap Rejected',
        description: 'Shift swap request has been rejected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_swaps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: 'Request Deleted',
        description: 'Shift swap request has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    shiftSwaps: swapsQuery.data || [],
    isLoading: swapsQuery.isLoading,
    error: swapsQuery.error,
    createShiftSwap: createMutation.mutateAsync,
    approveShiftSwap: approveMutation.mutate,
    rejectShiftSwap: rejectMutation.mutate,
    deleteShiftSwap: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
