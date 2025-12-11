import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Users, Phone, Video, Info, Plus, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
  message_type: "text" | "system" | "file";
  sender_profile?: {
    id?: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  is_direct_message?: boolean;
  participant_ids?: string[];
  created_at: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  is_muted?: boolean;
  is_pinned?: boolean;
  description?: string;
  member_count?: number;
}

interface TeamMember {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  is_online?: boolean;
  last_activity?: string;
}

export function SimpleCommunication() {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!profile?.id) return;
      
      try {
        console.log('[Communication] Fetching team members...');
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, role')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .neq('id', profile.id)
          .limit(20);

        if (error) {
          console.error('[Communication] Error fetching team members:', error);
          return;
        }

        console.log('[Communication] Team members found:', data?.length || 0);
        setTeamMembers(data?.map(member => ({
          ...member,
          is_online: false,
          last_activity: new Date().toISOString(),
        })) || []);
      } catch (err) {
        console.error('[Communication] Error fetching team members:', err);
      }
    };

    fetchTeamMembers();
  }, [profile?.id, profile?.organization_id]);

  // Fetch channels - simplified query
  useEffect(() => {
    const fetchChannels = async () => {
      if (!profile?.id) {
        console.log('[Communication] No profile ID, skipping channel fetch');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[Communication] Fetching channels for user:', profile.id);
        setError(null);

        // First, get channel IDs the user is a member of
        const { data: memberData, error: memberError } = await supabase
          .from('channel_members')
          .select('channel_id')
          .eq('user_id', profile.id);

        if (memberError) {
          console.error('[Communication] Error fetching channel memberships:', memberError);
          throw memberError;
        }

        console.log('[Communication] Channel memberships found:', memberData?.length || 0);

        if (!memberData || memberData.length === 0) {
          console.log('[Communication] No channel memberships found');
          setChannels([]);
          setIsLoading(false);
          return;
        }

        const channelIds = memberData.map(m => m.channel_id);

        // Now fetch the actual channels
        const { data: channelsData, error: channelsError } = await supabase
          .from('communication_channels')
          .select('*')
          .in('id', channelIds)
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (channelsError) {
          console.error('[Communication] Error fetching channels:', channelsError);
          throw channelsError;
        }

        console.log('[Communication] Channels fetched:', channelsData?.length || 0);

        const formattedChannels: Channel[] = (channelsData || []).map(channel => ({
          ...channel,
          type: channel.type as "public" | "private" | "direct",
          unread_count: channel.unread_count || 0,
          last_message: '',
          last_message_time: channel.last_message_at || channel.updated_at,
          last_message_sender: '',
          is_muted: channel.is_muted || false,
          is_pinned: channel.is_favorite || false,
        }));

        setChannels(formattedChannels);
        
        // Auto-select first channel if none selected
        if (formattedChannels.length > 0 && !selectedChannel) {
          setSelectedChannel(formattedChannels[0]);
        }
      } catch (err: any) {
        console.error('[Communication] Error:', err);
        setError(err.message || 'Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [profile?.id]);

  // Fetch messages for selected channel
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel) {
        setMessages([]);
        return;
      }

      try {
        console.log('[Communication] Fetching messages for channel:', selectedChannel.id);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', selectedChannel.id)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) {
          console.error('[Communication] Error fetching messages:', error);
          return;
        }

        console.log('[Communication] Messages fetched:', data?.length || 0);
        const formattedMessages = data?.map(msg => ({
          ...msg,
          message_type: (msg.message_type || 'text') as "text" | "system" | "file",
          sender_profile: {
            id: msg.sender_id,
            full_name: msg.sender_name || 'Unknown',
            avatar_url: '',
            role: msg.sender_role || '',
          },
        })) || [];

        setMessages(formattedMessages);
      } catch (err) {
        console.error('[Communication] Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    if (selectedChannel) {
      const channel = supabase
        .channel(`messages:${selectedChannel.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${selectedChannel.id}`,
          },
          (payload) => {
            console.log('[Communication] New message received:', payload);
            const newMsg = payload.new as any;
            setMessages(prev => [...prev, {
              ...newMsg,
              message_type: (newMsg.message_type || 'text') as "text" | "system" | "file",
              sender_profile: {
                id: newMsg.sender_id,
                full_name: newMsg.sender_name || 'Unknown',
                avatar_url: '',
                role: newMsg.sender_role || '',
              },
            }]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChannel?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: profile.id,
          channel_id: selectedChannel.id,
          message_type: 'text',
          sender_name: profile.full_name,
          sender_role: profile.role,
        });

      if (error) throw error;

      setNewMessage('');
    } catch (err: any) {
      console.error('[Communication] Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startDirectMessage = async (member: TeamMember) => {
    if (!profile) return;

    try {
      console.log('[Communication] Starting DM with:', member.full_name);
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: member.id,
      });

      if (error) throw error;

      // Fetch the created/existing channel
      const { data: channelData } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('id', data)
        .single();

      if (channelData) {
        const dmChannel: Channel = {
          ...channelData,
          type: 'direct' as const,
          name: member.full_name,
        };
        
        // Add to channels if not exists
        setChannels(prev => {
          const exists = prev.some(c => c.id === dmChannel.id);
          if (!exists) return [dmChannel, ...prev];
          return prev;
        });
        
        setSelectedChannel(dmChannel);
      }

      toast({
        title: "Direct message started",
        description: `Started conversation with ${member.full_name}`,
      });
    } catch (err: any) {
      console.error('[Communication] Error creating DM:', err);
      toast({
        title: "Error",
        description: "Failed to start direct message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message && channel.name === 'Direct Message') {
      return 'Direct Message';
    }
    return channel.name || 'Unknown Channel';
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message || channel.type === 'direct') {
      return <MessageSquare className="h-4 w-4 flex-shrink-0" />;
    }
    return channel.type === 'private' ? (
      <Users className="h-4 w-4 flex-shrink-0" />
    ) : (
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
    );
  };

  if (isLoading) {
    return (
      <Card className="h-[500px] sm:h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[500px] sm:h-[600px] flex items-center justify-center">
        <div className="text-center p-4">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
          <p className="text-destructive font-medium mb-2">Failed to load communication</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] sm:h-[600px] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col bg-muted/30",
        selectedChannel && "hidden md:flex"
      )}>
        <CardHeader className="pb-2 sm:pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            Communication
          </CardTitle>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Channels List */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Channels ({channels.length})
            </h3>
            <div className="space-y-1">
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No channels yet. Start a conversation below.
                </p>
              ) : (
                channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start min-h-[44px] text-sm"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    {getChannelIcon(channel)}
                    <span className="ml-2 truncate flex-1 text-left">
                      {getChannelDisplayName(channel)}
                    </span>
                    {channel.unread_count && channel.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {channel.unread_count}
                      </Badge>
                    )}
                  </Button>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Team Members */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Team Members ({teamMembers.length})
            </h3>
            <div className="space-y-1">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No team members found.
                </p>
              ) : (
                teamMembers.slice(0, 10).map((member) => (
                  <Button
                    key={member.id}
                    variant="ghost"
                    className="w-full justify-start min-h-[44px] text-sm"
                    onClick={() => startDirectMessage(member)}
                  >
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {member.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 flex-1 truncate text-left">{member.full_name}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      member.is_online ? "bg-green-500" : "bg-muted-foreground/30"
                    )} />
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        !selectedChannel && "hidden md:flex"
      )}>
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b py-3 px-3 sm:px-6 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden h-9 w-9 flex-shrink-0"
                    onClick={() => setSelectedChannel(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  {getChannelIcon(selectedChannel)}
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">
                      {getChannelDisplayName(selectedChannel)}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {selectedChannel.is_direct_message ? 'Direct message' : `${selectedChannel.member_count || 0} members`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-2 sm:gap-3">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                      <AvatarImage src={message.sender_profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.sender_profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-xs sm:text-sm">
                          {message.sender_profile?.full_name || message.sender_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm break-words">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-3 sm:p-4 flex-shrink-0">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="resize-none min-h-[44px] text-sm"
                  rows={2}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="self-end h-10 w-10 sm:h-10 sm:w-auto sm:px-4"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Send</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium">Welcome to Team Communication</p>
              <p className="text-sm mt-2">
                {channels.length > 0 
                  ? 'Select a channel or start a direct message' 
                  : 'Click on a team member to start a conversation'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Show welcome when no channel selected */}
      {!selectedChannel && (
        <div className="flex-1 flex flex-col md:hidden">
          <div className="flex-1 flex items-center justify-center p-4 border-t">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">No chat selected</p>
              <p className="text-sm mt-2">
                Select a channel or team member above
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
