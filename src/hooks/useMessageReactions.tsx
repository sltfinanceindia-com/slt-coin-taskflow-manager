import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ProcessedReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

export const useMessageReactions = (messageId?: string) => {
  const { profile } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch reactions for a specific message
  const fetchReactions = async (msgId: string) => {
    if (!msgId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', msgId);

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add reaction
  const addReaction = async (msgId: string, emoji: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: msgId,
          user_id: profile.id,
          emoji: emoji
        });

      if (error) throw error;
      
      toast.success('Reaction added');
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
      return false;
    }
  };

  // Remove reaction
  const removeReaction = async (msgId: string, emoji: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', msgId)
        .eq('user_id', profile.id)
        .eq('emoji', emoji);

      if (error) throw error;
      
      toast.success('Reaction removed');
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Failed to remove reaction');
      return false;
    }
  };

  // Process reactions for display
  const processReactions = (messageReactions: MessageReaction[]): ProcessedReaction[] => {
    const emojiMap = new Map<string, ProcessedReaction>();

    messageReactions.forEach(reaction => {
      const existing = emojiMap.get(reaction.emoji);
      const hasReacted = reaction.user_id === profile?.id;

      if (existing) {
        existing.count++;
        existing.users.push(reaction.user_id);
        if (hasReacted) existing.hasReacted = true;
      } else {
        emojiMap.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.user_id],
          hasReacted
        });
      }
    });

    return Array.from(emojiMap.values());
  };

  // Get processed reactions for a message
  const getMessageReactions = (msgId: string): ProcessedReaction[] => {
    const messageReactions = reactions.filter(r => r.message_id === msgId);
    return processReactions(messageReactions);
  };

  useEffect(() => {
    if (messageId) {
      fetchReactions(messageId);
    }
  }, [messageId]);

  // Set up real-time subscription for reactions
  useEffect(() => {
    if (!messageId) return;

    const channel = supabase
      .channel('message_reactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          fetchReactions(messageId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  return {
    reactions,
    loading,
    addReaction,
    removeReaction,
    getMessageReactions,
    processReactions
  };
};