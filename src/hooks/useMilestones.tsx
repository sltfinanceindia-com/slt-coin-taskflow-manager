import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Milestone {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  name: string;
  description: string | null;
  due_date: string;
  status: string;
  completion_percentage: number | null;
  created_by: string | null;
  deliverables: string[] | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
  owner?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useMilestones(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const milestonesQuery = useQuery({
    queryKey: ['milestones', profile?.organization_id, projectId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('milestones')
        .select(`
          *,
          project:projects(id, name),
          owner:profiles!milestones_created_by_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('due_date', { ascending: true });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Milestone[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMilestone = useMutation({
    mutationFn: async (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'project' | 'owner' | 'organization_id' | 'created_by' | 'deliverables'>) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          ...milestone,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone created successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMilestone = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Milestone> & { id: string }) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone updated successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone deleted successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return {
    milestones: milestonesQuery.data || [],
    isLoading: milestonesQuery.isLoading,
    error: milestonesQuery.error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}