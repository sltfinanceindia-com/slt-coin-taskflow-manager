import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectBaseline {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  baseline_date: string;
  created_by: string;
  is_current: boolean;
  task_snapshots: any[];
  budget_snapshot: number;
  schedule_snapshot: {
    start_date?: string;
    end_date?: string;
    task_count?: number;
  };
  organization_id: string;
  created_at: string;
  creator_profile?: {
    id: string;
    full_name: string;
  };
}

export interface TaskBaselineSnapshot {
  id: string;
  baseline_id: string;
  task_id: string;
  planned_start_date: string | null;
  planned_end_date: string | null;
  estimated_hours: number;
  task?: {
    id: string;
    title: string;
    status: string;
    planned_start_date: string | null;
    planned_end_date: string | null;
    estimated_hours: number | null;
  };
}

export interface VarianceMetrics {
  baseline_hours: number;
  actual_hours: number;
  effort_variance: number;
  effort_variance_pct: number;
  baseline_end_date: string | null;
  current_end_date: string | null;
  schedule_variance_days: number;
  tasks_on_track: number;
  tasks_behind: number;
  tasks_ahead: number;
  completion_rate: number;
}

export function useBaselines(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch baselines for a project
  const baselinesQuery = useQuery({
    queryKey: ['project-baselines', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_baselines')
        .select(`
          *,
          creator_profile:profiles!project_baselines_created_by_fkey(id, full_name)
        `)
        .eq('project_id', projectId)
        .order('baseline_date', { ascending: false });

      if (error) throw error;
      return data as ProjectBaseline[];
    },
    enabled: !!projectId && !!profile?.organization_id,
  });

  // Fetch snapshots for a specific baseline
  const fetchBaselineSnapshots = async (baselineId: string) => {
    const { data, error } = await supabase
      .from('task_baseline_snapshots')
      .select(`
        *,
        task:tasks(id, title, status, planned_start_date, planned_end_date, estimated_hours)
      `)
      .eq('baseline_id', baselineId);

    if (error) throw error;
    return data as TaskBaselineSnapshot[];
  };

  // Create baseline mutation
  const createBaselineMutation = useMutation({
    mutationFn: async ({ projectId, name, description }: { 
      projectId: string; 
      name: string; 
      description?: string;
    }) => {
      const { data, error } = await supabase
        .rpc('create_project_baseline', {
          p_project_id: projectId,
          p_name: name,
          p_description: description || null
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-baselines'] });
      toast({
        title: "Baseline Created",
        description: "Project baseline snapshot has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Baseline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate variance
  const calculateVariance = async (projectId: string, baselineId?: string): Promise<VarianceMetrics | null> => {
    const { data, error } = await supabase
      .rpc('calculate_project_variance', {
        p_project_id: projectId,
        p_baseline_id: baselineId || null
      });

    if (error) {
      console.error('Error calculating variance:', error);
      return null;
    }
    
    return data?.[0] || null;
  };

  // Set current baseline
  const setCurrentBaselineMutation = useMutation({
    mutationFn: async ({ baselineId, projectId }: { baselineId: string; projectId: string }) => {
      // First, set all baselines for this project to not current
      await supabase
        .from('project_baselines')
        .update({ is_current: false })
        .eq('project_id', projectId);

      // Then set the selected one as current
      const { error } = await supabase
        .from('project_baselines')
        .update({ is_current: true })
        .eq('id', baselineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-baselines'] });
      toast({
        title: "Baseline Updated",
        description: "Current baseline has been changed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete baseline
  const deleteBaselineMutation = useMutation({
    mutationFn: async (baselineId: string) => {
      const { error } = await supabase
        .from('project_baselines')
        .delete()
        .eq('id', baselineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-baselines'] });
      toast({
        title: "Baseline Deleted",
        description: "Baseline has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    baselines: baselinesQuery.data || [],
    isLoading: baselinesQuery.isLoading,
    error: baselinesQuery.error,
    createBaseline: (projectId: string, name: string, description?: string) => 
      createBaselineMutation.mutateAsync({ projectId, name, description }),
    isCreating: createBaselineMutation.isPending,
    setCurrentBaseline: (baselineId: string, projectId: string) =>
      setCurrentBaselineMutation.mutate({ baselineId, projectId }),
    deleteBaseline: (baselineId: string) => deleteBaselineMutation.mutate(baselineId),
    isDeleting: deleteBaselineMutation.isPending,
    fetchBaselineSnapshots,
    calculateVariance,
  };
}
