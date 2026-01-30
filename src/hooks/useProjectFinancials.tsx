/**
 * Project Financials Hook
 * Manages project cost items and revenue items
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type CostType = 'labor' | 'non_labor';
export type CostCategory = 'capex' | 'opex';
export type RevenueStatus = 'forecast' | 'invoiced' | 'paid';

export interface ProjectCostItem {
  id: string;
  project_id: string;
  cost_type: CostType;
  category?: CostCategory;
  description: string;
  amount: number;
  date_incurred: string;
  is_forecast: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRevenueItem {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  billing_date: string;
  status: RevenueStatus;
  invoice_number?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCostItemData {
  project_id: string;
  cost_type: CostType;
  category?: CostCategory;
  description: string;
  amount: number;
  date_incurred: string;
  is_forecast?: boolean;
}

export interface CreateRevenueItemData {
  project_id: string;
  description: string;
  amount: number;
  billing_date: string;
  status?: RevenueStatus;
  invoice_number?: string;
}

export interface ProjectFinancialSummary {
  totalBudget: number;
  totalCost: number;
  forecastCost: number;
  actualCost: number;
  laborCost: number;
  nonLaborCost: number;
  capexCost: number;
  opexCost: number;
  totalRevenue: number;
  forecastRevenue: number;
  invoicedRevenue: number;
  paidRevenue: number;
  grossMargin: number;
  grossMarginPercentage: number;
  budgetVariance: number;
  budgetVariancePercentage: number;
}

export function useProjectFinancials(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch project with budget info
  const projectQuery = useQuery({
    queryKey: ['project-budget', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('id, name, budget, spent_budget, capex_budget, opex_budget')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch cost items
  const costItemsQuery = useQuery({
    queryKey: ['project-cost-items', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_cost_items')
        .select('*')
        .eq('project_id', projectId)
        .order('date_incurred', { ascending: false });

      if (error) throw error;
      return data as ProjectCostItem[];
    },
    enabled: !!projectId,
  });

  // Fetch revenue items
  const revenueItemsQuery = useQuery({
    queryKey: ['project-revenue-items', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_revenue_items')
        .select('*')
        .eq('project_id', projectId)
        .order('billing_date', { ascending: false });

      if (error) throw error;
      return data as ProjectRevenueItem[];
    },
    enabled: !!projectId,
  });

  // Create cost item
  const createCostItemMutation = useMutation({
    mutationFn: async (data: CreateCostItemData) => {
      const { data: result, error } = await supabase
        .from('project_cost_items')
        .insert({
          ...data,
          created_by: profile?.id,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-cost-items', projectId] });
      toast.success('Cost item added');
    },
    onError: (error) => {
      toast.error('Failed to add cost item: ' + error.message);
    },
  });

  // Update cost item
  const updateCostItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateCostItemData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('project_cost_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-cost-items', projectId] });
      toast.success('Cost item updated');
    },
    onError: (error) => {
      toast.error('Failed to update cost item: ' + error.message);
    },
  });

  // Delete cost item
  const deleteCostItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_cost_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-cost-items', projectId] });
      toast.success('Cost item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete cost item: ' + error.message);
    },
  });

  // Create revenue item
  const createRevenueItemMutation = useMutation({
    mutationFn: async (data: CreateRevenueItemData) => {
      const { data: result, error } = await supabase
        .from('project_revenue_items')
        .insert({
          ...data,
          created_by: profile?.id,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-revenue-items', projectId] });
      toast.success('Revenue item added');
    },
    onError: (error) => {
      toast.error('Failed to add revenue item: ' + error.message);
    },
  });

  // Update revenue item
  const updateRevenueItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateRevenueItemData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('project_revenue_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-revenue-items', projectId] });
      toast.success('Revenue item updated');
    },
    onError: (error) => {
      toast.error('Failed to update revenue item: ' + error.message);
    },
  });

  // Delete revenue item
  const deleteRevenueItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_revenue_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-revenue-items', projectId] });
      toast.success('Revenue item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete revenue item: ' + error.message);
    },
  });

  // Calculate financial summary
  const costItems = costItemsQuery.data || [];
  const revenueItems = revenueItemsQuery.data || [];
  const project = projectQuery.data;

  const summary: ProjectFinancialSummary = {
    totalBudget: (project?.budget || 0) + (project?.capex_budget || 0) + (project?.opex_budget || 0),
    totalCost: costItems.reduce((sum, item) => sum + Number(item.amount), 0),
    forecastCost: costItems.filter(i => i.is_forecast).reduce((sum, item) => sum + Number(item.amount), 0),
    actualCost: costItems.filter(i => !i.is_forecast).reduce((sum, item) => sum + Number(item.amount), 0),
    laborCost: costItems.filter(i => i.cost_type === 'labor').reduce((sum, item) => sum + Number(item.amount), 0),
    nonLaborCost: costItems.filter(i => i.cost_type === 'non_labor').reduce((sum, item) => sum + Number(item.amount), 0),
    capexCost: costItems.filter(i => i.category === 'capex').reduce((sum, item) => sum + Number(item.amount), 0),
    opexCost: costItems.filter(i => i.category === 'opex').reduce((sum, item) => sum + Number(item.amount), 0),
    totalRevenue: revenueItems.reduce((sum, item) => sum + Number(item.amount), 0),
    forecastRevenue: revenueItems.filter(i => i.status === 'forecast').reduce((sum, item) => sum + Number(item.amount), 0),
    invoicedRevenue: revenueItems.filter(i => i.status === 'invoiced').reduce((sum, item) => sum + Number(item.amount), 0),
    paidRevenue: revenueItems.filter(i => i.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0),
    grossMargin: 0,
    grossMarginPercentage: 0,
    budgetVariance: 0,
    budgetVariancePercentage: 0,
  };

  // Calculate margin
  summary.grossMargin = summary.totalRevenue - summary.totalCost;
  summary.grossMarginPercentage = summary.totalRevenue > 0 
    ? (summary.grossMargin / summary.totalRevenue) * 100 
    : 0;

  // Calculate budget variance
  summary.budgetVariance = summary.totalBudget - summary.actualCost;
  summary.budgetVariancePercentage = summary.totalBudget > 0 
    ? (summary.budgetVariance / summary.totalBudget) * 100 
    : 0;

  return {
    project: projectQuery.data,
    costItems,
    revenueItems,
    summary,
    isLoading: costItemsQuery.isLoading || revenueItemsQuery.isLoading,
    error: costItemsQuery.error || revenueItemsQuery.error,
    createCostItem: createCostItemMutation.mutate,
    updateCostItem: updateCostItemMutation.mutate,
    deleteCostItem: deleteCostItemMutation.mutate,
    createRevenueItem: createRevenueItemMutation.mutate,
    updateRevenueItem: updateRevenueItemMutation.mutate,
    deleteRevenueItem: deleteRevenueItemMutation.mutate,
    isCreatingCost: createCostItemMutation.isPending,
    isCreatingRevenue: createRevenueItemMutation.isPending,
  };
}
