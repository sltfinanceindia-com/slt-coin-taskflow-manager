import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
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
  Hash,
  Paperclip,
  Smile,
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Star,
  Mic,
  MicOff,
  Share,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Enhanced interfaces with Teams-like features
interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  sender_role?: string;
  channel_id?: string;
  receiver_id?: string;
  created_at: string;
  updated_at?: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
  attachments?: FileAttachment[];
  reply_to?: string;
  parent_message?: Message;
  reactions?: MessageReaction[];
  mentions?: string[];
  is_edited?: boolean;
  is_deleted?: boolean;
  thread_count?: number;
  is_important?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  is_direct_message?: boolean;
  participant_ids?: string[];
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  created_at: string;
  is_muted?: boolean;
  is_pinned?: boolean;
  is_archived?: boolean;
  channel_members?: {
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
    profiles?: TeamMember;
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
  status?: 'available' | 'busy' | 'away' | 'offline';
  status_message?: string;
  timezone?: string;
}

interface TypingIndicator {
  user_id: string;
  user_name: string;
  channel_id: string;
  timestamp: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const realtimeChannel = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial data
  useEffect(() => {
    if (profile) {
      initializeRealtime();
      loadChannels();
      loadTeamMembers();
      setUserOnlineStatus(true);
    }

    return () => {
      cleanup();
    };
  }, [profile]);

