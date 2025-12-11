import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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

export function useCommunication() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { notifyMessage } = useNotifications();
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Simplified channel fetch - RLS handles filtering now
  const fetchChannels = useCallback(async () => {
    if (!profile?.id || !profile?.organization_id) {
      console.log('[Comm] No profile/org, skipping channel fetch');
      setChannels([]);
      return;
    }

    try {
      console.log('[Comm] Fetching channels...');
      
      const { data: channelsData, error: channelsError } = await supabase
        .from('communication_channels')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (channelsError) {
        console.error('[Comm] Channel error:', channelsError);
        throw channelsError;
      }

      console.log('[Comm] Got channels:', channelsData?.length || 0);

      const channelsWithMetadata: Channel[] = (channelsData || []).map(channel => ({
        ...channel,
        unread_count: 0,
        last_message: undefined
      }));

      setChannels(channelsWithMetadata);
    } catch (err: any) {
      console.error('[Comm] fetchChannels error:', err);
      throw err;
    }
  }, [profile?.id, profile?.organization_id]);

  // Simplified team members fetch
  const fetchTeamMembers = useCallback(async () => {
    if (!profile?.organization_id) {
      console.log('[Comm] No org, skipping team fetch');
      return;
    }
    
    try {
      console.log('[Comm] Fetching team members...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, department, role, is_active, organization_id')
        .eq('is_active', true)
        .eq('organization_id', profile.organization_id)
        .order('full_name');

      if (profilesError) {
        console.error('[Comm] Team error:', profilesError);
        throw profilesError;
      }

      // Fetch presence data
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('*');

      const teamMembersData: TeamMember[] = (profiles || []).map(profileData => {
        const presence = presenceData?.find(p => p.user_id === profileData.id);
        
        return {
          id: profileData.id,
          full_name: profileData.full_name || 'Unknown',
          email: profileData.email || '',
          role: profileData.role || 'intern',
          avatar_url: profileData.avatar_url,
          department: profileData.department,
          organization_id: profileData.organization_id,
          is_online: presence?.is_online || false,
          activity_status: (presence?.activity_status as 'online' | 'away' | 'busy' | 'offline') || 'offline',
          status_message: presence?.status_message || undefined,
          last_seen: presence?.last_seen || undefined
        };
      });

      console.log('[Comm] Got team members:', teamMembersData.length);
      setTeamMembers(teamMembersData);
    } catch (err) {
      console.error('[Comm] fetchTeamMembers error:', err);
      throw err;
    }
  }, [profile?.organization_id]);

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
      console.error('[Comm] fetchMessages error:', err);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

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
      console.error('[Comm] sendMessage error:', err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [profile, toast]);

  // Get channel display name
  const getChannelDisplayName = useCallback((channel: Channel) => {
    if (!channel.is_direct_message) {
      return channel.name;
    }
    
    const otherParticipantId = channel.participant_ids?.find(id => id !== profile?.id);
    if (otherParticipantId) {
      const otherUser = teamMembers.find(member => member.id === otherParticipantId);
      if (otherUser) {
        const status = otherUser.is_online ? '🟢 ' : 
                      otherUser.activity_status === 'away' ? '🟡 ' :
                      otherUser.activity_status === 'busy' ? '🔴 ' : '⚫ ';
        return `${status}${otherUser.full_name}`;
      }
      return 'Direct Message';
    }
    
    return 'Direct Message';
  }, [profile?.id, teamMembers]);

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

      const newChannel = {
        ...channelData,
        unread_count: 0,
        last_message: undefined
      };

      setSelectedChannel(newChannel);
      setChannels(prev => {
        const exists = prev.some(c => c.id === newChannel.id);
        if (exists) return prev;
        return [...prev, newChannel];
      });

      return newChannel;
    } catch (err) {
      console.error('[Comm] createDirectMessage error:', err);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
    }
  }, [profile?.id, toast]);

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

  // Load data with retry logic
  const loadData = useCallback(async () => {
    if (!profile?.id || !profile?.organization_id) {
      console.log('[Comm] No profile/org, stopping');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[Comm] Loading data, attempt:', retryCount.current + 1);
      
      // Fetch in parallel
      await Promise.all([
        fetchTeamMembers(),
        fetchChannels()
      ]);
      
      retryCount.current = 0;
      console.log('[Comm] Data loaded successfully');
    } catch (err: any) {
      console.error('[Comm] Load error:', err);
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 8000);
        console.log(`[Comm] Retry ${retryCount.current}/${maxRetries} in ${delay}ms`);
        setTimeout(loadData, delay);
        return;
      }
      
      setError('Failed to connect. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, profile?.organization_id, fetchChannels, fetchTeamMembers]);

  // Refresh function
  const refresh = useCallback(() => {
    retryCount.current = 0;
    loadData();
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile?.id || !profile?.organization_id) return;

    const messagesChannel = supabase
      .channel('messages-org-' + profile.organization_id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `organization_id=eq.${profile.organization_id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        if (selectedChannel && newMessage.channel_id === selectedChannel.id) {
          setMessages(prev => [...prev, newMessage]);
        }
        
        if (newMessage.sender_id !== profile.id && 
            (!selectedChannel || newMessage.channel_id !== selectedChannel.id)) {
          notifyMessage(
            { name: newMessage.sender_name || 'Unknown User', avatar: undefined },
            newMessage.content,
            !newMessage.channel_id
          );
        }
        
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
      .channel('presence-org-' + profile.organization_id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence'
      }, () => {
        fetchTeamMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [profile?.id, profile?.organization_id, selectedChannel?.id, fetchTeamMembers, notifyMessage]);

  return {
    channels,
    selectedChannel,
    messages,
    teamMembers,
    typingUsers,
    isLoading,
    isLoadingMessages,
    searchQuery,
    error,
    setSearchQuery,
    selectChannel,
    sendMessage,
    createDirectMessage,
    getChannelDisplayName,
    fetchChannels,
    fetchMessages,
    refresh
  };
}
