import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useCallback, useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/** 
 * Interfaces for robust type safety
 */
export interface CommentUserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  attachments: any[];
  created_at: string;
  updated_at: string;
  user_profile?: CommentUserProfile;
}

export interface TaskAssignee {
  email: string;
  full_name: string;
}

export interface TaskWithDetails {
  title: string;
  assigned_to: string;
  created_by: string;
  assigned_profile?: TaskAssignee;
  creator_profile?: TaskAssignee;
}

export type AddCommentData = {
  task_id: string;
  content: string;
  mentions?: string[];
  attachments?: any[];
};

export type UpdateCommentData = {
  commentId: string;
  content: string;
};

/** 
 * Centralized query key builder for consistency and auto-complete
 */
const getTaskCommentsQueryKey = (taskId?: string): QueryKey => ['task-comments', taskId];

/** 
 * Use React Query + Supabase for real-time, cached, resilient task comments
 */
export function useTaskComments(taskId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();
  const abortSignalRef = useRef<AbortController>();
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ----- Query: Fetch Comments -----
  const commentsQuery = useQuery<TaskComment[], Error>({
    queryKey: getTaskCommentsQueryKey(taskId),
    queryFn: async ({ signal }) => {
      if (!taskId || !profile) return [];
      try {
        // Clean up any previous abort signals
        abortSignalRef.current?.abort();
        abortSignalRef.current = new AbortController();
        // Use the same signal for Supabase
        const { data, error } = await supabase
          .from('task_comments')
          .select('*, user_profile:profiles!task_comments_user_id_fkey(id, full_name, avatar_url)')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true })
          .abortSignal(abortSignalRef.current.signal); // Proper cleanup on component unmount or invalidation

        if (error) throw error;
        return (data ?? []) as TaskComment[];
      } catch (err) {
        console.error('[Comments Query] Failed:', err);
        throw err;
      }
    },
    enabled: !!taskId && !!profile,
    staleTime: 0,
  });

  // ----- Mutation: Add Comment -----
  const addCommentMutation = useMutation<TaskComment, Error, AddCommentData>({
    mutationFn: async (commentData) => {
      if (!profile?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{ ...commentData, user_id: profile.id }])
        .select('*, user_profile:profiles!task_comments_user_id_fkey(id, full_name, avatar_url)')
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newComment) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: getTaskCommentsQueryKey(taskId) });
      const previousComments = queryClient.getQueryData<TaskComment[]>(getTaskCommentsQueryKey(taskId)) ?? [];
      const optimisticComment: TaskComment = {
        id: `opt-${Date.now()}`,
        task_id: newComment.task_id,
        user_id: profile?.id!,
        content: newComment.content,
        mentions: newComment.mentions ?? [],
        attachments: newComment.attachments ?? [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profile: { id: profile?.id!, full_name: profile?.full_name!, avatar_url: profile?.avatar_url },
      };
      queryClient.setQueryData<TaskComment[]>(
        getTaskCommentsQueryKey(taskId),
        [...previousComments, optimisticComment]
      );
      return { previousComments };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      toast({
        title: 'Error Adding Comment',
        description: 'Failed to add your comment. Please try again.',
        variant: 'destructive',
      });
      if (context?.previousComments) {
        queryClient.setQueryData(
          getTaskCommentsQueryKey(taskId),
          context.previousComments
        );
      }
    },
    onSettled: () => {
      // Regardless of outcome, ensure the query is refetched for consistency
      queryClient.invalidateQueries({ queryKey: getTaskCommentsQueryKey(taskId) });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Comment Added',
        description: 'Your comment has been posted successfully.',
      });
      // Schedule email, not blocking UI (and debounce to avoid burst-sending)
      clearTimeout(emailDebounceRef.current);
      emailDebounceRef.current = setTimeout(async () => {
        processEmailNotifications(data, variables, profile?.full_name);
      }, 1000);
    },
  });

  // ----- Mutation: Update Comment -----
  const updateCommentMutation = useMutation<TaskComment, Error, UpdateCommentData>({
    mutationFn: async ({ commentId, content }) => {
      const { data, error } = await supabase
        .from('task_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ commentId, content }) => {
      await queryClient.cancelQueries({ queryKey: getTaskCommentsQueryKey(taskId) });
      const previousComments = queryClient.getQueryData<TaskComment[]>(getTaskCommentsQueryKey(taskId)) ?? [];
      const updatedComments = previousComments.map(c =>
        c.id === commentId ? { ...c, content, updated_at: new Date().toISOString() } : c
      );
      queryClient.setQueryData(
        getTaskCommentsQueryKey(taskId),
        updatedComments
      );
      return { previousComments };
    },
    onError: (_err, _variables, context) => {
      toast({
        title: 'Error Updating Comment',
        description: 'Failed to update your comment. Please try again.',
        variant: 'destructive',
      });
      if (context?.previousComments) {
        queryClient.setQueryData(
          getTaskCommentsQueryKey(taskId),
          context.previousComments
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getTaskCommentsQueryKey(taskId) });
    },
    onSuccess: () => {
      toast({
        title: 'Comment Updated',
        description: 'Your comment has been updated successfully.',
      });
    },
  });

  // ----- Mutation: Delete Comment -----
  const deleteCommentMutation = useMutation<void, Error, string>({
    mutationFn: async (commentId) => {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: getTaskCommentsQueryKey(taskId) });
      const previousComments = queryClient.getQueryData<TaskComment[]>(getTaskCommentsQueryKey(taskId)) ?? [];
      const updatedComments = previousComments.filter(c => c.id !== commentId);
      queryClient.setQueryData(
        getTaskCommentsQueryKey(taskId),
        updatedComments
      );
      return { previousComments };
    },
    onError: (_err, _variables, context) => {
      toast({
        title: 'Error Deleting Comment',
        description: 'Failed to delete your comment. Please try again.',
        variant: 'destructive',
      });
      if (context?.previousComments) {
        queryClient.setQueryData(
          getTaskCommentsQueryKey(taskId),
          context.previousComments
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getTaskCommentsQueryKey(taskId) });
    },
    onSuccess: () => {
      toast({
        title: 'Comment Deleted',
        description: 'Comment has been deleted successfully.',
      });
    },
  });

  // ----- Email Notification Utilities (memoized for stability) -----
  const processEmailNotifications = useCallback(
    async (comment: TaskComment, commentData: AddCommentData, commenterName?: string) => {
      if (!taskId) return;

      try {
        const { data: taskData } = await supabase
          .from('tasks')
          .select('title, assigned_to, created_by, assigned_profile:profiles!tasks_assigned_to_fkey(email, full_name), creator_profile:profiles!tasks_created_by_fkey(email, full_name)')
          .eq('id', commentData.task_id)
          .single();

        if (!taskData) return;

        // Collect recipients (deduplicated)
        const recipients = new Map<string, [string, string]>();
        if (taskData.assigned_to !== profile?.id && taskData.assigned_profile) {
          recipients.set(taskData.assigned_profile.email, [
            taskData.assigned_profile.full_name,
            'Assignee',
          ]);
        }
        if (
          taskData.created_by !== profile?.id &&
          taskData.created_by !== taskData.assigned_to &&
          taskData.creator_profile
        ) {
          recipients.set(taskData.creator_profile.email, [
            taskData.creator_profile.full_name,
            'Creator',
          ]);
        }

        // Send emails at a controlled rate
        for (const [email, [name, role]] of recipients.entries()) {
          try {
            await emailNotifications.sendCommentAddedEmail({
              to: email,
              recipientName: name,
              taskTitle: taskData.title,
              taskId: commentData.task_id,
              commentId: comment.id,
              commenterName: commenterName || 'Unknown User',
              recipientRole: role,
            });
          } catch (emailErr) {
            console.error('[Email Error] Failed to send comment notification:', emailErr);
          }
        }
      } catch (error) {
        console.error('[Notification Backend Error] Failed to process:', error);
      }
    },
    [profile?.id, taskId, emailNotifications]
  );

  // ----- Cleanup on Unmount -----
  // Cancel in-flight requests and timers
  useEffect(() => {
    return () => {
      abortSignalRef.current?.abort();
      clearTimeout(emailDebounceRef.current);
    };
  }, []);

  // ----- Return Hook API -----
  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isFetching,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
}