  // Handle channel selection
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      joinChannel(selectedChannel.id);
      markChannelAsRead(selectedChannel.id);
    }
  }, [selectedChannel]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time setup - Critical for Teams-like functionality
  const initializeRealtime = useCallback(() => {
    if (!profile) return;

    // Create main communication channel
    realtimeChannel.current = supabase.channel('communication_hub', {
      config: { private: true }
    });

    // Subscribe to new messages
    realtimeChannel.current
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const newMessage = payload.payload as Message;
        if (newMessage.channel_id === selectedChannel?.id) {
          setMessages(prev => {
            const exists = prev.find(m => m.id === newMessage.id);
            return exists ? prev : [...prev, newMessage];
          });
          scrollToBottom();
        }
        updateChannelLastMessage(newMessage);
      })
      .on('broadcast', { event: 'message_updated' }, (payload) => {
        const updatedMessage = payload.payload as Message;
        setMessages(prev => prev.map(m => 
          m.id === updatedMessage.id ? updatedMessage : m
        ));
      })
      .on('broadcast', { event: 'message_deleted' }, (payload) => {
        const { messageId } = payload.payload;
        setMessages(prev => prev.filter(m => m.id !== messageId));
      })
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        const typingData = payload.payload as TypingIndicator;
        if (typingData.user_id !== profile.id && typingData.channel_id === selectedChannel?.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(t => t.user_id !== typingData.user_id);
            return [...filtered, typingData];
          });
        }
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        const { user_id } = payload.payload;
        setTypingUsers(prev => prev.filter(t => t.user_id !== user_id));
      })
      .on('broadcast', { event: 'user_status_change' }, (payload) => {
        const { user_id, is_online } = payload.payload;
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (is_online) {
            newSet.add(user_id);
          } else {
            newSet.delete(user_id);
          }
          return newSet;
        });
        
        setTeamMembers(prev => prev.map(member =>
          member.id === user_id ? { ...member, is_online } : member
        ));
      })
      .subscribe();

  }, [profile, selectedChannel]);

  const cleanup = useCallback(() => {
    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (profile) {
      setUserOnlineStatus(false);
    }
  }, [profile]);

  const setUserOnlineStatus = async (isOnline: boolean) => {
    if (!profile) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', profile.id);

      // Broadcast status change
      if (realtimeChannel.current) {
        realtimeChannel.current.send({
          type: 'broadcast',
          event: 'user_status_change',
          payload: {
            user_id: profile.id,
            is_online: isOnline
          }
        });
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(
            user_id,
            role,
            joined_at,
            profiles:user_id(id, full_name, avatar_url, role, is_online)
          ),
          unread_counts:messages(count)
        `)
        .or(`type.eq.public,channel_members.user_id.eq.${profile?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedChannels = (data || []).map(ch => ({
        ...ch,
        type: ch.type as 'public' | 'private' | 'direct',
        unread_count: ch.unread_counts?.length || 0
      }));

      setChannels(processedChannels);
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
      
      const members = (data || []).map(member => ({
        ...member,
        status: member.is_online ? 'available' : 'offline'
      }));

      setTeamMembers(members);
      setLoading(false);

      // Update online users set
      const onlineUserIds = members
        .filter(member => member.is_online)
        .map(member => member.id);
      setOnlineUsers(new Set(onlineUserIds));

    } catch (error) {
      console.error('Error loading team members:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          parent_message:reply_to(*),
          reactions:message_reactions(*, profiles(*)),
          attachments:message_attachments(*)
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const processedMessages = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name || '',
        sender_avatar: msg.sender_avatar || '',
        sender_role: msg.sender_role || '',
        channel_id: msg.channel_id || '',
        receiver_id: msg.receiver_id || '',
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        message_type: (msg.message_type as Message['message_type']) || 'text',
        attachments: msg.attachments || [],
        reply_to: msg.reply_to,
        parent_message: msg.parent_message,
        reactions: msg.reactions || [],
        mentions: msg.mentions || [],
        is_edited: msg.is_edited || false,
        is_deleted: msg.is_deleted || false,
        thread_count: msg.thread_count || 0,
        is_important: msg.is_important || false
      }));

      setMessages(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    try {
      // Stop typing indicator
      handleStopTyping();

      const messageData = {
        content: newMessage.trim(),
        sender_id: profile.id,
        sender_name: profile.full_name,
        sender_avatar: profile.avatar_url,
        sender_role: profile.role,
        channel_id: selectedChannel.id,
        message_type: 'text' as const,
        reply_to: replyToMessage?.id,
        mentions: extractMentions(newMessage),
        is_important: newMessage.includes('!important')
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          parent_message:reply_to(*),
          reactions:message_reactions(*),
          attachments:message_attachments(*)
        `)
        .single();

      if (error) throw error;

      const newMsg: Message = {
        id: data.id,
        content: data.content,
        sender_id: data.sender_id,
        sender_name: data.sender_name || '',
        sender_avatar: data.sender_avatar || '',
        sender_role: data.sender_role || '',
        channel_id: data.channel_id || '',
        receiver_id: data.receiver_id || '',
        created_at: data.created_at,
        message_type: 'text',
        attachments: data.attachments || [],
        reply_to: data.reply_to,
        parent_message: data.parent_message,
        reactions: data.reactions || [],
        mentions: data.mentions || [],
        is_edited: false,
        is_deleted: false,
        thread_count: 0,
        is_important: data.is_important || false
      };

      // Add to local state
      setMessages(prev => [...prev, newMsg]);
      
      // Broadcast to other users
      if (realtimeChannel.current) {
        realtimeChannel.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMsg
        });
      }

      // Update channel last message
      await updateChannelTimestamp(selectedChannel.id, newMsg);

      setNewMessage('');
      setReplyToMessage(null);
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    if (!selectedChannel || !profile || isTyping) return;

    setIsTyping(true);
    
    // Send typing indicator
    if (realtimeChannel.current) {
      realtimeChannel.current.send({
        type: 'broadcast',
        event: 'typing_start',
        payload: {
          user_id: profile.id,
          user_name: profile.full_name,
          channel_id: selectedChannel.id,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!isTyping || !selectedChannel || !profile) return;

    setIsTyping(false);
    
    if (realtimeChannel.current) {
      realtimeChannel.current.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: {
          user_id: profile.id,
          channel_id: selectedChannel.id
        }
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const updateChannelTimestamp = async (channelId: string, message: Message) => {
    try {
      await supabase
        .from('communication_channels')
        .update({
          last_message: message.content.substring(0, 100),
          last_message_time: message.created_at,
          last_message_sender: message.sender_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', channelId);
    } catch (error) {
      console.error('Error updating channel timestamp:', error);
    }
  };

  const updateChannelLastMessage = (message: Message) => {
    setChannels(prev => prev.map(channel =>
      channel.id === message.channel_id
        ? {
            ...channel,
            last_message: message.content.substring(0, 100),
            last_message_time: message.created_at,
            last_message_sender: message.sender_name,
            unread_count: channel.id !== selectedChannel?.id 
              ? (channel.unread_count || 0) + 1 
              : channel.unread_count
          }
        : channel
    ));
  };

  const markChannelAsRead = async (channelId: string) => {
    try {
      await supabase
        .from('channel_read_status')
        .upsert({
          channel_id: channelId,
          user_id: profile?.id,
          last_read_at: new Date().toISOString()
        });

      // Update local state
      setChannels(prev => prev.map(channel =>
        channel.id === channelId
          ? { ...channel, unread_count: 0 }
          : channel
      ));
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  };

  const joinChannel = async (channelId: string) => {
    // Join channel-specific realtime room for typing indicators, etc.
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced message display with Teams-like features
  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender_id === profile?.id;
    const isReply = message.reply_to && message.parent_message;

    return (
      <article
        key={message.id}
        className={cn(
          "group relative flex gap-3 px-4 py-2 hover:bg-muted/50 transition-colors",
          isOwnMessage && "flex-row-reverse"
        )}
      >
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={message.sender_avatar} />
            <AvatarFallback className="text-xs">
              {message.sender_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "flex-1 min-w-0",
          isOwnMessage && "text-right"
        )}>
          {/* Sender info */}
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {message.sender_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.sender_role}
              </span>
              <time className="text-xs text-muted-foreground">
                {formatMessageTime(message.created_at)}
              </time>
              {message.is_important && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
          )}

          {/* Reply context */}
          {isReply && (
            <div className="mb-2 pl-3 border-l-2 border-muted-foreground/30">
              <p className="text-xs text-muted-foreground">
                Replying to {message.parent_message?.sender_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {message.parent_message?.content}
              </p>
            </div>
          )}

          {/* Message content */}
          <div className={cn(
            "rounded-lg px-3 py-2 max-w-[70%] break-words",
            isOwnMessage
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted"
          )}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.is_edited && (
              <span className="text-xs opacity-70 block mt-1">(edited)</span>
            )}
          </div>

          {/* Message actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mt-1 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2"
              onClick={() => setReplyToMessage(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
            {isOwnMessage && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={() => setEditingMessage(message)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Smile className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction) => (
                <Badge 
                  key={reaction.id}
                  variant="outline" 
                  className="text-xs px-2 py-0.5 cursor-pointer hover:bg-primary/10"
                >
                  {reaction.emoji} 1
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingNames = typingUsers.map(t => t.user_name).join(', ');
    
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>
          {typingNames} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </span>
      </div>
    );
  };

  // Enhanced sidebar with search and filters
  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <h2 className="text-lg font-semibold">Communication</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Channel list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Pinned channels */}
          {channels.some(ch => ch.is_pinned) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Star className="h-3 w-3" />
                Pinned
              </h3>
              <div className="space-y-1">
                {channels.filter(ch => ch.is_pinned && !ch.is_direct_message).map(renderChannelItem)}
              </div>
            </div>
          )}

          {/* Regular channels */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hash className="h-3 w-3" />
                Channels
              </span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </h3>
            <div className="space-y-1">
              {channels.filter(ch => !ch.is_direct_message && !ch.is_pinned).map(renderChannelItem)}
            </div>
          </div>

          {/* Direct messages */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                Direct Messages
              </span>
            </h3>
            <div className="space-y-1">
              {channels.filter(ch => ch.is_direct_message).map(renderChannelItem)}
            </div>
          </div>

          {/* Team members */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Team Members ({onlineUsers.size} online)
            </h3>
            <div className="space-y-1">
              {teamMembers
                .filter(member => member.id !== profile?.id)
                .sort((a, b) => {
                  if (a.is_online !== b.is_online) {
                    return b.is_online ? 1 : -1;
                  }
                  return a.full_name.localeCompare(b.full_name);
                })
                .map(renderTeamMemberItem)}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const renderChannelItem = (channel: Channel) => (
    <Button
      key={channel.id}
      variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
      className="w-full justify-start h-auto p-2"
      onClick={() => setSelectedChannel(channel)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {channel.is_direct_message ? (
            <MessageSquare className="h-4 w-4" />
          ) : (
            <Hash className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">
              {getChannelDisplayName(channel)}
            </span>
            {channel.is_muted && <BellOff className="h-3 w-3 text-muted-foreground" />}
          </div>
          {channel.last_message && (
            <p className="text-xs text-muted-foreground truncate">
              {channel.last_message_sender}: {channel.last_message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {channel.last_message_time && (
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(channel.last_message_time)}
            </span>
          )}
          {channel.unread_count && channel.unread_count > 0 && (
            <Badge variant="destructive" className="text-xs h-5 px-1.5">
              {channel.unread_count > 99 ? '99+' : channel.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </Button>
  );

  const renderTeamMemberItem = (member: TeamMember) => (
    <Button
      key={member.id}
      variant="ghost"
      className="w-full justify-start h-auto p-2"
      onClick={() => startDirectMessage(member.id)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative">
          <Avatar className="h-6 w-6">
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback className="text-xs">
              {member.full_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            member.is_online ? "bg-green-500" : "bg-gray-400"
          )} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium truncate">{member.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {member.status_message || member.status || member.role}
          </p>
        </div>
      </div>
    </Button>
  );

  // Rest of the component methods remain the same...
  const startDirectMessage = async (memberId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('create_direct_message_channel', {
          user1_id: profile.id,
          user2_id: memberId
        });

      if (error) throw error;

      await loadChannels();
      
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
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
    <div className="flex h-[700px] bg-background border rounded-lg overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-r bg-card">
        {renderSidebar()}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="left" className="w-80 p-0">
          {renderSidebar()}
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Enhanced Chat Header */}
            <header className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowSidebar(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="font-semibold text-lg flex items-center gap-2">
                      {getChannelDisplayName(selectedChannel)}
                      {selectedChannel.is_muted && <BellOff className="h-4 w-4 text-muted-foreground" />}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {selectedChannel.is_direct_message 
                        ? 'Direct Message' 
                        : `${selectedChannel.channel_members?.length || 0} members`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Reply context bar */}
            {replyToMessage && (
              <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  <span className="text-sm">
                    Replying to <strong>{replyToMessage.sender_name}</strong>: {replyToMessage.content.substring(0, 50)}...
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setReplyToMessage(null)}
                >
                  ✕
                </Button>
              </div>
            )}

            {/* Messages Area */}
            <main className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="py-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-lg font-semibold mb-2">No messages yet</h2>
                      <p className="text-muted-foreground">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(renderMessage)
                  )}
                  
                  {renderTypingIndicator()}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </main>

            {/* Enhanced Message Input */}
            <footer className="p-4 border-t bg-card">
              <form onSubmit={sendMessage} className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value.trim() && !isTyping) {
                          handleTyping();
                        } else if (!e.target.value.trim() && isTyping) {
                          handleStopTyping();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="min-h-[40px] max-h-32 resize-none"
                      maxLength={2000}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" type="button">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{newMessage.length}/2000</span>
                </div>
              </form>
            </footer>
          </>
        ) : (
          // Welcome screen
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
              <p className="text-muted-foreground max-w-sm">
                Choose a channel or start a direct message to begin your Teams-like communication experience
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
