import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { toast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ 
      taskId, 
      status, 
      submissionNotes 
    }: { 
      taskId: string; 
      status: 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected';
      submissionNotes?: string;
    }) => {
      const updateData: any = { status };
      if (submissionNotes) {
        updateData.submission_notes = submissionNotes;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.status === 'completed') {
        toast({
          title: "Task Completed",
          description: "Task marked as completed. Awaiting admin approval for SLT Coins.",
        });

        // Send email notification to admin
        try {
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('role', 'admin');

          if (adminProfiles && adminProfiles.length > 0) {
            for (const admin of adminProfiles) {
              await emailNotifications.sendTaskCompletedEmail({
                to: admin.email,
                recipientName: admin.full_name,
                taskTitle: data.title,
                taskId: data.id,
              });
            }
          }
        } catch (error) {
          console.error('Failed to send task completion email:', error);
        }
      } else if (variables.status === 'verified') {
        toast({
          title: "Task Verified",
          description: "Task has been approved and SLT Coins will be awarded.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error Updating Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskStatus = (taskId: string, status: Task['status'], submissionNotes?: string) => {
    updateTaskStatusMutation.mutate({ taskId, status, submissionNotes });
  };

  return {
    updateTaskStatus,
    isUpdating: updateTaskStatusMutation.isPending,
  };
}