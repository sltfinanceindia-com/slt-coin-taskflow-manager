import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatUser {
  id: string;
  user_id: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  last_seen: string;
  is_active: boolean;
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
}

export const useChatUsers = () => {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserStatus, setCurrentUserStatus] = useState<string>('offline');

  // Fetch all chat users with their profiles
  const fetchChatUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_users')
        .select(`
          *,
          profile:profiles!inner(
            id,
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      // Type assertion since we know the structure matches ChatUser
      setChatUsers((data || []).map(item => ({
        ...item,
        status: item.status as 'online' | 'offline' | 'busy' | 'away'
      })) as ChatUser[]);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update current user status
  const updateUserStatus = async (status: 'online' | 'offline' | 'busy' | 'away') => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_chat_user_status', {
        p_user_id: user.id,
        p_status: status
      });

      if (error) throw error;
      setCurrentUserStatus(status);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Set user as online when component mounts
  useEffect(() => {
    if (user) {
      updateUserStatus('online');
      
      // Set up periodic heartbeat to maintain online status
      const heartbeat = setInterval(() => {
        updateUserStatus('online');
      }, 30000); // Update every 30 seconds

      // Set user as offline when tab is closed
      const handleBeforeUnload = () => {
        updateUserStatus('offline');
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(heartbeat);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateUserStatus('offline');
      };
    }
  }, [user]);

  // Fetch chat users on mount
  useEffect(() => {
    fetchChatUsers();
  }, []);

  // Set up real-time subscription for chat users
  useEffect(() => {
    const channel = supabase
      .channel('chat_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_users'
        },
        () => {
          fetchChatUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    chatUsers,
    loading,
    currentUserStatus,
    updateUserStatus,
    refetch: fetchChatUsers
  };
};