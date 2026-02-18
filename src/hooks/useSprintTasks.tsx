import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SprintTask {
  id: string;
  sprint_id: string;
  task_id: string;
  organization_id: string | null;
  added_at: string;
  sort_order: number;
  story_points: number;
  task?: {
    id: string;
    title: string;
    status: string;
    priority: string;
    assigned_to: string | null;
    assignee?: { full_name: string } | null;
  };
}

export function useSprintTasks(sprintId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const sprintTasksQuery = useQuery({
    queryKey: ['sprint-tasks', sprintId],
    queryFn: async () => {
      if (!sprintId || !profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('sprint_tasks')
        .select(`
          *,
          task:tasks(id, title, status, priority, assigned_to, assignee:profiles!tasks_assigned_to_fkey(full_name))
        `)
        .eq('sprint_id', sprintId)
        .eq('organization_id', profile.organization_id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as SprintTask[];
    },
    enabled: !!sprintId && !!profile?.organization_id,
  });

  const addTask = useMutation({
    mutationFn: async ({ sprintId, taskId, storyPoints = 0 }: { sprintId: string; taskId: string; storyPoints?: number }) => {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .insert({
          sprint_id: sprintId,
          task_id: taskId,
          organization_id: profile?.organization_id,
          story_points: storyPoints,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-tasks'] });
      toast.success('Task added to sprint');
    },
    onError: (error) => toast.error(error.message),
  });

  const removeTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sprint_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-tasks'] });
      toast.success('Task removed from sprint');
    },
    onError: (error) => toast.error(error.message),
  });

  const totalPoints = sprintTasksQuery.data?.reduce((sum, st) => sum + (st.story_points || 0), 0) || 0;
  const completedPoints = sprintTasksQuery.data?.filter(st => st.task?.status === 'verified' || st.task?.status === 'completed')
    .reduce((sum, st) => sum + (st.story_points || 0), 0) || 0;

  return {
    sprintTasks: sprintTasksQuery.data || [],
    isLoading: sprintTasksQuery.isLoading,
    addTask,
    removeTask,
    totalPoints,
    completedPoints,
  };
}
