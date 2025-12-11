import { useState, useEffect, useCallback } from 'react';
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

// Timeout utility for database queries
const fetchWithTimeout = async <T,>(
  queryBuilder: PromiseLike<T>, 
  timeoutMs: number = 10000
): Promise<T> => {
  const promise = Promise.resolve(queryBuilder);
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

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

  // Fetch channels - simplified query that relies on RLS
  const fetchChannels = useCallback(async () => {
    if (!profile?.id || !profile?.organization_id) {
      console.log('⏭️ Skipping channel fetch - no profile ID or organization');
      setChannels([]);
      return;
    }

    try {
      console.log('📡 Fetching channels for org:', profile.organization_id);
      setError(null);
      
      // Direct query - RLS handles access control
      const { data: channelsData, error: channelsError } = await fetchWithTimeout(
        supabase
          .from('communication_channels')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('last_message_at', { ascending: false, nullsFirst: false }),
        15000
      );

      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
        throw channelsError;
      }

      console.log('📢 Fetched channels:', channelsData?.length || 0);

      // Get last messages for channels (non-blocking)
      let lastMessages: any[] = [];
      if (channelsData && channelsData.length > 0) {
        const channelIds = channelsData.map(c => c.id);
        try {
          const { data } = await fetchWithTimeout(
            supabase
              .from('messages')
              .select('channel_id, content, sender_name, created_at')
              .in('channel_id', channelIds)
              .order('created_at', { ascending: false }),
            5000
          );
          lastMessages = data || [];
        } catch (e) {
          console.warn('⚠️ Could not fetch last messages, continuing without them');
        }
      }

      const channelsWithMetadata: Channel[] = (channelsData || []).map(channel => {
        const lastMessage = lastMessages?.find(m => m.channel_id === channel.id);
        
        return {
          ...channel,
          unread_count: 0,
          last_message: lastMessage ? {
            content: lastMessage.content,
            sender_name: lastMessage.sender_name || 'Unknown',
            timestamp: lastMessage.created_at
          } : undefined
        };
      });

      setChannels(channelsWithMetadata);
      console.log('✅ Channels loaded successfully:', channelsWithMetadata.length);
    } catch (error: any) {
      console.error('❌ Error fetching channels:', error);
      const errorMessage = error?.message === 'Request timeout' 
        ? 'Connection timed out. Please check your network and try again.'
        : 'Failed to load channels. Please try again.';
      setError(errorMessage);
      setChannels([]);
    }
  }, [profile]);

  // Fetch team members - filtered by organization
  const fetchTeamMembers = useCallback(async () => {
    if (!profile || !profile.organization_id) return;
    
    try {
      console.log('🔍 Fetching team members for organization:', profile.organization_id);
      
      // Fetch only active profiles from the same organization
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, department, role, is_active, organization_id')
        .eq('is_active', true)
        .eq('organization_id', profile.organization_id)
        .order('full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*');

      if (presenceError) {
        console.error('Error fetching presence:', presenceError);
      }

      // Combine all data
      const teamMembersData: TeamMember[] = (profiles || []).map(profileData => {
        const presence = presenceData?.find(p => p.user_id === profileData.id);
        
        return {
          id: profileData.id,
          full_name: profileData.full_name,
          email: profileData.email,
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

      console.log(`✅ Fetched ${teamMembersData.length} team members from organization`);
      setTeamMembers(teamMembersData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }, [profile]);

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
            id,
            file_name,
            file_size,
            file_type,
            storage_path,
            uploaded_by,
            created_at
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages((messagesData || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      console.warn('⚠️ Cannot send message - missing required data');
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

      if (error) {
        console.error('Message insert error:', error);
        throw error;
      }

      console.log('✅ Message sent successfully with ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }, [profile, toast]);

  // Get channel display name (for direct messages, show the other person's name with status)
  const getChannelDisplayName = useCallback((channel: Channel) => {
    if (!channel.is_direct_message) {
      return channel.name;
    }
    
    // For direct messages, find the other participant
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
  }, [profile, teamMembers]);

  // Create or get direct message channel
  const createDirectMessage = useCallback(async (memberId: string) => {
    if (!profile || !memberId) return;

    try {
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: memberId
      });

      if (error) throw error;

      // Fetch the created/existing channel
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
    } catch (error) {
      console.error('Error creating direct message:', error);
      toast({
        title: "Error",
        description: "Failed to create direct message",
        variant: "destructive"
      });
    }
  }, [profile, toast]);

  // Handle channel selection
  const selectChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    fetchMessages(channel.id);
    
    // Mark channel as read
    if (channel.unread_count > 0) {
      supabase
        .from('channel_read_status')
        .upsert({
          channel_id: channel.id,
          user_id: profile?.id,
          last_read_at: new Date().toISOString(),
          organization_id: profile?.organization_id
        })
        .then(() => {
          setChannels(prev => prev.map(c => 
            c.id === channel.id ? { ...c, unread_count: 0 } : c
          ));
        });
    }
  }, [profile, fetchMessages]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile || !profile.organization_id) return;

    // Subscribe to new messages - filter by organization
    const messagesChannel = supabase
      .channel('messages-org-' + profile.organization_id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `organization_id=eq.${profile.organization_id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Update messages if in the current channel
        if (selectedChannel && newMessage.channel_id === selectedChannel.id) {
          setMessages(prev => [...prev, newMessage]);
        }
        
        // Show desktop notification for new messages (not from current user, not in current channel)
        if (newMessage.sender_id !== profile?.id && 
            (!selectedChannel || newMessage.channel_id !== selectedChannel.id)) {
          notifyMessage(
            {
              name: newMessage.sender_name || 'Unknown User',
              avatar: undefined
            },
            newMessage.content,
            !newMessage.channel_id
          );
        }
        
        // Update channel last message and unread count
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

    // Subscribe to presence changes for org members only
    const presenceChannel = supabase
      .channel('user_presence_org_' + profile.organization_id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence'
      }, (payload) => {
        // Only refetch if the presence change is for someone in our org
        fetchTeamMembers();
      })
      .subscribe();

    // Subscribe to profile changes for org only
    const profilesChannel = supabase
      .channel('profiles_org_' + profile.organization_id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `organization_id=eq.${profile.organization_id}`
      }, (payload) => {
        fetchTeamMembers();
        if (payload.eventType === 'UPDATE') {
          fetchChannels();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [profile?.id, profile?.organization_id, selectedChannel?.id, fetchTeamMembers, fetchChannels, notifyMessage]);

  // Initial data fetch with better error handling
  useEffect(() => {
    if (!profile?.id) {
      console.log('⏭️ No profile ID yet, waiting...');
      setIsLoading(false);
      return;
    }

    if (!profile?.organization_id) {
      console.log('⚠️ No organization_id in profile, setting loading to false');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      console.log('🔄 Fetching communication data for profile:', profile.id, 'org:', profile.organization_id);
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch team members first (they're always needed for DM)
        await fetchTeamMembers();
        // Then fetch channels
        await fetchChannels();
        console.log('✅ Communication data loaded');
      } catch (err: any) {
        console.error('❌ Failed to load communication data:', err);
        setError('Failed to load communication. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profile?.id, profile?.organization_id, fetchChannels, fetchTeamMembers]);

  // Refresh function for retry
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchChannels(), fetchTeamMembers()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchChannels, fetchTeamMembers]);

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
