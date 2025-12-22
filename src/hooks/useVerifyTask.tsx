import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { toast } from '@/hooks/use-toast';

export function useVerifyTask() {
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();

  const verifyTaskMutation = useMutation({
    mutationFn: async ({ 
      taskId, 
      approve, 
      feedback,
      coinValue 
    }: { 
      taskId: string; 
      approve: boolean;
      feedback?: string;
      coinValue?: number;
    }) => {
      // Update task status
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .update({
          status: approve ? 'verified' : 'rejected',
          admin_feedback: feedback,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (taskError) throw taskError;

      // If approved, create coin transaction and update user's total coins
      if (approve && coinValue && taskData.assigned_to) {
        const { error: coinError } = await supabase
          .from('coin_transactions')
          .insert([{
            user_id: taskData.assigned_to,
            task_id: taskId,
            coins_earned: coinValue,
            status: 'approved',
            organization_id: taskData.organization_id
          }]);

        if (coinError) throw coinError;

        // Update user's total coins
        const { error: updateError } = await supabase.rpc('increment_user_coins', {
          p_user_id: taskData.assigned_to,
          p_coins: coinValue
        });

        if (updateError) {
          console.error('Error updating coins:', updateError);
          throw updateError;
        }
      }

      return taskData;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] });
      toast({
        title: variables.approve ? "Task Approved" : "Task Rejected",
        description: variables.approve 
          ? "SLT Coins have been awarded to the intern."
          : "Task has been rejected with feedback.",
        variant: variables.approve ? "default" : "destructive",
      });

      // Send email notification for coin earning (if approved)
      if (variables.approve && variables.coinValue) {
        try {
          const { data: assignedProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', data.assigned_to)
            .single();

          if (assignedProfile) {
            await emailNotifications.sendCoinsEarnedEmail({
              to: assignedProfile.email,
              recipientName: assignedProfile.full_name,
              taskTitle: data.title,
              taskId: data.id,
              coinAmount: variables.coinValue,
            });
          }
        } catch (error) {
          console.error('Failed to send coins earned email:', error);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error Processing Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyTask = (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => {
    verifyTaskMutation.mutate({ taskId, approve, feedback, coinValue });
  };

  return {
    verifyTask,
    isVerifying: verifyTaskMutation.isPending,
  };
}