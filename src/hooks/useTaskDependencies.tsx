import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface TaskDependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag_days: number;
  organization_id: string | null;
  created_at: string;
  created_by: string | null;
  predecessor?: {
    id: string;
    title: string;
    status: string;
    planned_end_date: string | null;
    end_date: string;
  };
  successor?: {
    id: string;
    title: string;
    status: string;
    planned_start_date: string | null;
    start_date: string;
  };
}

export interface CreateDependencyData {
  predecessor_id: string;
  successor_id: string;
  dependency_type: TaskDependency['dependency_type'];
  lag_days?: number;
}

export function useTaskDependencies(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const dependenciesQuery = useQuery({
    queryKey: ['task-dependencies', projectId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('task_dependencies')
        .select(`
          *,
          predecessor:tasks!task_dependencies_predecessor_id_fkey(id, title, status, planned_end_date, end_date),
          successor:tasks!task_dependencies_successor_id_fkey(id, title, status, planned_start_date, start_date)
        `)
        .eq('organization_id', profile.organization_id);

      if (projectId) {
        // Filter by project - need to join through tasks
        const { data: projectTasks } = await supabase
          .from('tasks')
          .select('id')
          .eq('project_id', projectId);
        
        const taskIds = projectTasks?.map(t => t.id) || [];
        if (taskIds.length > 0) {
          query = query.or(`predecessor_id.in.(${taskIds.join(',')}),successor_id.in.(${taskIds.join(',')})`);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaskDependency[];
    },
    enabled: !!profile?.organization_id,
  });

  const createDependencyMutation = useMutation({
    mutationFn: async (data: CreateDependencyData) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('User not authenticated');
      }

      // Check for circular dependency
      const { data: existingDep } = await supabase
        .from('task_dependencies')
        .select('id')
        .eq('predecessor_id', data.successor_id)
        .eq('successor_id', data.predecessor_id)
        .single();

      if (existingDep) {
        throw new Error('This would create a circular dependency');
      }

      const { data: result, error } = await supabase
        .from('task_dependencies')
        .insert({
          ...data,
          organization_id: profile.organization_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Dependency Created',
        description: 'Task dependency has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Dependency',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateDependencyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateDependencyData> }) => {
      const { data, error } = await supabase
        .from('task_dependencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Dependency Updated',
        description: 'Task dependency has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Dependency',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteDependencyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Dependency Removed',
        description: 'Task dependency has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Removing Dependency',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const calculateCriticalPath = async (projectId: string) => {
    const { data, error } = await supabase.rpc('calculate_task_critical_path', {
      p_project_id: projectId,
    });

    if (error) {
      toast({
        title: 'Error Calculating Critical Path',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    return data;
  };

  return {
    dependencies: dependenciesQuery.data || [],
    isLoading: dependenciesQuery.isLoading,
    error: dependenciesQuery.error,
    createDependency: createDependencyMutation.mutate,
    updateDependency: (id: string, updates: Partial<CreateDependencyData>) =>
      updateDependencyMutation.mutate({ id, updates }),
    deleteDependency: deleteDependencyMutation.mutate,
    calculateCriticalPath,
    isCreating: createDependencyMutation.isPending,
    isUpdating: updateDependencyMutation.isPending,
    isDeleting: deleteDependencyMutation.isPending,
  };
}
