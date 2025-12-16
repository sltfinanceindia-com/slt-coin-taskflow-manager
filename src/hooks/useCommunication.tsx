import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  is_direct_message: boolean | null;
  member_count: number | null;
  unread_count: number;
  participant_ids: string[] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id?: string | null;
  last_message?: {
    content: string;
    sender_name: string;
    timestamp: string;
  };
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string | null;
  sender_role?: string | null;
  channel_id?: string | null;
  receiver_id?: string | null;
  message_type: string;
  attachments: any;
  reactions: any;
  mentions: string[] | null;
  reply_to?: string | null;
  thread_count: number | null;
  is_read: boolean | null;
  is_edited: boolean | null;
  is_pinned: boolean | null;
  created_at: string;
  edited_at?: string | null;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  department?: string;
  organization_id?: string;
  is_online: boolean;
  activity_status: 'online' | 'away' | 'busy' | 'offline';
  status_message?: string;
  last_seen?: string;
}

type LoadingStep = 'validating' | 'team' | 'channels' | 'ready' | null;
type Status = 'idle' | 'loading' | 'ready' | 'error';

export function useCommunication() {
  const { profile, session } = useAuth();
  const { notifyMessage } = useNotifications();
  
  // State machine
  const [status, setStatus] = useState<Status>('idle');
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<TeamMember[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isMounted = useRef(true);

  // Validate session before any operation
  const validateSession = useCallback(async (): Promise<boolean> => {
    console.log('[Comm] Validating session...');
    
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Comm] Session error:', error);
        return false;
      }
      
      if (!currentSession) {
        console.log('[Comm] No active session');
        return false;
      }
      
      // Check if session expires in less than 5 minutes
      const expiresAt = new Date((currentSession.expires_at || 0) * 1000);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      
      if (expiresAt < fiveMinutesFromNow) {
        console.log('[Comm] Session expiring soon, refreshing...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('[Comm] Session refresh failed:', refreshError);
          return false;
        }
      }
      
      console.log('[Comm] Session valid');
      return true;
    } catch (err) {
      console.error('[Comm] Session validation error:', err);
      return false;
    }
  }, []);

  // Fetch team members (fast query, do first)
  const fetchTeamMembers = useCallback(async (): Promise<TeamMember[]> => {
    if (!profile?.organization_id) {
      console.log('[Comm] No org, skipping team fetch');
      return [];
    }
    
    console.log('[Comm] Fetching team members for org:', profile.organization_id);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, department, role, is_active, organization_id')
      .eq('is_active', true)
      .eq('organization_id', profile.organization_id)
      .order('full_name');

    if (profilesError) {
      console.error('[Comm] Team fetch error:', profilesError);
      throw new Error('Failed to load team members');
    }

    // Fetch presence data separately
    const { data: presenceData } = await supabase
      .from('user_presence')
      .select('*');

    const teamMembersData: TeamMember[] = (profiles || []).map(profileData => {
      const presence = presenceData?.find(p => p.user_id === profileData.id);
      
      return {
        id: profileData.id,
        full_name: profileData.full_name || 'Unknown',
        email: profileData.email || '',
        role: profileData.role || 'employee',
        avatar_url: profileData.avatar_url,
        department: profileData.department,
        organization_id: profileData.organization_id,
        is_online: presence?.is_online || false,
        activity_status: (presence?.activity_status as 'online' | 'away' | 'busy' | 'offline') || 'offline',
        status_message: presence?.status_message || undefined,
        last_seen: presence?.last_seen || undefined
      };
    });

    console.log('[Comm] Loaded', teamMembersData.length, 'team members');
    return teamMembersData;
  }, [profile?.organization_id]);

  // Fetch channels
  const fetchChannels = useCallback(async (): Promise<Channel[]> => {
    if (!profile?.id || !profile?.organization_id) {
      console.log('[Comm] No profile/org, skipping channel fetch');
      return [];
    }

    console.log('[Comm] Fetching channels...');
    
    const { data: channelsData, error: channelsError } = await supabase
      .from('communication_channels')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (channelsError) {
      console.error('[Comm] Channel fetch error:', channelsError);
      throw new Error('Failed to load channels');
    }

    console.log('[Comm] Loaded', channelsData?.length || 0, 'channels');

    return (channelsData || []).map(channel => ({
      ...channel,
      unread_count: 0,
      last_message: undefined
    }));
  }, [profile?.id, profile?.organization_id]);

  // Fetch messages for selected channel
  const fetchMessages = useCallback(async (channelId: string) => {
    if (!channelId) return;

    setIsLoadingMessages(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          file_attachments (
            id, file_name, file_size, file_type, storage_path, uploaded_by, created_at
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages((messagesData || []) as Message[]);
    } catch (err) {
      console.error('[Comm] Message fetch error:', err);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string, channelId?: string, receiverId?: string): Promise<string | void> => {
    if (!profile?.id || (!channelId && !receiverId) || !content.trim()) {
      return;
    }

    try {
      const messageData = {
        content: content.trim(),
        sender_id: profile.id,
        sender_name: profile.full_name,
        sender_role: profile.role,
        channel_id: channelId,
        receiver_id: receiverId,
        organization_id: profile.organization_id,
        message_type: 'text' as const,
        attachments: [],
        reactions: [],
        mentions: [],
        thread_count: 0,
        is_read: false,
        is_edited: false,
        is_pinned: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select('id')
        .single();

      if (error) throw error;

      // Update channel's last_message_at
      if (channelId) {
        await supabase
          .from('communication_channels')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', channelId);
      }

      return data.id;
    } catch (err) {
      console.error('[Comm] Send message error:', err);
      toast.error('Failed to send message');
    }
  }, [profile]);

  // Create direct message channel
  const createDirectMessage = useCallback(async (memberId: string) => {
    if (!profile?.id || !memberId) return;

    try {
      console.log('[Comm] Creating DM with:', memberId);
      
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: memberId
      });

      if (error) throw error;

      const { data: channelData, error: channelError } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('id', data)
        .single();

      if (channelError) throw channelError;

      const newChannel: Channel = {
        ...channelData,
        unread_count: 0,
        last_message: undefined
      };

      setSelectedChannel(newChannel);
      setChannels(prev => {
        const exists = prev.some(c => c.id === newChannel.id);
        if (exists) return prev;
        return [newChannel, ...prev];
      });
      
      // Fetch messages for the new channel
      fetchMessages(newChannel.id);

      return newChannel;
    } catch (err) {
      console.error('[Comm] Create DM error:', err);
      toast.error('Failed to create conversation');
    }
  }, [profile?.id, fetchMessages]);

  // Handle channel selection
  const selectChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    fetchMessages(channel.id);
    
    if (channel.unread_count > 0 && profile?.id) {
      supabase
        .from('channel_read_status')
        .upsert({
          channel_id: channel.id,
          user_id: profile.id,
          last_read_at: new Date().toISOString(),
          organization_id: profile.organization_id
        })
        .then(() => {
          setChannels(prev => prev.map(c => 
            c.id === channel.id ? { ...c, unread_count: 0 } : c
          ));
        });
    }
  }, [profile?.id, profile?.organization_id, fetchMessages]);

  // Main data loading function
  const loadData = useCallback(async () => {
    if (!profile?.id || !profile?.organization_id) {
      console.log('[Comm] Waiting for profile...');
      setStatus('idle');
      return;
    }

    setStatus('loading');
    setError(null);
    
    try {
      // Step 1: Validate session
      setLoadingStep('validating');
      console.log('[Comm] Step 1: Validating session');
      const sessionValid = await validateSession();
      
      if (!sessionValid) {
        throw new Error('Session expired. Please refresh the page.');
      }

      if (!isMounted.current) return;

      // Step 2: Fetch team members first (faster)
      setLoadingStep('team');
      console.log('[Comm] Step 2: Loading team members');
      const team = await fetchTeamMembers();
      
      if (!isMounted.current) return;
      setTeamMembers(team);

      // Step 3: Fetch channels
      setLoadingStep('channels');
      console.log('[Comm] Step 3: Loading channels');
      const channelList = await fetchChannels();
      
      if (!isMounted.current) return;
      setChannels(channelList);

      // Done
      setLoadingStep('ready');
      setStatus('ready');
      retryCount.current = 0;
      console.log('[Comm] ✅ All data loaded successfully');
      
    } catch (err: any) {
      console.error('[Comm] Load error:', err);
      
      if (!isMounted.current) return;
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 8000);
        console.log(`[Comm] Retry ${retryCount.current}/${maxRetries} in ${delay}ms`);
        setTimeout(loadData, delay);
        return;
      }
      
      setStatus('error');
      setLoadingStep(null);
      setError(err.message || 'Failed to connect. Please try again.');
    }
  }, [profile?.id, profile?.organization_id, validateSession, fetchTeamMembers, fetchChannels]);

  // Refresh function
  const refresh = useCallback(() => {
    console.log('[Comm] Manual refresh triggered');
    retryCount.current = 0;
    loadData();
  }, [loadData]);

  // Initial load effect
  useEffect(() => {
    isMounted.current = true;
    loadData();
    
    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile?.id || !profile?.organization_id || status !== 'ready') return;

    const messagesChannel = supabase
      .channel('messages-rt-' + profile.organization_id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `organization_id=eq.${profile.organization_id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Add to messages if in current channel
        if (selectedChannel && newMessage.channel_id === selectedChannel.id) {
          setMessages(prev => [...prev, newMessage]);
        }
        
        // Notify if not from current user and not in current channel
        if (newMessage.sender_id !== profile.id && 
            (!selectedChannel || newMessage.channel_id !== selectedChannel.id)) {
          notifyMessage(
            { name: newMessage.sender_name || 'Unknown User', avatar: undefined },
            newMessage.content,
            !newMessage.channel_id
          );
        }
        
        // Update channel last message
        setChannels(prev => prev.map(channel => {
          if (channel.id === newMessage.channel_id) {
            return {
              ...channel,
              last_message: {
                content: newMessage.content,
                sender_name: newMessage.sender_name || 'Unknown',
                timestamp: newMessage.created_at
              },
              unread_count: selectedChannel?.id === channel.id ? 0 : channel.unread_count + 1
            };
          }
          return channel;
        }));
      })
      .subscribe();

    const presenceChannel = supabase
      .channel('presence-rt-' + profile.organization_id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence'
      }, () => {
        // Refresh team member presence
        fetchTeamMembers().then(setTeamMembers);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [profile?.id, profile?.organization_id, selectedChannel?.id, status, fetchTeamMembers, notifyMessage]);

  // Computed values
  const isLoading = status === 'loading';

  return {
    // State
    status,
    loadingStep,
    error,
    isLoading,
    isLoadingMessages,
    
    // Data
    channels,
    selectedChannel,
    messages,
    teamMembers,
    typingUsers,
    searchQuery,
    
    // Actions
    setSearchQuery,
    selectChannel,
    sendMessage,
    createDirectMessage,
    fetchMessages,
    refresh
  };
}
