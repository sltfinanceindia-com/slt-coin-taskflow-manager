import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Probation {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  start_date: string;
  end_date: string;
  status: 'ongoing' | 'extended' | 'confirmed' | 'terminated';
  performance_score: number | null;
  manager_id: string | null;
  feedback: string | null;
  extension_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
  manager?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useProbations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const probationsQuery = useQuery({
    queryKey: ['probations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('probations')
        .select(`
          *,
          employee:profiles!probations_employee_id_fkey(id, full_name, email, department),
          manager:profiles!probations_manager_id_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('end_date', { ascending: true });
      if (error) throw error;
      return data as Probation[];
    },
    enabled: !!profile?.organization_id,
  });

  const createProbation = useMutation({
    mutationFn: async (probation: Omit<Probation, 'id' | 'created_at' | 'updated_at' | 'employee' | 'manager'>) => {
      const { data, error } = await supabase
        .from('probations')
        .insert({ ...probation, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['probations'] });
      toast.success('Probation record created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateProbation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Probation> & { id: string }) => {
      const { data, error } = await supabase
        .from('probations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['probations'] });
      toast.success('Probation updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteProbation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('probations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['probations'] });
      toast.success('Probation record deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    probations: probationsQuery.data || [],
    isLoading: probationsQuery.isLoading,
    error: probationsQuery.error,
    createProbation,
    updateProbation,
    deleteProbation,
  };
}
