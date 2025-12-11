import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  budget: number;
  spent_budget: number;
  target_roi: number | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  start_date: string | null;
  target_end_date: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  programs_count?: number;
  projects_count?: number;
  completion_rate?: number;
}

export interface CreatePortfolioData {
  name: string;
  description?: string;
  owner_id?: string;
  status?: Portfolio['status'];
  budget?: number;
  target_roi?: number;
  risk_level?: Portfolio['risk_level'];
  start_date?: string;
  target_end_date?: string;
}

export interface UpdatePortfolioData extends Partial<CreatePortfolioData> {
  id: string;
  spent_budget?: number;
}

export const usePortfolios = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const portfoliosQuery = useQuery({
    queryKey: ['portfolios', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          owner:profiles!portfolios_owner_id_fkey(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get programs and projects counts
      const portfolioIds = data.map(p => p.id);
      
      const { data: programs } = await supabase
        .from('programs')
        .select('id, portfolio_id')
        .in('portfolio_id', portfolioIds);

      const programIds = programs?.map(p => p.id) || [];
      
      const { data: projects } = await supabase
        .from('projects')
        .select('id, program_id, status')
        .in('program_id', programIds);

      return data.map(portfolio => {
        const portfolioPrograms = programs?.filter(p => p.portfolio_id === portfolio.id) || [];
        const portfolioProgramIds = portfolioPrograms.map(p => p.id);
        const portfolioProjects = projects?.filter(p => portfolioProgramIds.includes(p.program_id)) || [];
        const completedProjects = portfolioProjects.filter(p => p.status === 'completed').length;
        
        return {
          ...portfolio,
          programs_count: portfolioPrograms.length,
          projects_count: portfolioProjects.length,
          completion_rate: portfolioProjects.length > 0 
            ? Math.round((completedProjects / portfolioProjects.length) * 100) 
            : 0
        };
      }) as Portfolio[];
    },
    enabled: !!profile?.organization_id,
  });

  const createPortfolioMutation = useMutation({
    mutationFn: async (data: CreatePortfolioData) => {
      const { data: result, error } = await supabase
        .from('portfolios')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create portfolio: ' + error.message);
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdatePortfolioData) => {
      const { data: result, error } = await supabase
        .from('portfolios')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update portfolio: ' + error.message);
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete portfolio: ' + error.message);
    },
  });

  return {
    portfolios: portfoliosQuery.data || [],
    isLoading: portfoliosQuery.isLoading,
    error: portfoliosQuery.error,
    createPortfolio: createPortfolioMutation.mutate,
    updatePortfolio: updatePortfolioMutation.mutate,
    deletePortfolio: deletePortfolioMutation.mutate,
    isCreating: createPortfolioMutation.isPending,
    isUpdating: updatePortfolioMutation.isPending,
    isDeleting: deletePortfolioMutation.isPending,
  };
};
