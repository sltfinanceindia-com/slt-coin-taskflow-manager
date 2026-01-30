/**
 * Entity Comments Hook
 * Generic comments system for all entity types
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type EntityType = 'project' | 'ticket' | 'request' | 'risk' | 'issue' | 'milestone' | 'program' | 'portfolio';

export interface EntityComment {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  user_id: string;
  content: string;
  mentions?: string[];
  attachments?: Array<{ name: string; url: string; type: string }>;
  is_decision: boolean;
  decision_approved_by?: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  decision_approver?: {
    id: string;
    full_name: string;
  };
  replies?: EntityComment[];
}

export interface CreateCommentData {
  entity_type: EntityType;
  entity_id: string;
  content: string;
  mentions?: string[];
  attachments?: Array<{ name: string; url: string; type: string }>;
  is_decision?: boolean;
  parent_comment_id?: string;
}

export function useEntityComments(entityType: EntityType, entityId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['entity-comments', entityType, entityId],
    queryFn: async () => {
      if (!entityId || !profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('entity_comments')
        .select(`
          *,
          user:profiles!entity_comments_user_id_fkey(id, full_name, avatar_url),
          decision_approver:profiles!entity_comments_decision_approved_by_fkey(id, full_name)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('organization_id', profile.organization_id)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: any) => {
          const { data: replies } = await supabase
            .from('entity_comments')
            .select(`
              *,
              user:profiles!entity_comments_user_id_fkey(id, full_name, avatar_url)
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || [],
          };
        })
      );

      return commentsWithReplies as unknown as EntityComment[];
    },
    enabled: !!entityId && !!profile?.organization_id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const { data: result, error } = await supabase
        .from('entity_comments')
        .insert({
          ...data,
          user_id: profile?.id,
          organization_id: profile?.organization_id,
        })
        .select(`
          *,
          user:profiles!entity_comments_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-comments', entityType, entityId] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment: ' + error.message);
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content, is_decision }: { id: string; content?: string; is_decision?: boolean }) => {
      const updateData: Record<string, unknown> = {};
      if (content !== undefined) updateData.content = content;
      if (is_decision !== undefined) {
        updateData.is_decision = is_decision;
        if (is_decision) {
          updateData.decision_approved_by = profile?.id;
        }
      }

      const { data: result, error } = await supabase
        .from('entity_comments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-comments', entityType, entityId] });
      toast.success('Comment updated');
    },
    onError: (error) => {
      toast.error('Failed to update comment: ' + error.message);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('entity_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-comments', entityType, entityId] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete comment: ' + error.message);
    },
  });

  const markAsDecisionMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { data: result, error } = await supabase
        .from('entity_comments')
        .update({
          is_decision: true,
          decision_approved_by: profile?.id,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-comments', entityType, entityId] });
      toast.success('Marked as decision');
    },
    onError: (error) => {
      toast.error('Failed to mark as decision: ' + error.message);
    },
  });

  // Get decisions only
  const decisions = (commentsQuery.data || []).filter(c => c.is_decision);

  return {
    comments: commentsQuery.data || [],
    decisions,
    isLoading: commentsQuery.isLoading,
    error: commentsQuery.error,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    markAsDecision: markAsDecisionMutation.mutate,
    isAdding: addCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
}

// Hook for entity followers
export function useEntityFollowers(entityType: EntityType, entityId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const followersQuery = useQuery({
    queryKey: ['entity-followers', entityType, entityId],
    queryFn: async () => {
      if (!entityId || !profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('entity_followers')
        .select(`
          *,
          user:profiles!entity_followers_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      return data;
    },
    enabled: !!entityId && !!profile?.organization_id,
  });

  const isFollowing = followersQuery.data?.some(f => f.user_id === profile?.id) || false;

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (!entityId || !profile?.id) throw new Error('Missing required data');

      if (isFollowing) {
        const { error } = await supabase
          .from('entity_followers')
          .delete()
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .eq('user_id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('entity_followers')
          .insert({
            entity_type: entityType,
            entity_id: entityId,
            user_id: profile.id,
            organization_id: profile.organization_id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-followers', entityType, entityId] });
      toast.success(isFollowing ? 'Unfollowed' : 'Now following');
    },
    onError: (error) => {
      toast.error('Failed to update follow status: ' + error.message);
    },
  });

  return {
    followers: followersQuery.data || [],
    followerCount: followersQuery.data?.length || 0,
    isFollowing,
    isLoading: followersQuery.isLoading,
    toggleFollow: toggleFollowMutation.mutate,
    isToggling: toggleFollowMutation.isPending,
  };
}
