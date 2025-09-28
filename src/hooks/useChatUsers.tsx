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
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) throw profilesError;

      if (profiles) {
        // Map profiles to chat users format and ensure they exist in chat_users table
        const users: ChatUser[] = await Promise.all(
          profiles.map(async (profile) => {
            // Check if user exists in chat_users, if not create them
            const { data: chatUser, error: chatUserError } = await supabase
              .from('chat_users')
              .select('*')
              .eq('user_id', profile.id)
              .single();

            let status = 'offline';
            if (!chatUser && !chatUserError) {
              // Create chat user if doesn't exist
              await supabase
                .from('chat_users')
                .insert({
                  user_id: profile.id,
                  status: 'offline',
                  is_active: true
                });
            } else if (chatUser) {
              status = chatUser.status;
            }

            return {
              id: profile.id,
              user_id: profile.id,
              status: status as 'online' | 'offline' | 'busy' | 'away',
              last_seen: new Date().toISOString(),
              is_active: true,
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