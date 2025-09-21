import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Smile,
  Paperclip,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Circle,
  Clock,
  Star,
  Pin,
  UserPlus,
  Globe,
  Lock,
  Info,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { audioNotifications } from '@/utils/audioNotifications';

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
  reactions?: { emoji: string; count: number; users: string[]; }[];
  is_read?: boolean;
  is_pinned?: boolean;
  reply_to?: string;
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
  member_count?: number;
  is_muted?: boolean;
  is_favorite?: boolean;
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
  user_id: string;
}

interface CallState {
  isInCall: boolean;
  callType: 'voice' | 'video' | null;
  isMuted: boolean;
  isVideoOn: boolean;
  isRinging: boolean;
  callWith?: TeamMember;
  callStartTime?: Date;
}

// Mock call history interface
interface CallHistoryItem {
  id: string;
  with: string;
  type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'declined';
  duration?: number;
  timestamp: string;
  avatar?: string;
}

// User status management component
const StatusSelector = ({ currentStatus, onStatusChange }: { currentStatus: string; onStatusChange: (status: string) => void }) => {
  const statuses = [
    { value: 'Available', label: 'Available', color: 'bg-green-500', icon: Circle },
    { value: 'Busy', label: 'Busy', color: 'bg-red-500', icon: Circle },
    { value: 'Away', label: 'Away', color: 'bg-yellow-500', icon: Clock },
    { value: 'Do not disturb', label: 'Do not disturb', color: 'bg-purple-500', icon: Circle },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs">{currentStatus}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className="flex items-center gap-2"
          >
            <div className={cn("w-2 h-2 rounded-full", status.color)} />
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Channel creation dialog
const CreateChannelDialog = ({ onCreateChannel }: { onCreateChannel: (name: string, description: string, type: 'public' | 'private') => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateChannel(name.trim(), description.trim(), type);
      setName('');
      setDescription('');
      setType('public');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
              required
            />
          </div>
          <div>
            <Label htmlFor="channel-description">Description (optional)</Label>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter channel description"
              rows={3}
            />
          </div>
          <div>
            <Label>Channel Type</Label>
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant={type === 'public' ? 'default' : 'outline'}
                onClick={() => setType('public')}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Public
              </Button>
              <Button
                type="button"
                variant={type === 'private' ? 'default' : 'outline'}
                onClick={() => setType('private')}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Private
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Channel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// User details dialog
const UserDetailsDialog = ({ 
  member, 
  isOpen, 
  onClose, 
  onStartCall, 
  onStartDM 
}: { 
  member: TeamMember | null; 
  isOpen: boolean; 
  onClose: () => void;
  onStartCall: (member: TeamMember, type: 'voice' | 'video') => void;
  onStartDM: (member: TeamMember) => void;
}) => {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback>{member.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.full_name}</h3>
              <Badge variant="outline">{member.role}</Badge>
              {member.department && (
                <p className="text-sm text-muted-foreground mt-1">{member.department}</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{member.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Online</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onStartDM(member)} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onStartCall(member, 'voice')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onStartCall(member, 'video')}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Call interface component
const CallInterface = ({ 
  callState, 
  onEndCall, 
  onToggleMute, 
  onToggleVideo 
}: { 
  callState: CallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}) => {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (callState.isInCall && callState.callStartTime) {
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callState.callStartTime!.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState.isInCall, callState.callStartTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!callState.isInCall && !callState.isRinging) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-96 p-6 text-center">
        <div className="space-y-4">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src={callState.callWith?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {callState.callWith?.full_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-xl font-semibold">{callState.callWith?.full_name}</h3>
            <p className="text-muted-foreground">
              {callState.isRinging ? 'Calling...' : `${formatDuration(callDuration)}`}
            </p>
          </div>

          {callState.callType === 'video' && callState.isVideoOn && (
            <div className="w-full h-40 bg-gray-900 rounded-lg flex items-center justify-center">
              <Monitor className="h-12 w-12 text-white" />
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={onToggleMute}
              className="rounded-full h-12 w-12"
            >
              {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            {callState.callType === 'video' && (
              <Button
                variant={!callState.isVideoOn ? "destructive" : "secondary"}
                size="lg"
                onClick={onToggleVideo}
                className="rounded-full h-12 w-12"
              >
                {callState.isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndCall}
              className="rounded-full h-12 w-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function EnhancedSimpleCommunication() {
  const { profile } = useAuth();
  const { 
    presenceList, 
    myPresence, 
    setUserStatus, 
    getUserPresence, 
    getStatusBadgeColor, 
    getStatusText 
  } = usePresence();

  // Main state
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'dms' | 'team' | 'calls'>('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Call state
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    callType: null,
    isMuted: false,
    isVideoOn: true,
    isRinging: false,
  });

  // Mock call history
  const [callHistory] = useState<CallHistoryItem[]>([
    {
      id: '1',
      with: 'John Doe',
      type: 'video',
      status: 'completed',
      duration: 1243,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      avatar: '',
    },
    {
      id: '2',
      with: 'Jane Smith',
      type: 'voice',
      status: 'missed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      avatar: '',
    },
  ]);

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

  // Real-time subscriptions
  useEffect(() => {
    if (!profile?.id) return;

    const messagesChannel = supabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.channel_id === selectedChannel?.id) {
            setMessages(prev => [...prev, newMessage]);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [profile?.id, selectedChannel?.id]);

  const playNotificationSound = useCallback(async () => {
    try {
      await audioNotifications.playMessageReceived();
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

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
      
      const channelsWithMeta = (data || []).map(ch => ({
        ...ch,
        type: ch.type as 'public' | 'private' | 'direct',
        unread_count: Math.floor(Math.random() * 3), // Mock unread count
      }));
      
      setChannels(channelsWithMeta);
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
        .neq('id', profile?.id)
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
        attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
        reactions: Array.isArray(msg.reactions) ? msg.reactions as any[] : [],
        is_read: msg.is_read || false,
        is_pinned: msg.is_pinned || false,
        reply_to: msg.reply_to || undefined
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
        message_type: 'text' as const,
        attachments: [],
        reactions: [],
        is_read: false,
        is_pinned: false,
        reply_to: undefined
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

  const startDirectMessage = async (member: TeamMember) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('create_direct_message_channel', {
          user1_id: profile.id,
          user2_id: member.id
        });

      if (error) throw error;

      await loadChannels();
      
      const dmChannel = channels.find(ch => 
        ch.is_direct_message && 
        ch.participant_ids?.includes(member.id) &&
        ch.participant_ids?.includes(profile.id)
      );
      
      if (dmChannel) {
        setSelectedChannel(dmChannel);
        setActiveTab('dms');
      }
      
      setShowUserDetails(false);
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start direct message",
        variant: "destructive",
      });
    }
  };

  const startCall = async (member: TeamMember, type: 'voice' | 'video') => {
    setCallState({
      isInCall: false,
      callType: type,
      isMuted: false,
      isVideoOn: type === 'video',
      isRinging: true,
      callWith: member,
    });

    // Play ringing sound
    await audioNotifications.playIncomingCall();

    // Simulate call connection after 3 seconds
    setTimeout(async () => {
      setCallState(prev => ({
        ...prev,
        isInCall: true,
        isRinging: false,
        callStartTime: new Date(),
      }));
      await audioNotifications.playCallConnected();
    }, 3000);

    setShowUserDetails(false);
  };

  const endCall = async () => {
    await audioNotifications.playCallEnded();
    setCallState({
      isInCall: false,
      callType: null,
      isMuted: false,
      isVideoOn: true,
      isRinging: false,
    });
  };

  const toggleMute = async () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    await audioNotifications.playMuteToggle(!callState.isMuted);
  };

  const toggleVideo = () => {
    setCallState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
  };

  const createChannel = async (name: string, description: string, type: 'public' | 'private') => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .insert([{
          name,
          description,
          type,
          created_by: profile.id,
          member_count: 1,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator to channel
      await supabase
        .from('channel_members')
        .insert([{
          channel_id: data.id,
          user_id: profile.id,
        }]);

      await loadChannels();
      toast({
        title: "Success",
        description: `Channel "${name}" created successfully`,
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel",
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
    return format(date, 'HH:mm');
  };

  const handleStatusChange = async (status: string) => {
    await setUserStatus(status);
    toast({
      title: "Status Updated",
      description: `Your status has been changed to ${status}`,
    });
  };

  const filteredChannels = channels.filter(ch => 
    !ch.is_direct_message && ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDMs = channels.filter(ch => 
    ch.is_direct_message && getChannelDisplayName(ch).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <>
      <div className="flex h-[700px] bg-background border rounded-lg overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-80 border-r bg-card">
          <div className="flex flex-col w-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Communication</h2>
                <div className="flex items-center gap-1">
                  <CreateChannelDialog onCreateChannel={createChannel} />
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{profile?.full_name}</div>
                  <StatusSelector
                    currentStatus={getStatusText(myPresence) || 'Available'}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
                <TabsTrigger value="channels" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="dms" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  DMs
                </TabsTrigger>
                <TabsTrigger value="team" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="calls" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Calls
                </TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-8"
                  />
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <TabsContent value="channels" className="mt-0 p-2">
                    <div className="space-y-1">
                      {filteredChannels.map((channel) => (
                        <Button
                          key={channel.id}
                          variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto p-3"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {channel.type === 'private' ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                              </div>
                              {channel.unread_count && channel.unread_count > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                                  {channel.unread_count}
                                </Badge>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-sm truncate">{channel.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {channel.description || `${channel.member_count} members`}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="dms" className="mt-0 p-2">
                    <div className="space-y-1">
                      {filteredDMs.map((channel) => (
                        <Button
                          key={channel.id}
                          variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto p-3"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={channel.channel_members?.find(m => m.user_id !== profile?.id)?.profiles?.avatar_url} />
                              <AvatarFallback>
                                {getChannelDisplayName(channel).substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-sm truncate">{getChannelDisplayName(channel)}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {channel.last_message || 'No messages yet'}
                              </p>
                            </div>
                            {channel.unread_count && channel.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">
                                {channel.unread_count}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="team" className="mt-0 p-2">
                    <div className="space-y-1">
                      {filteredMembers.map((member) => {
                        const presence = getUserPresence(member.user_id);
                        return (
                          <Button
                            key={member.id}
                            variant="ghost"
                            className="w-full justify-start h-auto p-3"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowUserDetails(true);
                            }}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar_url} />
                                  <AvatarFallback>
                                    {member.full_name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                                  getStatusBadgeColor(presence)
                                )} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="font-medium text-sm truncate">{member.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {getStatusText(presence)} • {member.role}
                                </p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="calls" className="mt-0 p-2">
                    <div className="space-y-1">
                      {callHistory.map((call) => (
                        <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={call.avatar} />
                              <AvatarFallback>{call.with.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5">
                              {call.type === 'video' ? (
                                <Video className="h-3 w-3 text-blue-500" />
                              ) : (
                                <Phone className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{call.with}</p>
                            <p className="text-xs text-muted-foreground">
                              {call.status === 'completed' && call.duration ? 
                                `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` :
                                call.status
                              } • {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Video className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetContent side="left" className="w-80 p-0">
            {/* Same sidebar content as desktop */}
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
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="font-semibold text-lg">{getChannelDisplayName(selectedChannel)}</h1>
                    <p className="text-sm text-muted-foreground">
                      {selectedChannel.is_direct_message ? 'Direct Message' : 
                       `${selectedChannel.member_count || 0} members`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (selectedChannel.is_direct_message && selectedChannel.channel_members) {
                        const otherMember = selectedChannel.channel_members.find(m => m.user_id !== profile?.id);
                        if (otherMember?.profiles) {
                          const member: TeamMember = {
                            id: otherMember.profiles.id,
                            full_name: otherMember.profiles.full_name,
                            email: '',
                            role: otherMember.profiles.role,
                            avatar_url: otherMember.profiles.avatar_url,
                            user_id: otherMember.user_id,
                          };
                          startCall(member, 'voice');
                        }
                      } else {
                        toast({ title: "Voice Call", description: "Voice calls available for direct messages" });
                      }
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (selectedChannel.is_direct_message && selectedChannel.channel_members) {
                        const otherMember = selectedChannel.channel_members.find(m => m.user_id !== profile?.id);
                        if (otherMember?.profiles) {
                          const member: TeamMember = {
                            id: otherMember.profiles.id,
                            full_name: otherMember.profiles.full_name,
                            email: '',
                            role: otherMember.profiles.role,
                            avatar_url: otherMember.profiles.avatar_url,
                            user_id: otherMember.user_id,
                          };
                          startCall(member, 'video');
                        }
                      } else {
                        toast({ title: "Video Call", description: "Video calls available for direct messages" });
                      }
                    }}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              {/* Messages */}
              <main className="flex-1">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isOwnMessage = message.sender_id === profile?.id;
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                        return (
                          <div key={message.id} className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
                            <div className="flex-shrink-0">
                              {showAvatar ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {(message.sender_name || 'U').substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-8" />
                              )}
                            </div>
                            <div className={cn("flex-1 max-w-[70%]", isOwnMessage && "text-right")}>
                              {showAvatar && (
                                <div className={cn("flex items-center gap-2 mb-1", isOwnMessage && "justify-end")}>
                                  <span className="text-sm font-medium">{message.sender_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessageTime(message.created_at)}
                                  </span>
                                </div>
                              )}
                              <div className={cn(
                                "rounded-lg px-3 py-2 max-w-fit",
                                isOwnMessage 
                                  ? "bg-primary text-primary-foreground ml-auto" 
                                  : "bg-muted"
                              )}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </main>

              {/* Message Input */}
              <footer className="p-4 border-t bg-card">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${getChannelDisplayName(selectedChannel)}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Communication</h3>
                <p className="text-muted-foreground">
                  Select a channel or start a conversation to begin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Dialog */}
      <UserDetailsDialog
        member={selectedMember}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedMember(null);
        }}
        onStartCall={startCall}
        onStartDM={startDirectMessage}
      />

      {/* Call Interface */}
      <CallInterface
        callState={callState}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
      />
    </>
  );
}