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
      // Handle both single assignment (string) and multiple assignments (string[])
      const assignedUsers = Array.isArray(taskData.assigned_to) ? taskData.assigned_to : [taskData.assigned_to];
      
      // Create a task for each assigned user
      const createdTasks = [];
      
      for (const userId of assignedUsers) {
        const { data: newTask, error: taskError } = await supabase
          .from('tasks')
          .insert([{
            ...taskData,
            assigned_to: userId,
            created_by: profile?.id,
          }])
          .select()
          .single();

        if (taskError) throw taskError;
        createdTasks.push(newTask);
      }

      return { tasks: createdTasks, assignedUsers };
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Created",
        description: `Task has been successfully created and assigned to ${data.assignedUsers.length} user(s).`,
      });

      // Send email notification to all assigned interns
      try {
        const assignedUsers = Array.isArray(variables.assigned_to) ? variables.assigned_to : [variables.assigned_to];
        
        for (const userId of assignedUsers) {
          const { data: assignedProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', userId)
            .single();

          if (assignedProfile) {
            await emailNotifications.sendTaskAssignedEmail({
              to: assignedProfile.email,
              recipientName: assignedProfile.full_name,
              taskTitle: variables.title,
              taskId: data.tasks[0].id, // Use first task ID for email reference
              assignerName: profile?.full_name || 'Admin',
            });
          }
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