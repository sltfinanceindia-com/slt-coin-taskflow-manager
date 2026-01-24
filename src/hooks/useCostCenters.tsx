import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CostCenter {
  id: string;
  organization_id: string | null;
  code: string;
  name: string;
  department: string | null;
  manager_id: string | null;
  budget: number | null;
  actual_spend: number | null;
  headcount: number | null;
  status: 'active' | 'inactive' | 'frozen';
  created_at: string | null;
  updated_at: string | null;
  manager?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useCostCenters() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const costCentersQuery = useQuery({
    queryKey: ['cost-centers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('cost_centers')
        .select(`
          *,
          manager:profiles!cost_centers_manager_id_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('code', { ascending: true });
      if (error) throw error;
      return data as CostCenter[];
    },
    enabled: !!profile?.organization_id,
  });

  const createCostCenter = useMutation({
    mutationFn: async (costCenter: Omit<CostCenter, 'id' | 'created_at' | 'updated_at' | 'manager' | 'organization_id' | 'status'> & { status?: 'active' | 'inactive' | 'frozen' }) => {
      const { data, error } = await supabase
        .from('cost_centers')
        .insert({ ...costCenter, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Cost center created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCostCenter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CostCenter> & { id: string }) => {
      const { data, error } = await supabase
        .from('cost_centers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Cost center updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteCostCenter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cost_centers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Cost center deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    costCenters: costCentersQuery.data || [],
    isLoading: costCentersQuery.isLoading,
    error: costCentersQuery.error,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
  };
}
