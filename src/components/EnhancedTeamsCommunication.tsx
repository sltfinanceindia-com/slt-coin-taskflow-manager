import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  VideoOff,
  MicOff,
  Mic,
  Star,
  Pin,
  FileText,
  Image as ImageIcon,
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
  X,
  Calendar,
  Monitor,
  UserPlus,
  Zap,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import EmojiPicker from 'emoji-picker-react';
import { usePresence } from '@/hooks/usePresence';

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
  edited_at?: string;
  thread_replies?: number;
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
  is_muted?: boolean;
  is_favorite?: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  is_online?: boolean;
  last_seen?: string;
  status?: 'Available' | 'Busy' | 'Away' | 'Do not disturb' | 'Offline';
  status_message?: string;
  activity_status?: 'online' | 'away' | 'offline';
  manual_status?: string;
  last_activity_at?: string;
}

interface CallState {
  isInCall: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  participants: Profile[];
  callType: 'audio' | 'video';
}

export function EnhancedTeamsCommunication() {
  const { profile } = useAuth();
  const { presenceList, myPresence, setUserStatus, getUserPresence, getStatusBadgeColor, getStatusText } = usePresence();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isMuted: false,
    isVideoOff: false,
    participants: [],
    callType: 'audio'
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showThreads, setShowThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [directMessageChannels, setDirectMessageChannels] = useState<{[key: string]: string}>({});
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (profile) {
      fetchChannels();
      fetchTeamMembers();
      setupPresence();
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.id || !selectedChannel) return;

    fetchMessages(selectedChannel);

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
          if (newMessage.channel_id === selectedChannel) {
            setMessages(prev => [...prev, newMessage]);
            markAsRead(newMessage.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [profile?.id, selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setupPresence = useCallback(async () => {
    if (!profile?.id) return;

    const presenceChannel = supabase.channel('online_users', {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const onlineUsers = Object.keys(newState);
        setTeamMembers(prev => prev.map(member => ({
          ...member,
          is_online: onlineUsers.includes(member.id)
        })));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setTeamMembers(prev => prev.map(member => 
          member.id === key ? { ...member, is_online: true } : member
        ));
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setTeamMembers(prev => prev.map(member => 
          member.id === key ? { ...member, is_online: false } : member
        ));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: profile.id,
            full_name: profile.full_name,
            status: 'Available',
            last_seen: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [profile]);

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

      const channelsWithMessages = (data || []).map(channel => ({
        ...channel,
        last_message: undefined,
        unread_count: 0,
        is_muted: false,
        is_favorite: false
      }));

      setChannels(channelsWithMessages);
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
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

      const messagesWithReactions = (data || []).map(msg => ({
        ...msg,
        reactions: Array.isArray(msg.reactions) ? msg.reactions : []
      }));

      setMessages(messagesWithReactions as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
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
        reply_to: replyingTo?.id || null,
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
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
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);

      let updatedReactions;
      if (existingReaction) {
        if (existingReaction.users.includes(profile!.id)) {
          // Remove user's reaction
          updatedReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, users: r.users.filter(u => u !== profile!.id) }
              : r
          ).filter(r => r.users.length > 0);
        } else {
          // Add user's reaction
          updatedReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, users: [...r.users, profile!.id] }
              : r
          );
        }
      } else {
        // Create new reaction
        updatedReactions = [...reactions, { emoji, users: [profile!.id] }];
      }

      await supabase
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      // Update local state immediately for better UX
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, reactions: updatedReactions } : msg
      ));

    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallState({
      isInCall: true,
      isMuted: false,
      isVideoOff: type === 'audio',
      participants: teamMembers.filter(m => m.is_online).slice(0, 3),
      callType: type
    });
    
    toast({
      title: `${type === 'video' ? 'Video' : 'Audio'} Call Started`,
      description: 'You are now in a call',
    });
  };

  const endCall = () => {
    setCallState({
      isInCall: false,
      isMuted: false,
      isVideoOff: false,
      participants: [],
      callType: 'audio'
    });
    
    toast({
      title: 'Call Ended',
      description: 'You have left the call',
    });
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'online' && member.is_online) ||
      (statusFilter === 'offline' && !member.is_online);
    return matchesSearch && matchesStatus;
  });

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Teams Communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] bg-background rounded-lg border">
      {/* Call Overlay */}
      {callState.isInCall && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">
                {callState.callType === 'video' ? 'Video Call' : 'Audio Call'}
              </h3>
              <p className="text-gray-300">
                {callState.participants.length} participant(s)
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 mb-8">
              {callState.participants.map((participant) => (
                <div key={participant.id} className="text-center">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback>{participant.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{participant.full_name}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                variant={callState.isMuted ? "destructive" : "secondary"}
                onClick={() => setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
              >
                {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              {callState.callType === 'video' && (
                <Button
                  size="lg"
                  variant={callState.isVideoOff ? "destructive" : "secondary"}
                  onClick={() => setCallState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))}
                >
                  {callState.isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              )}
              
              <Button size="lg" variant="destructive" onClick={endCall}>
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/20">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Teams Communication
            </h2>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search channels, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 mt-0">
            <ScrollArea className="h-[580px]">
              <div className="p-2">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-sm font-medium text-muted-foreground">Channels</span>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
        {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-muted/50 mb-1 ${
                      selectedChannel === channel.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        {channel.type === 'general' ? (
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        ) : channel.is_private ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{channel.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {channel.description || 'Team communication'}
                        </p>
                      </div>
                      {channel.unread_count && channel.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="teams" className="flex-1 mt-0">
            <div className="p-2">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-sm font-medium text-muted-foreground">Team Members</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Members
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('online')}>
                      Online Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('offline')}>
                      Offline Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <ScrollArea className="h-[530px]">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-muted/50 mb-1"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                        member.is_online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-sm">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startCall('audio')}>
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startCall('video')}>
                        <Video className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="calls" className="flex-1 mt-0">
            <div className="p-4 text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Recent Calls</h3>
              <p className="text-sm text-muted-foreground mb-4">Your call history will appear here</p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => startCall('video')}>
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </Button>
                <Button variant="outline" className="w-full" onClick={() => startCall('audio')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Audio Call
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">
                      {channels.find(c => c.id === selectedChannel)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {channels.find(c => c.id === selectedChannel)?.description || 'Team communication channel'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startCall('video')}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startCall('audio')}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === profile?.id}
                    onReact={(emoji) => handleReaction(message.id, emoji)}
                    onReply={() => setReplyingTo(message)}
                    onEdit={() => setEditingMessage(message.id)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-muted/20 border-t border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Replying to {replyingTo.sender_profile?.full_name}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {replyingTo.content}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
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
                    className="min-h-[44px] max-h-32 resize-none pr-20"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-50">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setNewMessage(prev => prev + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Welcome to Teams Communication</h3>
              <p className="text-muted-foreground">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
}

function MessageBubble({ message, isOwn, onReact, onReply, onEdit }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  return (
    <div 
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.sender_profile?.avatar_url} />
          <AvatarFallback>{message.sender_profile?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{message.sender_profile?.full_name}</span>
            <span className="text-xs text-muted-foreground">
              {message.sender_profile?.role}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
        
        <div className={`relative ${isOwn ? 'ml-auto' : ''}`}>
          <div className={`p-3 rounded-lg ${
            isOwn 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            {message.reply_to && (
              <div className="mb-2 p-2 bg-black/10 rounded text-sm">
                <p className="text-xs opacity-80">Replying to message</p>
              </div>
            )}
            <p className="break-words">{message.content}</p>
            {message.edited_at && (
              <span className="text-xs opacity-70 ml-2">(edited)</span>
            )}
          </div>
          
          {showActions && (
            <div className={`absolute ${isOwn ? 'left-0' : 'right-0'} -top-2 flex gap-1 bg-background border rounded-lg shadow-md p-1`}>
              <Button size="sm" variant="ghost" onClick={() => onReact('👍')}>
                👍
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onReact('❤️')}>
                ❤️
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onReact('😄')}>
                😄
              </Button>
              <Button size="sm" variant="ghost" onClick={onReply}>
                <Reply className="h-3 w-3" />
              </Button>
              {isOwn && (
                <Button size="sm" variant="ghost" onClick={onEdit}>
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => onReact(reaction.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  reaction.users.includes(message.sender_id || '') 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.users.length}</span>
              </button>
            ))}
          </div>
        )}
        
        {isOwn && (
          <div className="text-xs text-muted-foreground mt-1">
            {formatTime(message.created_at)}
            {message.is_read && <Check className="inline h-3 w-3 ml-1" />}
          </div>
        )}
      </div>
    </div>
  );
}