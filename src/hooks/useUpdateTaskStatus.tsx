import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { toast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();
  const { logTaskStatusChange, logTaskCompleted, logTaskVerified } = useAutoUpdate();

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ 
      taskId, 
      status,
      previousStatus,
      submissionNotes 
    }: { 
      taskId: string; 
      status: 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected';
      previousStatus?: string;
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
      return { task: data[0], previousStatus };
    },
    onSuccess: async ({ task, previousStatus }, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Log to activity feed based on status change
      try {
        if (variables.status === 'completed') {
          await logTaskCompleted(task.title, task.id);
          toast({
            title: "Task Completed",
            description: "Task marked as completed. Awaiting admin approval for Coins.",
          });

          // Send email notification to admin
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('id, email, full_name, user_id')
            .eq('organization_id', task.organization_id);

          const { data: adminRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');

          const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);
          const admins = adminProfiles?.filter(p => adminUserIds.has(p.user_id)) || [];

          for (const admin of admins) {
            await emailNotifications.sendTaskCompletedEmail({
              to: admin.email,
              recipientName: admin.full_name,
              taskTitle: task.title,
              taskId: task.id,
            });
          }
        } else if (variables.status === 'verified') {
          await logTaskVerified(task.title, task.id, true);
          toast({
            title: "Task Verified",
            description: "Task has been approved and Coins will be awarded.",
          });
        } else if (variables.status === 'rejected') {
          await logTaskVerified(task.title, task.id, false);
          toast({
            title: "Task Rejected",
            description: "Task has been rejected. Assignee will be notified.",
          });
        } else if (previousStatus) {
          await logTaskStatusChange(task.title, task.id, previousStatus, variables.status);
          toast({
            title: "Task Updated",
            description: `Task status changed to ${variables.status.replace('_', ' ')}.`,
          });
        }
      } catch (error) {
        console.error('Failed to log status change:', error);
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

  const updateTaskStatus = (taskId: string, status: Task['status'], submissionNotes?: string, previousStatus?: string) => {
    updateTaskStatusMutation.mutate({ taskId, status, submissionNotes, previousStatus });
  };

  return {
    updateTaskStatus,
    isUpdating: updateTaskStatusMutation.isPending,
  };
}