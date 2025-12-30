import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

export function useSubtasks(parentTaskId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const subtasksQuery = useQuery({
    queryKey: ['subtasks', parentTaskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, email)
        `)
        .eq('parent_task_id', parentTaskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!parentTaskId,
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async (subtaskData: { title: string; description?: string }) => {
      // Get parent task to inherit properties
      const { data: parentTask, error: parentError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', parentTaskId)
        .single();

      if (parentError) throw parentError;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: subtaskData.title,
          description: subtaskData.description || '',
          parent_task_id: parentTaskId,
          assigned_to: parentTask.assigned_to,
          created_by: profile?.id,
          organization_id: profile?.organization_id,
          priority: 'medium',
          status: 'assigned',
          slt_coin_value: 0,
          start_date: parentTask.start_date,
          end_date: parentTask.end_date,
          project_id: parentTask.project_id,
          project_owner_id: parentTask.project_owner_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Subtask Created",
        description: "Subtask has been created successfully.",
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

  const updateSubtaskStatusMutation = useMutation({
    mutationFn: async ({ subtaskId, status }: { subtaskId: string; status: Task['status'] }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Subtask Deleted",
        description: "Subtask has been deleted successfully.",
      });
    },
  });

  const completedCount = subtasksQuery.data?.filter(t => t.status === 'verified' || t.status === 'completed').length || 0;
  const totalCount = subtasksQuery.data?.length || 0;

  return {
    subtasks: subtasksQuery.data || [],
    isLoading: subtasksQuery.isLoading,
    createSubtask: (data: { title: string; description?: string }) => createSubtaskMutation.mutate(data),
    updateSubtaskStatus: (subtaskId: string, status: Task['status']) => updateSubtaskStatusMutation.mutate({ subtaskId, status }),
    deleteSubtask: (subtaskId: string) => deleteSubtaskMutation.mutate(subtaskId),
    isCreating: createSubtaskMutation.isPending,
    completedCount,
    totalCount,
    progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
  };
}
