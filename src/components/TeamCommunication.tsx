import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  Plus,
  Settings,
  Bell,
  Paperclip,
  Smile,
  MoreHorizontal,
  Hash,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  channel_id?: string;
  sender_name?: string;
  sender_role?: string;
  message_type: string;
  created_at: string;
  sender_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
  attachments?: any;
  is_read: boolean;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_by: string;
  created_at: string;
  member_count: number;
  is_direct_message?: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
}

export function TeamCommunication() {
  const { profile } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch channels and team members
  useEffect(() => {
    if (profile?.id) {
      fetchChannels();
      fetchTeamMembers();
    }
  }, [profile?.id]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
    }
  }, [selectedChannel]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!profile?.id) return;

    const messagesChannel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.channel_id === selectedChannel || newMessage.receiver_id === profile.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    const channelsChannel = supabase
      .channel('channels_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_channels'
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(channelsChannel);
    };
  }, [profile?.id, selectedChannel]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(user_id)
        `)
        .eq('channel_members.user_id', profile?.id);

      if (error) throw error;

      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load channels',
        variant: 'destructive',
      });
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, user_id')
        .neq('id', profile?.id);

      if (error) throw error;

      setTeamMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const createDefaultChannels = async () => {
    if (!profile?.id) return;

    try {
      // Create general channel
      const { data: generalChannel, error: channelError } = await supabase
        .from('communication_channels')
        .insert([
          {
            name: 'general',
            description: 'General team discussions',
            type: 'public',
            created_by: profile.id,
          }
        ])
        .select()
        .single();

      if (channelError) throw channelError;

      // Add all team members to general channel
      const allMembers = [profile.id, ...teamMembers.map(m => m.id)];
      const memberInserts = allMembers.map(memberId => ({
        channel_id: generalChannel.id,
        user_id: memberId,
        role: 'member'
      }));

      const { error: memberError } = await supabase
        .from('channel_members')
        .insert(memberInserts);

      if (memberError) throw memberError;

      fetchChannels();
      
      toast({
        title: 'Success',
        description: 'General channel created successfully',
      });
    } catch (error) {
      console.error('Error creating default channels:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage,
            sender_id: profile.id,
            channel_id: selectedChannel,
            sender_name: profile.full_name,
            sender_role: profile.role,
            message_type: 'text',
            is_read: false,
          }
        ]);

      if (error) throw error;

      setNewMessage('');
      
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday ' + format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[800px] flex flex-col">
      <div className="flex-1 flex gap-4">
        {/* Channel Sidebar */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Team Communication</CardTitle>
              {profile?.role === 'admin' && channels.length === 0 && (
                <Button size="sm" variant="outline" onClick={createDefaultChannels}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-3">
                {filteredChannels.length === 0 && channels.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {profile?.role === 'admin' 
                        ? 'Click + to create the first channel'
                        : 'No channels available yet'
                      }
                    </p>
                  </div>
                ) : (
                  filteredChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Hash className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{channel.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {channel.member_count || 0}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* Team Members Section */}
            <div className="border-t p-3">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Team Members</h4>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.full_name}</p>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      #{channels.find(c => c.id === selectedChannel)?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {channels.find(c => c.id === selectedChannel)?.description || 'Team communication channel'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {messages.length} messages
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender_id === profile?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender_profile?.avatar_url} />
                          <AvatarFallback>
                            {(message.sender_name || message.sender_profile?.full_name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === profile?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium">
                              {message.sender_name || message.sender_profile?.full_name || 'Unknown'}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                message.sender_id === profile?.id 
                                  ? 'border-primary-foreground/20 text-primary-foreground/70' 
                                  : ''
                              }`}
                            >
                              {message.sender_role || message.sender_profile?.role || 'user'}
                            </Badge>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === profile?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Select a channel</h3>
                <p className="text-muted-foreground">
                  Choose a channel from the sidebar to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}