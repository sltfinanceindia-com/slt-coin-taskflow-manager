import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Send, 
  Users, 
  Search,
  Plus,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Bell,
  Paperclip,
  Smile,
  MoreHorizontal,
  Star,
  Archive,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isYesterday } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  channel_id?: string;
  message_type: 'text' | 'file' | 'voice' | 'video_call' | 'voice_call';
  created_at: string;
  sender_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  attachments?: string[];
  is_read: boolean;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  created_by: string;
  created_at: string;
  member_count: number;
  last_message?: Message;
}

interface CallSession {
  id: string;
  type: 'voice' | 'video';
  participants: string[];
  status: 'initiated' | 'ongoing' | 'ended';
  started_at: string;
  ended_at?: string;
}

export function TeamCommunication() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['communication-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          last_message:messages(
            content,
            created_at,
            sender_profile:profiles(full_name)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Channel[];
    },
  });

  // Fetch messages for selected channel
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedChannel],
    queryFn: async () => {
      if (!selectedChannel) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', selectedChannel)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedChannel,
  });

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .order('full_name');

      if (error) throw error;
      return data;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, channelId, messageType = 'text' }: {
      content: string;
      channelId: string;
      messageType?: Message['message_type'];
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          content,
          channel_id: channelId,
          sender_id: profile?.id,
          message_type: messageType,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChannel] });
      setNewMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async ({ name, description, type }: {
      name: string;
      description?: string;
      type: 'public' | 'private';
    }) => {
      const { data, error } = await supabase
        .from('communication_channels')
        .insert([{
          name,
          description,
          type,
          created_by: profile?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      setShowNewChannelDialog(false);
      setNewChannelName('');
      setNewChannelDescription('');
      toast({
        title: 'Channel created',
        description: 'New communication channel has been created successfully.',
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate real-time updates (in production, use Supabase realtime)
  useEffect(() => {
    if (selectedChannel) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedChannel] });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChannel]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      channelId: selectedChannel,
    });
  };

  const initiateCall = (type: 'voice' | 'video', participants: string[]) => {
    const callSession: CallSession = {
      id: Date.now().toString(),
      type,
      participants: [profile?.id || '', ...participants],
      status: 'initiated',
      started_at: new Date().toISOString(),
    };
    
    setActiveCall(callSession);
    
    // Simulate call notification
    toast({
      title: `${type === 'voice' ? 'Voice' : 'Video'} Call Started`,
      description: 'Call has been initiated. Waiting for participants to join.',
    });
    
    // Auto-update call status after 2 seconds
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
    }, 2000);
  };

  const endCall = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        status: 'ended',
        ended_at: new Date().toISOString(),
      });
      
      toast({
        title: 'Call Ended',
        description: 'The call has been ended successfully.',
      });
      
      setTimeout(() => setActiveCall(null), 1000);
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

  return (
    <div className="h-full max-h-[800px] flex flex-col">
      {/* Active Call Overlay */}
      {activeCall && (
        <Card className="mb-4 border-2 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeCall.type === 'video' ? (
                  <Video className="h-6 w-6 text-primary animate-pulse" />
                ) : (
                  <Phone className="h-6 w-6 text-primary animate-pulse" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {activeCall.type === 'video' ? 'Video Call' : 'Voice Call'} - {activeCall.status}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeCall.participants.length} participant(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isMuted ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="sm" onClick={endCall}>
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">💬 Chat</TabsTrigger>
          <TabsTrigger value="calls">📞 Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex gap-4 mt-4">
          {/* Channel Sidebar */}
          <Card className="w-80 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Channels</CardTitle>
                <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Channel Name</label>
                        <Input
                          placeholder="e.g., general, dev-team, announcements"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="What's this channel about?"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => createChannelMutation.mutate({
                          name: newChannelName,
                          description: newChannelDescription,
                          type: 'public'
                        })}
                        disabled={!newChannelName.trim() || createChannelMutation.isPending}
                        className="w-full"
                      >
                        Create Channel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  {filteredChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{channel.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {channel.member_count || 0}
                            </Badge>
                          </div>
                          {channel.last_message && (
                            <p className="text-xs text-muted-foreground truncate">
                              {channel.last_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
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
                        {channels.find(c => c.id === selectedChannel)?.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {channels.find(c => c.id === selectedChannel)?.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initiateCall('voice', [])}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initiateCall('video', [])}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender_id === profile?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender_profile?.avatar_url} />
                          <AvatarFallback>
                            {message.sender_profile?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === profile?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
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
                    ))}
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
        </TabsContent>

        <TabsContent value="calls" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Call History & Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Call Actions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Quick Call</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => initiateCall('voice', [])}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Voice Call
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => initiateCall('video', [])}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>

                {/* Recent Calls */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Calls</h3>
                  <div className="space-y-2">
                    {/* Simulated call history */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Team Standup</p>
                          <p className="text-sm text-muted-foreground">15 minutes ago</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Ended</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Client Discussion</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Ended</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}