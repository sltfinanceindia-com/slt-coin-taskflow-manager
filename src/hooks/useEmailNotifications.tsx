import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface EmailNotification {
  emailType: 'task_assigned' | 'task_completed' | 'comment_added' | 'coins_earned' | 'login_notification' | 'logout_notification';
  to: string;
  recipientName: string;
  taskTitle?: string;
  taskId?: string;
  commentId?: string;
  coinAmount?: number;
  assignerName?: string;
  commenterName?: string;
}

export function useEmailNotifications() {
  const { profile } = useAuth();

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: EmailNotification) => {
      console.log('Sending email notification:', emailData);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      // Log the email notification in the database
      const { error: dbError } = await supabase
        .from('email_notifications')
        .insert({
          user_id: profile?.id || '',
          email_type: emailData.emailType,
          email_to: emailData.to,
          subject: `${emailData.emailType.replace('_', ' ').toUpperCase()}: ${emailData.taskTitle || 'Notification'}`,
          task_id: emailData.taskId || null,
          comment_id: emailData.commentId || null,
        });

      if (dbError) {
        console.error('Error logging email notification:', dbError);
        // Don't throw here as the email might have been sent successfully
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Notification email has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error('Email notification error:', error);
      toast({
        title: "Email Error",
        description: "Failed to send notification email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper functions for specific email types
  const sendTaskAssignedEmail = async (data: {
    to: string;
    recipientName: string;
    taskTitle: string;
    taskId: string;
    assignerName: string;
  }) => {
    return sendEmailMutation.mutateAsync({
      emailType: 'task_assigned',
      ...data,
    });
  };

  const sendTaskCompletedEmail = async (data: {
    to: string;
    recipientName: string;
    taskTitle: string;
    taskId: string;
  }) => {
    return sendEmailMutation.mutateAsync({
      emailType: 'task_completed',
      ...data,
    });
  };

  const sendCommentAddedEmail = async (data: {
    to: string;
    recipientName: string;
    taskTitle: string;
    taskId: string;
    commentId: string;
    commenterName: string;
  }) => {
    return sendEmailMutation.mutateAsync({
      emailType: 'comment_added',
      ...data,
    });
  };

  const sendCoinsEarnedEmail = async (data: {
    to: string;
    recipientName: string;
    taskTitle: string;
    taskId: string;
    coinAmount: number;
  }) => {
    return sendEmailMutation.mutateAsync({
      emailType: 'coins_earned',
      ...data,
    });
  };

  const sendLoginNotificationEmail = async (data: {
    to: string;
    recipientName: string;
  }) => {
    return sendEmailMutation.mutateAsync({
      emailType: 'login_notification',
      ...data,
    });
  };

  const sendLogoutNotificationEmail = async (data: {
    to: string;
    recipientName: string;
  }) => {
    return sendEmailMutation.mutateAsync({
      emailType: 'logout_notification',
      ...data,
    });
  };

  return {
    sendEmail: sendEmailMutation.mutate,
    sendTaskAssignedEmail,
    sendTaskCompletedEmail,
    sendCommentAddedEmail,
    sendCoinsEarnedEmail,
    sendLoginNotificationEmail,
    sendLogoutNotificationEmail,
    isLoading: sendEmailMutation.isPending,
    error: sendEmailMutation.error,
  };
}