import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Program {
  id: string;
  portfolio_id: string | null;
  name: string;
  description: string | null;
  owner_id: string | null;
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  budget: number;
  spent_budget: number;
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
  portfolio?: {
    id: string;
    name: string;
  };
  projects_count?: number;
  completion_rate?: number;
}

export interface CreateProgramData {
  name: string;
  portfolio_id?: string;
  description?: string;
  owner_id?: string;
  status?: Program['status'];
  budget?: number;
  start_date?: string;
  target_end_date?: string;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {
  id: string;
  spent_budget?: number;
}

export const usePrograms = (portfolioId?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const programsQuery = useQuery({
    queryKey: ['programs', profile?.organization_id, portfolioId],
    queryFn: async () => {
      let query = supabase
        .from('programs')
        .select(`
          *,
          owner:profiles!programs_owner_id_fkey(id, full_name, avatar_url),
          portfolio:portfolios(id, name)
        `)
        .order('created_at', { ascending: false });

      if (portfolioId) {
        query = query.eq('portfolio_id', portfolioId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get projects counts
      const programIds = data.map(p => p.id);
      
      const { data: projects } = await supabase
        .from('projects')
        .select('id, program_id, status')
        .in('program_id', programIds);

      return data.map(program => {
        const programProjects = projects?.filter(p => p.program_id === program.id) || [];
        const completedProjects = programProjects.filter(p => p.status === 'completed').length;
        
        return {
          ...program,
          projects_count: programProjects.length,
          completion_rate: programProjects.length > 0 
            ? Math.round((completedProjects / programProjects.length) * 100) 
            : 0
        };
      }) as Program[];
    },
    enabled: !!profile?.organization_id,
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: CreateProgramData) => {
      const { data: result, error } = await supabase
        .from('programs')
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
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Program created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create program: ' + error.message);
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateProgramData) => {
      const { data: result, error } = await supabase
        .from('programs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Program updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update program: ' + error.message);
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Program deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete program: ' + error.message);
    },
  });

  return {
    programs: programsQuery.data || [],
    isLoading: programsQuery.isLoading,
    error: programsQuery.error,
    createProgram: createProgramMutation.mutate,
    updateProgram: updateProgramMutation.mutate,
    deleteProgram: deleteProgramMutation.mutate,
    isCreating: createProgramMutation.isPending,
    isUpdating: updateProgramMutation.isPending,
    isDeleting: deleteProgramMutation.isPending,
  };
};
