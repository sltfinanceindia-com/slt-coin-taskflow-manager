import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTask } from '@/hooks/useCreateTask';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { useVerifyTask } from '@/hooks/useVerifyTask';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export function useTasks() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { createTask, isCreating } = useCreateTask();
  const { updateTaskStatus, isUpdating } = useUpdateTaskStatus();
  const { verifyTask, isVerifying } = useVerifyTask();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, email),
          creator_profile:profiles!tasks_created_by_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!profile,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, email),
          creator_profile:profiles!tasks_created_by_fkey(id, full_name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTaskStatus,
    verifyTask,
    updateTask: (taskId: string, updates: Partial<Task>) => updateTaskMutation.mutate({ taskId, updates }),
    isCreating,
    isUpdating: isUpdating || updateTaskMutation.isPending,
    isVerifying,
  };
}

// Re-export types for backward compatibility
export type { Task } from '@/types/task';