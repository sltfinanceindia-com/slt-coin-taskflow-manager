import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BudgetAllocation {
  id: string;
  organization_id: string | null;
  department: string;
  category: string;
  fiscal_year: string;
  allocated_amount: number | null;
  spent_amount: number | null;
  status: 'on_track' | 'at_risk' | 'over_budget' | 'under_utilized';
  notes: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useBudgets() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const budgetsQuery = useQuery({
    queryKey: ['budget-allocations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('budget_allocations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('department', { ascending: true })
        .order('category', { ascending: true });
      if (error) throw error;
      return data as BudgetAllocation[];
    },
    enabled: !!profile?.organization_id,
  });

  const createBudget = useMutation({
    mutationFn: async (budget: Omit<BudgetAllocation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('budget_allocations')
        .insert({ 
          ...budget, 
          organization_id: profile?.organization_id,
          created_by: profile?.id 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] });
      toast.success('Budget allocation created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BudgetAllocation> & { id: string }) => {
      const { data, error } = await supabase
        .from('budget_allocations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] });
      toast.success('Budget allocation updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budget_allocations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] });
      toast.success('Budget allocation deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    budgets: budgetsQuery.data || [],
    isLoading: budgetsQuery.isLoading,
    error: budgetsQuery.error,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}
