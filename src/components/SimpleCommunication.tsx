import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  Settings,
  Circle,
  User,
  Globe,
  Phone,
  Video
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
  sender_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  type: string;
  is_direct_message?: boolean;
  participant_ids?: string[];
  created_at: string;
  channel_members?: {
    user_id: string;
    profiles?: {
      id: string;
      full_name: string;
      avatar_url?: string;
      role: string;
    };
  }[];
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
}

export function SimpleCommunication() {
  const { profile } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      fetchChannels();
      fetchTeamMembers();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
      
      // Set up real-time subscription for messages
      const messageSubscription = supabase
        .channel(`messages_${selectedChannel}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${selectedChannel}`
          },
          () => {
            fetchMessages(selectedChannel);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    }
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(
            user_id,
            profiles(
              id,
              full_name,
              avatar_url,
              role
            )
          )
        `)
        .eq('channel_members.user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched channels:', data);
      setChannels(data || []);
      
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', profile?.id)
        .order('full_name');

      if (error) throw error;
      console.log('Fetched team members:', data);
      setTeamMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      // Use a simpler approach with direct join
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          channel_id,
          sender_name,
          created_at,
          message_type,
          attachments,
          reactions,
          reply_to,
          edited_at,
          is_pinned,
          is_starred,
          thread_replies,
          is_read,
          receiver_id
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      // Fetch sender profiles separately to avoid foreign key issues
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('id', msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender_profile: senderProfile
          };
        })
      );
      
      console.log('Fetched messages with profiles:', messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createDirectMessageChannel = async (targetUserId: string) => {
    if (!profile?.id) return null;

    try {
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: targetUserId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating DM channel:', error);
      return null;
    }
  };

  const startDirectMessage = async (member: Profile) => {
    const channelId = await createDirectMessageChannel(member.id);
    if (channelId) {
      setSelectedChannel(channelId);
      setSelectedMember(member);
      await fetchChannels();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: profile.id,
        channel_id: selectedChannel,
        message_type: 'text',
        sender_name: profile.full_name,
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      // Refetch messages to show the new one
      fetchMessages(selectedChannel);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const filteredMembers = teamMembers.filter(member => 
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message) {
      // For direct messages, find the other participant from channel members
      const otherMember = channel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      return otherMember?.profiles?.full_name || 'Direct Message';
    }
    return channel.name;
  };

  const getChannelParticipants = (channel: Channel) => {
    if (channel.is_direct_message) {
      const otherMember = channel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      return otherMember ? [otherMember.profiles] : [];
    }
    return [];
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading communication...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[600px]">
      {/* Sidebar */}
      <Card className="col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Communications</CardTitle>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {/* My Profile */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile?.full_name}</div>
              <div className="flex items-center gap-1">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex border-b">
            <Button
              variant={activeTab === 'chats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chats')}
              className="flex-1 rounded-none"
            >
              Chats
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('team')}
              className="flex-1 rounded-none"
            >
              Team
            </Button>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-1 px-4">
              {activeTab === 'chats' ? (
                filteredChannels.map(channel => (
                  <div
                    key={channel.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedChannel === channel.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel.id)}
                  >
                    <div className="flex items-center gap-2">
                      {channel.is_direct_message ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{getChannelDisplayName(channel)}</span>
                    </div>
                  </div>
                ))
              ) : (
                filteredMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => startDirectMessage(member)}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{member.full_name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="col-span-9 flex flex-col">
        {selectedChannel ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {(() => {
                      const channel = channels.find(c => c.id === selectedChannel);
                      return channel ? getChannelDisplayName(channel) : 'Chat';
                    })()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {messages.length} messages
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sender_profile?.full_name || message.sender_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />

              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-[120px] resize-none"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a chat or team member</h3>
              <p className="text-muted-foreground">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}