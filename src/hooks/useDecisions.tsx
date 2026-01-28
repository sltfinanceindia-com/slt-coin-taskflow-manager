import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Decision {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  context: string | null;
  alternatives: string[] | null;
  rationale: string | null;
  impact: 'low' | 'medium' | 'high' | null;
  status: 'pending' | 'approved' | 'implemented' | 'rejected' | null;
  decision_maker_id: string | null;
  stakeholders: string[] | null;
  decision_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  decision_maker?: { full_name: string } | null;
}

export type CreateDecisionData = Omit<Decision, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'decision_maker'>;

export function useDecisions() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const decisionsQuery = useQuery({
    queryKey: ['decisions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('decisions')
        .select('*, decision_maker:profiles!decision_maker_id(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Decision[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (decision: CreateDecisionData) => {
      const { data, error } = await supabase
        .from('decisions')
        .insert({
          ...decision,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      toast({
        title: 'Decision Recorded',
        description: 'Decision has been saved successfully.',
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Decision> & { id: string }) => {
      const { data, error } = await supabase
        .from('decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      toast({
        title: 'Decision Updated',
        description: 'Decision has been updated successfully.',
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
        .from('decisions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      toast({
        title: 'Decision Deleted',
        description: 'Decision has been removed.',
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
    decisions: decisionsQuery.data || [],
    isLoading: decisionsQuery.isLoading,
    error: decisionsQuery.error,
    createDecision: createMutation.mutateAsync,
    updateDecision: updateMutation.mutateAsync,
    deleteDecision: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
