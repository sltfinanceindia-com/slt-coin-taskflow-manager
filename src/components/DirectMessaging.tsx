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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  Settings,
  Smile,
  Phone,
  Video,
  Globe,
  User,
  Circle,
  Clock,
  Calendar,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  channel_id?: string;
  sender_name?: string;
  message_type: string;
  created_at: string;
  sender_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
  is_read: boolean;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  is_direct_message?: boolean;
  participant_ids?: string[];
  created_at: string;
  member_count: number;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  is_online?: boolean;
  last_seen?: string;
  activity_status?: 'online' | 'away' | 'offline';
  manual_status?: string;
  last_activity_at?: string;
}

export function DirectMessaging() {
  const { profile } = useAuth();
  const { presenceList, myPresence, setUserStatus, getUserPresence, getStatusBadgeColor, getStatusText } = usePresence();
  
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<Profile | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      fetchChannels();
      fetchTeamMembers();
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.id || !selectedChannel) return;

    fetchMessages(selectedChannel);

    // Clean up previous subscription
    const messagesChannel = supabase
      .channel(`messages_changes_${selectedChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Prevent duplicate messages
            const exists = prev.find(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedChannel]); // Remove profile?.id dependency

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update team members with presence data - Fixed to prevent infinite loops
  useEffect(() => {
    if (teamMembers.length > 0 && presenceList.length > 0) {
      const updatedMembers = teamMembers.map(member => {
        const presence = presenceList.find(p => p.user_id === member.id);
        return {
          ...member,
          is_online: presence?.is_online || false,
          activity_status: presence?.activity_status || 'offline',
          manual_status: presence?.manual_status,
          last_seen: presence?.last_seen,
          last_activity_at: presence?.last_activity_at
        };
      });
      
      // Only update if there are actual changes to prevent infinite re-renders
      const hasChanges = updatedMembers.some((member, index) => 
        member.is_online !== teamMembers[index]?.is_online ||
        member.activity_status !== teamMembers[index]?.activity_status
      );
      
      if (hasChanges) {
        // Filter out 'busy' status to match expected type
        const validMembers = updatedMembers.map(member => ({
          ...member,
          activity_status: member.activity_status === 'busy' ? 'online' : member.activity_status
        })) as Profile[];
        setTeamMembers(validMembers);
      }
    }
  }, [presenceList]); // Remove teamMembers and getUserPresence from dependencies

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
      setChannels(data || []);
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
      await fetchChannels(); // Refresh channels
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
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
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

  const handleStatusChange = async (status: string) => {
    await setUserStatus(status);
    toast({
      title: 'Status Updated',
      description: `Your status has been changed to ${status}`,
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

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message && selectedMember) {
      return selectedMember.full_name;
    }
    return channel.name;
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Never';
    return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
  };

  const StatusIndicator = ({ member }: { member: Profile }) => {
    const presence = presenceList.find(p => p.user_id === member.id);
    const statusColor = getStatusBadgeColor(presence);
    const statusText = getStatusText(presence);

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-xs text-muted-foreground">{statusText}</span>
      </div>
    );
  };

  const UserDetailsDialog = ({ member, onClose }: { member: Profile; onClose: () => void }) => (
    <Dialog open={!!member} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.full_name}</h3>
              <Badge variant="outline">{member.role}</Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <StatusIndicator member={member} />
            </div>
            
            {member.last_seen && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last seen:</span>
                <span className="text-sm">{formatLastSeen(member.last_seen)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => startDirectMessage(member)} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div>Loading team communication...</div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('Available')}>
                  <Circle className="h-3 w-3 mr-2 fill-green-500 text-green-500" />
                  Available
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Busy')}>
                  <Circle className="h-3 w-3 mr-2 fill-red-500 text-red-500" />
                  Busy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Away')}>
                  <Circle className="h-3 w-3 mr-2 fill-yellow-500 text-yellow-500" />
                  Away
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Do not disturb')}>
                  <Circle className="h-3 w-3 mr-2 fill-purple-500 text-purple-500" />
                  Do not disturb
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* My Status */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile?.full_name}</div>
              <StatusIndicator member={profile as Profile} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <div className="px-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value="chats" className="mt-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 px-4">
                  {filteredChannels.map(channel => (
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
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <div className="px-4 mb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Filter: {statusFilter === 'all' ? 'All' : statusFilter === 'online' ? 'Online' : 'Offline'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('online')}>Online</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('offline')}>Offline</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <ScrollArea className="h-[350px]">
                <div className="space-y-1 px-4">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setShowUserDetails(member)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusBadgeColor(presenceList.find(p => p.user_id === member.id))}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{member.full_name}</div>
                        <div className="text-xs text-muted-foreground">{getStatusText(presenceList.find(p => p.user_id === member.id))}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startDirectMessage(member);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-9 flex flex-col">
        {selectedChannel ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {selectedMember ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Globe className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      {selectedMember ? selectedMember.full_name : channels.find(c => c.id === selectedChannel)?.name}
                    </CardTitle>
                  </div>
                  {selectedMember && <StatusIndicator member={selectedMember} />}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender_id === profile?.id ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_profile?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[70%] ${
                          message.sender_id === profile?.id ? 'text-right' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sender_profile?.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender_id === profile?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
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
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="top" align="end" className="w-80 p-0">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setNewMessage(prev => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a chat or team member</h3>
              <p className="text-muted-foreground">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {showUserDetails && (
        <UserDetailsDialog
          member={showUserDetails}
          onClose={() => setShowUserDetails(null)}
        />
      )}
    </div>
  );
}