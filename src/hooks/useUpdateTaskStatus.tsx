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
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Task not found or you do not have permission to update it');
      }
      return data[0];
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
            .select('id, email, full_name, user_id')
            .eq('organization_id', data.organization_id);

          // Filter for admins using user_roles
          const { data: adminRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');

          const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);
          const admins = adminProfiles?.filter(p => adminUserIds.has(p.user_id)) || [];

          if (admins.length > 0) {
            for (const admin of admins) {
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