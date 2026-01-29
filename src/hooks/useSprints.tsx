import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Sprint {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  velocity: number | null;
  total_story_points: number | null;
  completed_story_points: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
}

export function useSprints(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const sprintsQuery = useQuery({
    queryKey: ['sprints', profile?.organization_id, projectId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('sprints')
        .select(`
          *,
          project:projects(id, name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('start_date', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Sprint[];
    },
    enabled: !!profile?.organization_id,
  });

  const createSprint = useMutation({
    mutationFn: async (sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at' | 'project' | 'organization_id'>) => {
      const { data, error } = await supabase
        .from('sprints')
        .insert({
          ...sprint,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateSprint = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sprint> & { id: string }) => {
      const { data, error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteSprint = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  // Get active sprint
  const activeSprint = sprintsQuery.data?.find(s => s.status === 'active');

  return {
    sprints: sprintsQuery.data || [],
    activeSprint,
    isLoading: sprintsQuery.isLoading,
    error: sprintsQuery.error,
    createSprint,
    updateSprint,
    deleteSprint,
  };
}