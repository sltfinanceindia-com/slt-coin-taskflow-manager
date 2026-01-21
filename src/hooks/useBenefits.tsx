import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EmployeeBenefit {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  name: string;
  type: 'health' | 'life' | 'dental' | 'vision' | 'retirement' | 'wellness' | 'other';
  provider: string | null;
  coverage_amount: number | null;
  premium: number | null;
  employer_contribution: number | null;
  employee_contribution: number | null;
  valid_from: string | null;
  valid_until: string | null;
  dependents_count: number | null;
  status: 'active' | 'inactive' | 'pending' | 'expired';
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export function useBenefits() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const benefitsQuery = useQuery({
    queryKey: ['employee-benefits', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          employee:profiles!employee_benefits_employee_id_fkey(id, full_name, email)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeBenefit[];
    },
    enabled: !!profile?.organization_id,
  });

  const createBenefit = useMutation({
    mutationFn: async (benefit: Omit<EmployeeBenefit, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase
        .from('employee_benefits')
        .insert({ ...benefit, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-benefits'] });
      toast.success('Benefit added successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateBenefit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeBenefit> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_benefits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-benefits'] });
      toast.success('Benefit updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteBenefit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_benefits')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-benefits'] });
      toast.success('Benefit deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    benefits: benefitsQuery.data || [],
    isLoading: benefitsQuery.isLoading,
    error: benefitsQuery.error,
    createBenefit,
    updateBenefit,
    deleteBenefit,
  };
}
