import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  attachments: any[];
  created_at: string;
  updated_at: string;
  user_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useTaskComments(taskId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();

  const commentsQuery = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user_profile:profiles!task_comments_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TaskComment[];
    },
    enabled: !!taskId && !!profile,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: {
      task_id: string;
      content: string;
      mentions?: string[];
      attachments?: any[];
    }) => {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{
          ...commentData,
          user_id: profile?.id,
        }])
        .select(`
          *,
          user_profile:profiles!task_comments_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });

      // Send email notification about the comment
      try {
        const { data: taskData } = await supabase
          .from('tasks')
          .select(`
            title,
            assigned_to,
            created_by,
            assigned_profile:profiles!tasks_assigned_to_fkey(email, full_name),
            creator_profile:profiles!tasks_created_by_fkey(email, full_name)
          `)
          .eq('id', variables.task_id)
          .single();

        if (taskData) {
          const notifyEmails = [];
          
          // Notify assigned user (if not the commenter)
          if (taskData.assigned_to !== profile?.id && taskData.assigned_profile) {
            notifyEmails.push({
              to: taskData.assigned_profile.email,
              recipientName: taskData.assigned_profile.full_name,
            });
          }
          
          // Notify task creator (if not the commenter and not already notified)
          if (taskData.created_by !== profile?.id && 
              taskData.created_by !== taskData.assigned_to && 
              taskData.creator_profile) {
            notifyEmails.push({
              to: taskData.creator_profile.email,
              recipientName: taskData.creator_profile.full_name,
            });
          }

          // Send emails
          for (const emailData of notifyEmails) {
            await emailNotifications.sendCommentAddedEmail({
              ...emailData,
              taskTitle: taskData.title,
              taskId: variables.task_id,
              commentId: data.id,
              commenterName: profile?.full_name || 'Unknown User',
            });
          }
        }
      } catch (error) {
        console.error('Failed to send comment notification email:', error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error Adding Comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { data, error } = await supabase
        .from('task_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast({
        title: "Comment Deleted",
        description: "Comment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    error: commentsQuery.error,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}