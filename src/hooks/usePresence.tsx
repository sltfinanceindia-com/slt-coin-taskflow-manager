import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  status: string;
  status_message?: string;
  activity_status: 'online' | 'away' | 'offline';
  manual_status?: string;
  last_seen: string;
  last_activity_at: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
}

export function usePresence() {
  const { profile } = useAuth();
  const [presenceList, setPresenceList] = useState<UserPresence[]>([]);
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize presence tracking
  useEffect(() => {
    if (!profile?.id) return;

    // Set initial online status
    updatePresenceStatus(true);

    // Set up heartbeat to maintain online status
    heartbeatInterval.current = setInterval(() => {
      updatePresenceStatus(true);
    }, 30000); // Update every 30 seconds

    // Set up status checker for away/offline detection
    statusCheckInterval.current = setInterval(() => {
      checkAndUpdateAwayStatus();
    }, 60000); // Check every minute

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresenceStatus(false);
      } else {
        updatePresenceStatus(true);
      }
    };

    // Handle beforeunload to set offline
    const handleBeforeUnload = () => {
      updatePresenceStatus(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Fetch all user presence
    fetchPresenceList();

    // Set up real-time listener for presence changes
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
          fetchPresenceList();
        }
      )
      .subscribe();

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresenceStatus(false);
      supabase.removeChannel(presenceChannel);
    };
  }, [profile?.id]);

  const updatePresenceStatus = async (isOnline: boolean, statusMessage?: string, manualStatus?: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase.rpc('update_user_presence', {
        p_user_id: profile.id,
        p_is_online: isOnline,
        p_status_message: statusMessage,
        p_manual_status: manualStatus
      });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const checkAndUpdateAwayStatus = async () => {
    if (!profile?.id) return;

    try {
      // This would typically check for user activity
      // For now, we'll just update the last activity timestamp if user is active
      const lastActivity = localStorage.getItem('lastActivity');
      const now = Date.now();
      
      if (lastActivity && now - parseInt(lastActivity) > 5 * 60 * 1000) { // 5 minutes of inactivity
        updatePresenceStatus(true, undefined, 'away');
      }
    } catch (error) {
      console.error('Error checking away status:', error);
    }
  };

  const fetchPresenceList = async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('Error fetching presence list:', error);
        return;
      }

      const presenceData = data?.map((presence: any) => ({
        ...presence,
        profile: presence.profile
      })) || [];

      setPresenceList(presenceData);

      // Find current user's presence
      const currentUserPresence = presenceData.find((p: any) => p.user_id === profile?.id);
      setMyPresence(currentUserPresence || null);
    } catch (error) {
      console.error('Error fetching presence list:', error);
    }
  };

  const setUserStatus = async (status: string, statusMessage?: string) => {
    await updatePresenceStatus(true, statusMessage, status);
  };

  const getUserPresence = (userId: string): UserPresence | undefined => {
    return presenceList.find(p => p.user_id === userId);
  };

  const getStatusBadgeColor = (presence: UserPresence | undefined) => {
    if (!presence || !presence.is_online) return 'bg-gray-400';
    
    switch (presence.activity_status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (presence: UserPresence | undefined) => {
    if (!presence) return 'Offline';
    
    if (presence.manual_status) return presence.manual_status;
    
    if (!presence.is_online) return 'Offline';
    
    switch (presence.activity_status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  // Track user activity
  const trackActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
    if (myPresence?.activity_status !== 'online') {
      updatePresenceStatus(true);
    }
  };

  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      trackActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []); // Remove myPresence dependency to prevent infinite loops

  return {
    presenceList,
    myPresence,
    updatePresenceStatus,
    setUserStatus,
    getUserPresence,
    getStatusBadgeColor,
    getStatusText,
    fetchPresenceList
  };
}