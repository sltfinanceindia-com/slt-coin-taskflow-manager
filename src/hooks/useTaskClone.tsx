import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

interface CloneOptions {
  includeSubtasks: boolean;
  includeChecklists: boolean;
  newTitle?: string;
  newAssignee?: string;
}

export function useTaskClone() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const cloneTaskMutation = useMutation({
    mutationFn: async ({ task, options }: { task: Task; options: CloneOptions }) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User not authenticated');
      }

      // Clone the main task
      const { data: clonedTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: options.newTitle || `${task.title} (Copy)`,
          description: task.description,
          priority: task.priority,
          slt_coin_value: task.slt_coin_value,
          start_date: new Date().toISOString().split('T')[0],
          end_date: task.end_date,
          project_id: task.project_id,
          project_owner_id: task.project_owner_id,
          assigned_to: options.newAssignee || task.assigned_to,
          created_by: profile.id,
          organization_id: profile.organization_id,
          status: 'assigned',
          estimated_hours: task.estimated_hours,
          is_milestone: task.is_milestone,
          is_critical: task.is_critical,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Clone subtasks if requested
      if (options.includeSubtasks) {
        const { data: subtasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', task.id);

        if (subtasks && subtasks.length > 0) {
          for (const subtask of subtasks) {
            await supabase.from('tasks').insert({
              title: subtask.title,
              description: subtask.description,
              priority: subtask.priority,
              slt_coin_value: subtask.slt_coin_value,
              start_date: new Date().toISOString().split('T')[0],
              end_date: subtask.end_date,
              assigned_to: options.newAssignee || subtask.assigned_to,
              created_by: profile.id,
              organization_id: profile.organization_id,
              status: 'assigned',
              parent_task_id: clonedTask.id,
            });
          }
        }
      }

      // Clone checklists if requested
      if (options.includeChecklists) {
        const { data: checklists } = await supabase
          .from('task_checklists')
          .select('*')
          .eq('task_id', task.id);

        if (checklists && checklists.length > 0) {
          for (const checklist of checklists) {
            await supabase.from('task_checklists').insert({
              task_id: clonedTask.id,
              title: checklist.title,
              is_completed: false,
              position: checklist.position,
              organization_id: profile.organization_id,
            });
          }
        }
      }

      return clonedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Cloned',
        description: 'Task has been cloned successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Cloning Task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    cloneTask: cloneTaskMutation.mutate,
    isCloning: cloneTaskMutation.isPending,
  };
}
