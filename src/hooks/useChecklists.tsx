import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  completed_at: string | null;
  completed_by: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function useChecklists(taskId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const checklistsQuery = useQuery({
    queryKey: ['checklists', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_checklists')
        .select('*')
        .eq('task_id', taskId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!taskId,
  });

  const addItemMutation = useMutation({
    mutationFn: async (title: string) => {
      const maxPosition = checklistsQuery.data?.length || 0;
      const { data, error } = await supabase
        .from('task_checklists')
        .insert({
          task_id: taskId,
          title,
          position: maxPosition,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', taskId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('task_checklists')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? profile?.id : null,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', taskId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, title }: { itemId: string; title: string }) => {
      const { data, error } = await supabase
        .from('task_checklists')
        .update({ title })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', taskId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('task_checklists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', taskId] });
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: async (items: { id: string; position: number }[]) => {
      const promises = items.map(item =>
        supabase
          .from('task_checklists')
          .update({ position: item.position })
          .eq('id', item.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', taskId] });
    },
  });

  return {
    items: checklistsQuery.data || [],
    isLoading: checklistsQuery.isLoading,
    addItem: (title: string) => addItemMutation.mutate(title),
    toggleItem: (itemId: string, isCompleted: boolean) => toggleItemMutation.mutate({ itemId, isCompleted }),
    updateItem: (itemId: string, title: string) => updateItemMutation.mutate({ itemId, title }),
    deleteItem: (itemId: string) => deleteItemMutation.mutate(itemId),
    reorderItems: (items: { id: string; position: number }[]) => reorderItemsMutation.mutate(items),
    isAdding: addItemMutation.isPending,
  };
}
