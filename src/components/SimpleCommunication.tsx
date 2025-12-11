import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Users, Phone, Video, Info } from 'lucide-react';
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

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, role')
          .neq('id', profile?.id);

        if (error) throw error;

        setTeamMembers(data?.map(member => ({
          ...member,
          is_online: Math.random() > 0.5, // Simulate online status
          last_activity: new Date().toISOString(),
        })) || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    if (profile) {
      fetchTeamMembers();
    }
  }, [profile]);

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('communication_channels')
          .select(`
            *,
            channel_members!inner(
              user_id,
              profiles!inner(id, full_name, avatar_url, role)
            )
          `)
          .eq('channel_members.user_id', profile?.id);

        if (error) throw error;

        const formattedChannels = data?.map(channel => ({
          ...channel,
          type: channel.type as "public" | "private" | "direct",
          unread_count: 0,
          last_message: '',
          last_message_time: channel.updated_at,
          last_message_sender: '',
          is_muted: false,
          is_pinned: false,
        })) || [];

        setChannels(formattedChannels);
        if (formattedChannels.length > 0 && !selectedChannel) {
          setSelectedChannel(formattedChannels[0]);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (profile) {
      fetchChannels();
    }
  }, [profile, selectedChannel]);

  // Fetch messages for selected channel
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *
          `)
          .eq('channel_id', selectedChannel.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages = data?.map(msg => ({
          ...msg,
          message_type: msg.message_type as "text" | "system" | "file",
          sender_profile: {
            id: msg.sender_id,
            full_name: msg.sender_name || 'Unknown',
            avatar_url: '',
            role: msg.sender_role || '',
          },
        })) || [];

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedChannel]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: profile.id,
          channel_id: selectedChannel.id,
          message_type: 'text',
          sender_name: profile.full_name,
          sender_role: profile.role,
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });

      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', selectedChannel.id)
        .order('created_at', { ascending: true });

      if (data) {
        const formattedMessages = data.map(msg => ({
          ...msg,
          message_type: msg.message_type as "text" | "system" | "file",
          sender_profile: {
            id: msg.sender_id,
            full_name: msg.sender_name || 'Unknown',
            avatar_url: '',
            role: msg.sender_role || '',
          },
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: member.id,
      });

      if (error) throw error;

      // Create a temporary channel object for the UI
      const dmChannel: Channel = {
        id: data,
        name: `Direct Message with ${member.full_name}`,
        type: 'direct',
        is_direct_message: true,
        participant_ids: [profile.id, member.id],
        created_at: new Date().toISOString(),
        member_count: 2,
      };

      setSelectedChannel(dmChannel);
      toast({
        title: "Direct message started",
        description: `Started conversation with ${member.full_name}`,
      });
    } catch (error) {
      console.error('Error creating direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start direct message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message) {
      return channel.name || 'Direct Message';
    }
    return channel.name;
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message) {
      return <MessageSquare className="h-4 w-4" />;
    }
    return channel.type === 'private' ? (
      <Users className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] sm:h-[600px]">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="h-[500px] sm:h-[600px] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Hidden on mobile when channel selected */}
      <div className={cn(
        "w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col",
        selectedChannel && "hidden md:flex"
      )}>
        {/* Channels */}
        <div className="flex-1 overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              Communication
            </CardTitle>
          </CardHeader>
          
          <div className="px-3 sm:px-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
            {/* Channels List */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Channels</h3>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start min-h-[44px] text-sm"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    {getChannelIcon(channel)}
                    <span className="ml-2 truncate">{getChannelDisplayName(channel)}</span>
                    {channel.unread_count && channel.unread_count > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {channel.unread_count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Team Members */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Team Members</h3>
              <div className="space-y-1">
                {teamMembers.slice(0, 5).map((member) => (
                  <Button
                    key={member.id}
                    variant="ghost"
                    className="w-full justify-start min-h-[44px] text-sm"
                    onClick={() => startDirectMessage(member)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 flex-1 truncate text-left">{member.full_name}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      member.is_online ? "bg-green-500" : "bg-gray-300"
                    )} />
                  </Button>
                ))}
              </div>
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
            <CardHeader className="border-b py-3 px-3 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden h-9 w-9 flex-shrink-0"
                    onClick={() => setSelectedChannel(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </Button>
                  {getChannelIcon(selectedChannel)}
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">
                      {getChannelDisplayName(selectedChannel)}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {selectedChannel.member_count || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
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
            <div className="border-t p-3 sm:p-4">
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
              <p className="text-sm">Select a channel or start a direct message to begin</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}