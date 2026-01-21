import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SuccessionPlan {
  id: string;
  organization_id: string | null;
  position: string;
  current_holder_id: string | null;
  department: string | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  current_holder?: { id: string; full_name: string | null } | null;
  candidates?: SuccessionCandidate[];
}

export interface SuccessionCandidate {
  id: string;
  succession_plan_id: string | null;
  candidate_id: string | null;
  readiness: 'ready_now' | 'ready_1yr' | 'ready_2yr';
  readiness_score: number | null;
  development_areas: string[] | null;
  candidate?: { id: string; full_name: string | null } | null;
}

export function useSuccessionPlans() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['succession-plans', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from('succession_plans').select(`*, current_holder:profiles!succession_plans_current_holder_id_fkey(id, full_name)`).eq('organization_id', profile.organization_id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as SuccessionPlan[];
    },
    enabled: !!profile?.organization_id,
  });

  const createPlan = useMutation({
    mutationFn: async (plan: Omit<SuccessionPlan, 'id' | 'created_at' | 'updated_at' | 'current_holder' | 'candidates'>) => {
      const { data, error } = await supabase.from('succession_plans').insert({ ...plan, organization_id: profile?.organization_id, created_by: profile?.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['succession-plans'] }); toast.success('Succession plan created'); },
    onError: (error) => toast.error(error.message),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SuccessionPlan> & { id: string }) => {
      const { data, error } = await supabase.from('succession_plans').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['succession-plans'] }); toast.success('Succession plan updated'); },
    onError: (error) => toast.error(error.message),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('succession_plans').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['succession-plans'] }); toast.success('Succession plan deleted'); },
    onError: (error) => toast.error(error.message),
  });

  return { plans: plansQuery.data || [], isLoading: plansQuery.isLoading, error: plansQuery.error, createPlan, updatePlan, deletePlan };
}
