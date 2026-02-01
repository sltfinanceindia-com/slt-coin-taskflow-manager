import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  User,
  Phone,
  Video,
  Info,
  Pin,
  Star,
  Circle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
  edited_at?: string;
  attachments?: any;
  reactions?: { emoji: string; count: number; users: string[]; }[];
  reply_to?: string;
  is_read?: boolean;
  is_pinned?: boolean;
  is_starred?: boolean;
  thread_replies?: number;
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
  description?: string;
  type: string;
  created_by: string;
  created_at: string;
  member_count: number;
  is_direct_message?: boolean;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  is_pinned?: boolean;
  is_muted?: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  department?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export function TeamCommunication() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'team'>('channels');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch data on mount
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
            fetchMessages(selectedChannel || newMessage.channel_id);
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

  // Auto scroll to bottom
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
        .eq('channel_members.user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch real unread counts and last messages for each channel
      const channelsWithMeta = await Promise.all((data || []).map(async (channel) => {
        // Get unread message count (messages not from current user that aren't read)
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channel.id)
          .eq('is_read', false)
          .neq('sender_id', profile?.id);
        
        // Get the last message for the channel
        const { data: lastMessages } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('channel_id', channel.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        const lastMessage = lastMessages?.[0];
        
        return {
          ...channel,
          unread_count: unreadCount || 0,
          last_message: lastMessage?.content?.substring(0, 50) + (lastMessage?.content?.length > 50 ? '...' : '') || '',
          last_message_time: lastMessage?.created_at || channel.created_at
        };
      }));

      setChannels(channelsWithMeta);
      
      // Auto-select first channel if none selected
      if (channelsWithMeta.length > 0 && !selectedChannel) {
        setSelectedChannel(channelsWithMeta[0].id);
      }
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
        .select('id, full_name, avatar_url, role, user_id, department')
        .neq('id', profile?.id)
        .order('full_name');

      if (error) throw error;
      
      // Fetch real user presence status from user_presence table
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, is_online, activity_status');
      
      const presenceMap = new Map(presenceData?.map(p => [p.user_id, p]) || []);
      
      const membersWithStatus = (data || []).map(member => {
        const presence = presenceMap.get(member.id);
        let status: 'online' | 'away' | 'busy' | 'offline' = 'offline';
        
        if (presence?.is_online) {
          status = (presence.activity_status as 'online' | 'away' | 'busy') || 'online';
        }
        
        return {
          ...member,
          status
        };
      });

      setTeamMembers(membersWithStatus);
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
      setMessages((data || []).map(msg => ({
        ...msg,
        reactions: Array.isArray(msg.reactions) ? msg.reactions as any[] : [],
        attachments: msg.attachments || [],
        is_read: msg.is_read || false,
        is_pinned: msg.is_pinned || false,
        is_starred: msg.is_starred || false,
        thread_replies: msg.thread_replies || 0
      } as Message)));
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
            content: newMessage.trim(),
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
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 168) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const shouldShowAvatar = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return prevMessage.sender_id !== message.sender_id;
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChannel = channels.find(c => c.id === selectedChannel);

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r bg-background">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Team Communication</h2>
              <div className="flex items-center gap-1">
                {isAdmin && channels.length === 0 && (
                  <Button size="sm" variant="ghost" onClick={createDefaultChannels}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{profile?.full_name}</div>
                <div className="flex items-center gap-1.5">
                  <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-muted/20">
            <Button
              variant={activeTab === 'channels' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('channels')}
              className="flex-1 rounded-none h-10"
            >
              <Hash className="h-4 w-4 mr-2" />
              Channels
              {channels.some(c => c.unread_count && c.unread_count > 0) && (
                <Badge variant="destructive" className="ml-2 h-4 min-w-4 text-xs px-1">
                  {channels.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('team')}
              className="flex-1 rounded-none h-10"
            >
              <Users className="h-4 w-4 mr-2" />
              Team
              <Badge variant="secondary" className="ml-2 h-4 min-w-4 text-xs px-1">
                {teamMembers.filter(m => m.status === 'online').length}
              </Badge>
            </Button>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === 'channels' ? 'Search channels...' : 'Find people...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 text-sm"
              />
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {activeTab === 'channels' ? (
                filteredChannels.length === 0 && channels.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {isAdmin 
                        ? 'Click + to create the first channel'
                        : 'No channels available yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredChannels.map((channel) => (
                      <TooltipProvider key={channel.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "relative flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                                selectedChannel === channel.id && "bg-muted",
                                channel.unread_count && channel.unread_count > 0 && "bg-blue-50/50"
                              )}
                              onClick={() => setSelectedChannel(channel.id)}
                            >
                              {channel.is_pinned && (
                                <Pin className="h-3 w-3 text-blue-600 absolute top-2 right-2" />
                              )}
                              
                              <div className="shrink-0 mt-0.5">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium truncate">
                                    {channel.name}
                                  </span>
                                  {channel.unread_count && channel.unread_count > 0 && (
                                    <Badge variant="destructive" className="h-4 min-w-4 text-xs px-1.5">
                                      {channel.unread_count}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs text-muted-foreground truncate">
                                    {channel.description || channel.last_message || 'No messages yet'}
                                  </p>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {formatLastMessageTime(channel.last_message_time)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <div className="max-w-xs">
                              <div className="font-medium">#{channel.name}</div>
                              <div className="text-xs opacity-90 mt-1">
                                {channel.description}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-1">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {member.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                          getStatusColor(member.status)
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{member.full_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="capitalize">{member.role}</span>
                          {member.department && (
                            <>
                              <span>•</span>
                              <span>{member.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannel && currentChannel ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-6 py-3 border-b bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3 min-w-0">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0">
                    <h1 className="text-lg font-semibold truncate">{currentChannel.name}</h1>
                    <p className="text-xs text-muted-foreground">
                      {currentChannel.description || `${messages.length} messages`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-background">
              <div className="px-6 py-4 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Welcome to #{currentChannel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentChannel.description || 'Start the conversation!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => {
                      const isOwn = message.sender_id === profile?.id;
                      const showAvatar = shouldShowAvatar(message, index);
                      
                      return (
                        <div 
                          key={message.id} 
                          className={cn(
                            "group flex gap-3",
                            isOwn ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <div className="shrink-0 w-10">
                            {!isOwn && showAvatar && (
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={message.sender_profile?.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {(message.sender_name || message.sender_profile?.full_name || 'U').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          <div className={cn(
                            "flex flex-col min-w-0",
                            isOwn ? "items-end max-w-[65%]" : "items-start max-w-[65%]"
                          )}>
                            {showAvatar && !isOwn && (
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-sm font-semibold">
                                  {message.sender_name || message.sender_profile?.full_name || 'Unknown'}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {message.sender_role || message.sender_profile?.role || 'user'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(message.created_at)}
                                </span>
                              </div>
                            )}

                            <div className={cn(
                              "inline-block px-4 py-2.5 rounded-2xl max-w-full break-words shadow-sm",
                              isOwn 
                                ? "bg-primary text-primary-foreground rounded-br-md" 
                                : "bg-muted/80 text-foreground rounded-bl-md"
                            )}>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </p>
                            </div>

                            {isOwn && (
                              <div className="text-xs text-muted-foreground mt-1 px-1">
                                {formatMessageTime(message.created_at)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t bg-background/95 backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      placeholder={`Message #${currentChannel.name}...`}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Auto-resize
                        if (textareaRef.current) {
                          textareaRef.current.style.height = 'auto';
                          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full min-h-[44px] max-h-[120px] px-4 py-2.5 pr-20 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    className="h-11 w-11 rounded-full p-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Team Communication</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select a channel from the sidebar to start collaborating with your team.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('channels')}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Browse Channels
                </Button>
                <Button 
                  onClick={() => setActiveTab('team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Team
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
