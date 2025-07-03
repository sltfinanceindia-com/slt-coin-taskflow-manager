import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { toast } from '@/hooks/use-toast';
import { CreateTaskData } from '@/types/task';

export function useCreateTask() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: profile?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Created",
        description: "Task has been successfully created and assigned.",
      });

      // Send email notification to assigned intern
      try {
        const { data: assignedProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', variables.assigned_to)
          .single();

        if (assignedProfile) {
          await emailNotifications.sendTaskAssignedEmail({
            to: assignedProfile.email,
            recipientName: assignedProfile.full_name,
            taskTitle: variables.title,
            taskId: data.id,
            assignerName: profile?.full_name || 'Admin',
          });
        }
      } catch (error) {
        console.error('Failed to send task assignment email:', error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error Creating Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createTask: createTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
  };
}