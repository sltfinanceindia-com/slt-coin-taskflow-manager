import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EnhancedProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  program_id: string | null;
  stage: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  health_status: 'green' | 'amber' | 'red';
  health_reason: string | null;
  sponsor_id: string | null;
  business_case: string | null;
  budget: number;
  spent_budget: number;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  kpis: Array<{ name: string; target: number; current: number; unit: string }>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  organization_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  sponsor?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  program?: {
    id: string;
    name: string;
    portfolio?: {
      id: string;
      name: string;
    };
  };
  tasks_count?: number;
  completed_tasks_count?: number;
  completion_rate?: number;
}

export interface CreateEnhancedProjectData {
  name: string;
  description?: string;
  program_id?: string;
  stage?: EnhancedProject['stage'];
  health_status?: EnhancedProject['health_status'];
  health_reason?: string;
  sponsor_id?: string;
  business_case?: string;
  budget?: number;
  start_date?: string;
  target_end_date?: string;
  kpis?: EnhancedProject['kpis'];
  priority?: EnhancedProject['priority'];
}

export interface UpdateEnhancedProjectData extends Partial<CreateEnhancedProjectData> {
  id: string;
  spent_budget?: number;
  actual_end_date?: string;
  status?: string;
}

export const useEnhancedProjects = (programId?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['enhanced-projects', profile?.organization_id, programId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          creator:profiles!projects_created_by_fkey(id, full_name, avatar_url),
          sponsor:profiles!projects_sponsor_id_fkey(id, full_name, avatar_url),
          program:programs(id, name, portfolio:portfolios(id, name))
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (programId) {
        query = query.eq('program_id', programId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get task counts
      const projectIds = data.map(p => p.id);
      
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, project_id, status')
        .in('project_id', projectIds);

      return data.map(project => {
        const projectTasks = tasks?.filter(t => t.project_id === project.id) || [];
        const completedTasks = projectTasks.filter(t => t.status === 'verified' || t.status === 'completed').length;
        
        // Safely parse kpis - it could be various JSON types
        let parsedKpis: Array<{ name: string; target: number; current: number; unit: string }> = [];
        if (Array.isArray(project.kpis)) {
          parsedKpis = project.kpis as any[];
        }
        
        return {
          ...project,
          kpis: parsedKpis,
          tasks_count: projectTasks.length,
          completed_tasks_count: completedTasks,
          completion_rate: projectTasks.length > 0 
            ? Math.round((completedTasks / projectTasks.length) * 100) 
            : 0
        } as EnhancedProject;
      });
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000, // 30 seconds - prevent refetch on tab changes
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateEnhancedProjectData) => {
      // Clean up empty strings to null for UUID fields
      const cleanedData = {
        name: data.name,
        description: data.description || null,
        program_id: data.program_id && data.program_id.trim() !== '' ? data.program_id : null,
        stage: data.stage || 'planned',
        health_status: data.health_status || 'green',
        health_reason: data.health_reason || null,
        sponsor_id: data.sponsor_id && data.sponsor_id.trim() !== '' ? data.sponsor_id : null,
        business_case: data.business_case || null,
        budget: data.budget || 0,
        start_date: data.start_date || null,
        target_end_date: data.target_end_date || null,
        kpis: data.kpis || [],
        priority: data.priority || 'medium',
        organization_id: profile?.organization_id,
        created_by: profile?.id,
        status: 'active',
      };

      const { data: result, error } = await supabase
        .from('projects')
        .insert(cleanedData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-projects'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create project: ' + error.message);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateEnhancedProjectData) => {
      const { data: result, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-projects'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update project: ' + error.message);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-projects'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete project: ' + error.message);
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};
