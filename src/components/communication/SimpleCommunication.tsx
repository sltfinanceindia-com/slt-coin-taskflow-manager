import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Send, 
  Phone, 
  Video, 
  Users, 
  Plus, 
  Search, 
  Settings,
  Menu,
  MessageSquare,
  Hash
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  channel_id?: string;
  receiver_id?: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file' | 'voice';
  attachments?: any[];
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  is_direct_message?: boolean;
  participant_ids?: string[];
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
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

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  department?: string;
  is_online?: boolean;
  last_seen?: string;
  status?: string;
}

export default function SimpleCommunication() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (profile) {
      loadChannels();
      loadTeamMembers();
    }
  }, [profile]);

  // Load messages when channel is selected
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members(
            user_id,
            profiles(id, full_name, avatar_url, role)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels((data || []).map(ch => ({
        ...ch,
        type: ch.type as 'public' | 'private' | 'direct'
      })));
    } catch (error) {
      console.error('Error loading channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setTeamMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading team members:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name || '',
        sender_role: msg.sender_role || '',
        channel_id: msg.channel_id || '',
        receiver_id: msg.receiver_id || '',
        created_at: msg.created_at,
        message_type: (msg.message_type as 'text' | 'image' | 'file' | 'voice') || 'text',
        attachments: Array.isArray(msg.attachments) ? msg.attachments : []
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: profile.id,
        sender_name: profile.full_name,
        sender_role: profile.role,
        channel_id: selectedChannel.id,
        message_type: 'text' as const,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: data.id,
        content: data.content,
        sender_id: data.sender_id,
        sender_name: data.sender_name || '',
        sender_role: data.sender_role || '',
        channel_id: data.channel_id || '',
        receiver_id: data.receiver_id || '',
        created_at: data.created_at,
        message_type: 'text',
        attachments: []
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const startDirectMessage = async (memberId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('create_direct_message_channel', {
          user1_id: profile.id,
          user2_id: memberId
        });

      if (error) throw error;

      // Reload channels to include the new DM
      await loadChannels();
      
      // Find and select the new/existing DM channel
      const dmChannel = channels.find(ch => 
        ch.is_direct_message && 
        ch.participant_ids?.includes(memberId) &&
        ch.participant_ids?.includes(profile.id)
      );
      
      if (dmChannel) {
        setSelectedChannel(dmChannel);
      }
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start direct message",
        variant: "destructive",
      });
    }
  };

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message && channel.channel_members) {
      const otherMember = channel.channel_members.find(
        member => member.user_id !== profile?.id
      );
      return otherMember?.profiles?.full_name || 'Direct Message';
    }
    return channel.name;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-r bg-card">
        <div className="flex flex-col w-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Communication</h2>
          </div>

          {/* Channels Section */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="space-y-4">
                  {/* Channels */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Channels</h3>
                    <div className="space-y-1">
                      {channels.filter(ch => !ch.is_direct_message).map((channel) => (
                        <Button
                          key={channel.id}
                          variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          {channel.name}
                          {channel.unread_count && channel.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {channel.unread_count}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Messages */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Direct Messages</h3>
                    <div className="space-y-1">
                      {channels.filter(ch => ch.is_direct_message).map((channel) => (
                        <Button
                          key={channel.id}
                          variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {getChannelDisplayName(channel)}
                          {channel.unread_count && channel.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {channel.unread_count}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Team Members</h3>
                    <div className="space-y-1">
                      {teamMembers.filter(member => member.id !== profile?.id).map((member) => (
                        <Button
                          key={member.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => startDirectMessage(member.id)}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>
                              {member.full_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-left">{member.full_name}</span>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            member.is_online ? "bg-green-500" : "bg-gray-400"
                          )} />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Communication</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Same content as desktop sidebar */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Channels</h3>
                      <div className="space-y-1">
                        {channels.filter(ch => !ch.is_direct_message).map((channel) => (
                          <Button
                            key={channel.id}
                            variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedChannel(channel);
                              setShowSidebar(false);
                            }}
                          >
                            <Hash className="h-4 w-4 mr-2" />
                            {channel.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Team Members</h3>
                      <div className="space-y-1">
                        {teamMembers.filter(member => member.id !== profile?.id).map((member) => (
                          <Button
                            key={member.id}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              startDirectMessage(member.id);
                              setShowSidebar(false);
                            }}
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>
                                {member.full_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {member.full_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowSidebar(true)}
                  aria-label="Open sidebar"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="font-semibold text-lg">{getChannelDisplayName(selectedChannel)}</h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.is_direct_message ? 'Direct Message' : 'Team Channel'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toast({ title: "Voice Call", description: "Voice call feature coming soon!" })}
                  aria-label="Start voice call"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toast({ title: "Video Call", description: "Video call feature coming soon!" })}
                  aria-label="Start video call"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toast({ title: "Settings", description: "Channel settings coming soon!" })}
                  aria-label="Channel settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Messages */}
            <main className="flex-1">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4" role="log" aria-label="Chat messages">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-lg font-semibold mb-2">No messages yet</h2>
                      <p className="text-muted-foreground">Start the conversation by sending a message!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <article
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.sender_id === profile?.id ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.sender_id !== profile?.id && (
                          <Avatar className="h-8 w-8" aria-hidden="true">
                            <AvatarFallback>
                              {message.sender_name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-3 py-2 transition-colors",
                            message.sender_id === profile?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.sender_id !== profile?.id && (
                            <div className="text-xs text-muted-foreground mb-1 font-medium">
                              {message.sender_name}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <time className="text-xs mt-1 opacity-70 block" dateTime={message.created_at}>
                            {formatMessageTime(message.created_at)}
                          </time>
                        </div>
                      </article>
                    ))
                  )}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>
              </ScrollArea>
            </main>

            {/* Message Input */}
            <footer className="p-4 border-t bg-card">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                  aria-label="Message input"
                  maxLength={1000}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || newMessage.length > 1000}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden mb-4"
                onClick={() => setShowSidebar(true)}
              >
                <Menu className="h-4 w-4 mr-2" />
                Open Channels
              </Button>
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Channel</h3>
              <p className="text-muted-foreground">
                Choose a channel or start a direct message to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}