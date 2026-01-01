import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

type BulkUpdateField = 'status' | 'priority' | 'assigned_to';

interface BulkUpdatePayload {
  taskIds: string[];
  field: BulkUpdateField;
  value: string;
}

export function useBulkTaskActions() {
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ taskIds, field, value }: BulkUpdatePayload) => {
      const updates: Record<string, string> = { [field]: value };
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .in('id', taskIds);

      if (error) throw error;
      return { count: taskIds.length, field };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tasks Updated',
        description: `${data.count} task(s) ${data.field} updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Tasks',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds);

      if (error) throw error;
      return taskIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tasks Deleted',
        description: `${count} task(s) deleted successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Tasks',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    bulkUpdate: bulkUpdateMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    isUpdating: bulkUpdateMutation.isPending,
    isDeleting: bulkDeleteMutation.isPending,
  };
}
