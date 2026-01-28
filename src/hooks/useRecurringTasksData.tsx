import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface RecurringTask {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | null;
  assigned_to: string | null;
  next_occurrence: string | null;
  last_created: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string } | null;
}

export type CreateRecurringTaskData = Omit<RecurringTask, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'assignee'>;

export function useRecurringTasksData() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['recurring-tasks', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*, assignee:profiles!assigned_to(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RecurringTask[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (task: CreateRecurringTaskData) => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert({
          ...task,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      toast({
        title: 'Recurring Task Created',
        description: 'Recurring task has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      toast({
        title: 'Recurring Task Updated',
        description: 'Recurring task has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      toast({
        title: 'Recurring Task Deleted',
        description: 'Recurring task has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      toast({
        title: is_active ? 'Task Activated' : 'Task Paused',
        description: is_active ? 'Recurring task is now active.' : 'Recurring task has been paused.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    recurringTasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createRecurringTask: createMutation.mutateAsync,
    updateRecurringTask: updateMutation.mutateAsync,
    deleteRecurringTask: deleteMutation.mutateAsync,
    toggleRecurringTask: toggleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
