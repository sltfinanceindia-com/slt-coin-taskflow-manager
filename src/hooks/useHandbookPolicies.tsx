import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface HandbookPolicy {
  id: string;
  organization_id: string | null;
  title: string;
  category: string;
  content: string;
  version: string | null;
  status: 'draft' | 'published' | 'archived';
  effective_date: string | null;
  acknowledgment_required: boolean | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  acknowledgment_count?: number;
}

export interface PolicyAcknowledgment {
  id: string;
  organization_id: string | null;
  policy_id: string | null;
  employee_id: string | null;
  acknowledged_at: string | null;
}

export function useHandbookPolicies() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const policiesQuery = useQuery({
    queryKey: ['handbook-policies', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('handbook_policies')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('category', { ascending: true })
        .order('title', { ascending: true });
      if (error) throw error;
      return data as HandbookPolicy[];
    },
    enabled: !!profile?.organization_id,
  });

  const createPolicy = useMutation({
    mutationFn: async (policy: Omit<HandbookPolicy, 'id' | 'created_at' | 'updated_at' | 'acknowledgment_count'>) => {
      const { data, error } = await supabase
        .from('handbook_policies')
        .insert({ 
          ...policy, 
          organization_id: profile?.organization_id,
          created_by: profile?.id 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handbook-policies'] });
      toast.success('Policy created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HandbookPolicy> & { id: string }) => {
      const { data, error } = await supabase
        .from('handbook_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handbook-policies'] });
      toast.success('Policy updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('handbook_policies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handbook-policies'] });
      toast.success('Policy deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const acknowledgePolicy = useMutation({
    mutationFn: async (policyId: string) => {
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .insert({ 
          policy_id: policyId,
          employee_id: profile?.id,
          organization_id: profile?.organization_id
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handbook-policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy-acknowledgments'] });
      toast.success('Policy acknowledged');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    policies: policiesQuery.data || [],
    isLoading: policiesQuery.isLoading,
    error: policiesQuery.error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    acknowledgePolicy,
  };
}
