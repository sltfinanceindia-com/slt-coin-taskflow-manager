import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  Star,
  Pin,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  VideoOff,
  Share,
  Archive,
  Trash2,
  Reply,
  Forward,
  Download,
  Edit,
  Check,
  CheckCheck,
  Clock,
  Globe,
  Lock,
  X
} from 'lucide-react';
import { Label } from '@/components/ui/label';
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
  is_pinned?: boolean;
  is_starred?: boolean;
  reply_to?: string;
  reactions?: { emoji: string; users: string[] }[];
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
  is_private?: boolean;
  last_message?: Message;
  unread_count?: number;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  is_online?: boolean;
  last_seen?: string;
}

export function AdvancedTeamCommunication() {
  const { profile } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪', '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '🦿', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🧠', '🗣️', '👤', '👥'];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch channels and team members
  useEffect(() => {
    if (profile?.id) {
      fetchChannels();
      fetchTeamMembers();
      setupPresence();
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
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [profile?.id, selectedChannel]);

  const setupPresence = () => {
    if (!profile?.id) return;

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const users = new Set<string>();
        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            users.add(presence.user_id);
          });
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newPresences.forEach((presence: any) => newSet.add(presence.user_id));
          return newSet;
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          leftPresences.forEach((presence: any) => newSet.delete(presence.user_id));
          return newSet;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: profile.id,
            online_at: new Date().toISOString(),
          });
        }
      });
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBkOX4O/FdSYE');
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore audio errors
    }
  };

  const fetchChannels = async () => {
    try {
      const { data: channelsData, error } = await supabase
        .from('communication_channels')
        .select(`
          id,
          name,
          description,
          type,
          created_by,
          created_at,
          member_count
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const channelsWithUnread = channelsData?.map(channel => ({
        ...channel,
        unread_count: Math.floor(Math.random() * 3) // Demo unread count
      })) || [];

      setChannels(channelsWithUnread);
      
      // Auto-select first channel if none selected
      if (!selectedChannel && channelsWithUnread.length > 0) {
        setSelectedChannel(channelsWithUnread[0].id);
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
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          channel_id,
          message_type,
          created_at,
          is_read,
          sender_name,
          sender_role,
          attachments
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = messagesData?.map(msg => ({
        ...msg,
        sender_profile: {
          id: msg.sender_id,
          full_name: msg.sender_name || 'Unknown User',
          avatar_url: '',
          role: msg.sender_role || 'intern'
        }
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error', 
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage,
            sender_id: profile.id,
            channel_id: selectedChannel,
            sender_name: profile.full_name,
            sender_role: profile.role,
            message_type: 'text'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      setReplyingTo(null);

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully',
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

  const handleReaction = async (messageId: string, emoji: string) => {
    // Implementation for adding reactions to messages
    toast({
      title: 'Reaction Added',
      description: `Added ${emoji} reaction`,
    });
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

  const createNewChannel = async (name: string, description: string, isPrivate: boolean) => {
    try {
      const { data: channel, error } = await supabase
        .from('communication_channels')
        .insert([
          {
            name,
            description,
            type: isPrivate ? 'private' : 'public',
            created_by: profile?.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add creator to channel
      await supabase
        .from('channel_members')
        .insert([
          {
            channel_id: channel.id,
            user_id: profile?.id,
            role: 'admin'
          }
        ]);

      fetchChannels();
      toast({
        title: 'Channel Created',
        description: `#${name} has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to create channel',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[800px] flex flex-col border rounded-lg">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col bg-muted/30">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Teams Communication</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                  </DialogHeader>
                  <CreateChannelForm onSubmit={createNewChannel} />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
            </TabsList>

            <TabsContent value="chats" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {channels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {channel.type === 'private' ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                          </div>
                          {channel.unread_count && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {channel.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{channel.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {channel.last_message && formatMessageTime(channel.last_message.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.last_message?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="teams" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {onlineUsers.has(member.user_id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.full_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {member.role}
                          </Badge>
                          {onlineUsers.has(member.user_id) ? (
                            <span className="text-xs text-green-600">Online</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Offline</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calls" className="flex-1 mt-0">
              <div className="p-4 text-center text-muted-foreground">
                <Phone className="h-8 w-8 mx-auto mb-2" />
                <p>No recent calls</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        #{channels.find(c => c.id === selectedChannel)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {channels.find(c => c.id === selectedChannel)?.member_count} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin messages
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className="h-4 w-4 mr-2" />
                          Notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Channel settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

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
                    messages.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender_id === profile?.id}
                        showAvatar={index === 0 || messages[index - 1].sender_id !== message.sender_id}
                        onReact={(emoji) => handleReaction(message.id, emoji)}
                        onReply={() => setReplyingTo(message)}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Reply Banner */}
              {replyingTo && (
                <div className="px-4 py-2 bg-muted/50 border-l-4 border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Replying to {replyingTo.sender_name}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm truncate mt-1">{replyingTo.content}</p>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-4 bg-background border rounded-lg p-2 shadow-lg z-50">
                          <div className="grid grid-cols-8 gap-1 max-w-xs">
                            {emojis.map((emoji) => (
                              <Button
                                key={emoji}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setNewMessage(prev => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={messageInputRef}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 min-h-[40px] max-h-32 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        rows={1}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Teams</h3>
                <p className="text-muted-foreground">Select a channel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
}

function MessageBubble({ message, isOwn, showAvatar, onReact, onReply }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender_profile?.avatar_url} />
          <AvatarFallback>
            {(message.sender_name || message.sender_profile?.full_name || 'U').charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && <div className="w-8" />}
      
      <div className={`flex-1 max-w-lg ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm font-medium">
              {message.sender_name || message.sender_profile?.full_name}
            </span>
            <Badge variant="outline" className="text-xs">
              {message.sender_role || message.sender_profile?.role}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
          </div>
        )}
        
        <div className="relative">
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Message status */}
            {isOwn && (
              <div className="flex justify-end mt-1">
                {message.is_read ? (
                  <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                ) : (
                  <Check className="h-3 w-3 text-primary-foreground/70" />
                )}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1`}>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onReact('👍')}>
                👍
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onReact('❤️')}>
                ❤️
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onReact('😂')}>
                😂
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onReply}>
                <Reply className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onReply}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Channel Form Component
interface CreateChannelFormProps {
  onSubmit: (name: string, description: string, isPrivate: boolean) => void;
}

function CreateChannelForm({ onSubmit }: CreateChannelFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, description, isPrivate);
      setName('');
      setDescription('');
      setIsPrivate(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="channelName">Channel Name</Label>
        <Input
          id="channelName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. general, project-updates"
          required
        />
      </div>
      <div>
        <Label htmlFor="channelDescription">Description (Optional)</Label>
        <Input
          id="channelDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this channel about?"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="isPrivate">Make private</Label>
      </div>
      <Button type="submit" className="w-full">
        Create Channel
      </Button>
    </form>
  );
}