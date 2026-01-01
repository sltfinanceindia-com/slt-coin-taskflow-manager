import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface RecurrenceRule {
  id: string;
  task_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval_value: number;
  days_of_week?: number[];
  day_of_month?: number;
  end_date?: string;
  occurrences_count?: number;
  next_occurrence?: string;
  is_active: boolean;
  created_at: string;
}

export function useRecurringTasks(taskId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const recurrenceQuery = useQuery({
    queryKey: ['task-recurrence', taskId],
    queryFn: async () => {
      if (!taskId) return null;

      const { data, error } = await supabase
        .from('task_recurrence_rules')
        .select('*')
        .eq('task_id', taskId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as RecurrenceRule | null;
    },
    enabled: !!taskId,
  });

  const createRecurrenceMutation = useMutation({
    mutationFn: async (rule: Omit<RecurrenceRule, 'id' | 'created_at' | 'next_occurrence'>) => {
      const { data, error } = await supabase
        .from('task_recurrence_rules')
        .insert({
          ...rule,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-recurrence'] });
      toast({
        title: 'Recurrence Set',
        description: 'Task will now repeat on schedule.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Setting Recurrence',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateRecurrenceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RecurrenceRule> }) => {
      const { data, error } = await supabase
        .from('task_recurrence_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-recurrence'] });
      toast({
        title: 'Recurrence Updated',
        description: 'Task recurrence has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Recurrence',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteRecurrenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_recurrence_rules')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-recurrence'] });
      toast({
        title: 'Recurrence Removed',
        description: 'Task will no longer repeat.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Removing Recurrence',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    recurrence: recurrenceQuery.data,
    isLoading: recurrenceQuery.isLoading,
    createRecurrence: createRecurrenceMutation.mutate,
    updateRecurrence: updateRecurrenceMutation.mutate,
    deleteRecurrence: deleteRecurrenceMutation.mutate,
    isCreating: createRecurrenceMutation.isPending,
    isUpdating: updateRecurrenceMutation.isPending,
    isDeleting: deleteRecurrenceMutation.isPending,
  };
}
