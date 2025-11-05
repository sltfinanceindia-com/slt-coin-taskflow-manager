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

  // Fetch all users from profiles table (including all interns/admins)
  const fetchChatUsers = async () => {
    try {
      // Get all active profiles (including admins and interns)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (profilesError) throw profilesError;

      if (profiles) {
        // Get user presence data for real-time status
        const { data: presenceData } = await supabase
          .from('user_presence')
          .select('*');

        // Get chat users status as fallback
        const { data: chatUsers } = await supabase
          .from('chat_users')
          .select('*');

        const chatUsersMap = new Map(chatUsers?.map(cu => [cu.user_id, cu]) || []);
        const presenceMap = new Map(presenceData?.map(p => [p.user_id, p]) || []);

        // Map profiles to chat users format
        const users: ChatUser[] = await Promise.all(
          profiles.map(async (profile) => {
            let chatUser = chatUsersMap.get(profile.id);
            const presence = presenceMap.get(profile.id);
            
            // Create chat user if doesn't exist
            if (!chatUser) {
              const { data: newChatUser, error: insertError } = await supabase
                .from('chat_users')
                .insert({
                  user_id: profile.id,
                  status: presence?.is_online ? 'online' : 'offline',
                  is_active: true
                })
                .select()
                .single();

              if (!insertError) {
                chatUser = newChatUser;
              }
            }

            // Determine status from presence data (more accurate) with fallback to chat_users
            const status = presence 
              ? (presence.is_online 
                  ? (presence.activity_status === 'busy' ? 'busy' 
                    : presence.activity_status === 'away' ? 'away' 
                    : 'online')
                  : 'offline')
              : (chatUser?.status || 'offline') as 'online' | 'offline' | 'busy' | 'away';

            return {
              id: profile.id,
              user_id: profile.id,
              status,
              last_seen: presence?.last_seen || chatUser?.last_seen || new Date().toISOString(),
              is_active: profile.is_active ?? true,
              profile: {
                id: profile.id,
                full_name: profile.full_name,
                email: profile.email,
                role: profile.role,
                avatar_url: profile.avatar_url
              }
            };
          })
        );

        setChatUsers(users);
      }
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

  // Set up real-time subscription for chat users and presence
  useEffect(() => {
    const chatUsersChannel = supabase
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

    const presenceChannel = supabase
      .channel('user_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        () => {
          fetchChatUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatUsersChannel);
      supabase.removeChannel(presenceChannel);
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