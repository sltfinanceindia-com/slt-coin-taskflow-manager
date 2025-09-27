import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageState {
  id: string;
  message_id: string;
  user_id: string;
  state: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

export const useMessageStates = (messageId?: string) => {
  const { user } = useAuth();
  const [messageStates, setMessageStates] = useState<MessageState[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch message states for a specific message
  const fetchMessageStates = async (msgId: string) => {
    if (!msgId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_states')
        .select('*')
        .eq('message_id', msgId);

      if (error) throw error;
      setMessageStates((data || []) as MessageState[]);
    } catch (error) {
      console.error('Error fetching message states:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update message state
  const updateMessageState = async (
    msgId: string, 
    userId: string, 
    state: 'sent' | 'delivered' | 'read'
  ) => {
    try {
      const { error } = await supabase
        .from('message_states')
        .upsert({
          message_id: msgId,
          user_id: userId,
          state: state,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message state:', error);
    }
  };

  // Mark message as delivered for current user
  const markAsDelivered = async (msgId: string) => {
    if (!user) return;
    await updateMessageState(msgId, user.id, 'delivered');
  };

  // Mark message as read for current user
  const markAsRead = async (msgId: string) => {
    if (!user) return;
    await updateMessageState(msgId, user.id, 'read');
  };

  // Get message state for current user
  const getMessageState = (msgId: string): 'sent' | 'delivered' | 'read' | undefined => {
    if (!user) return undefined;
    const state = messageStates.find(s => s.message_id === msgId && s.user_id === user.id);
    return state?.state;
  };

  useEffect(() => {
    if (messageId) {
      fetchMessageStates(messageId);
    }
  }, [messageId]);

  // Set up real-time subscription for message states
  useEffect(() => {
    if (!messageId) return;

    const channel = supabase
      .channel('message_states_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_states',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          fetchMessageStates(messageId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  return {
    messageStates,
    loading,
    markAsDelivered,
    markAsRead,
    getMessageState,
    updateMessageState
  };
};