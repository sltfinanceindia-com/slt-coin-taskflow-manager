import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, 
  Phone, 
  Video, 
  Users, 
  MessageSquare,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  PhoneCall,
  PhoneOff,
  Clock,
  Search,
  Plus,
  Hash,
  User,
  CheckCircle2,
  Circle,
  UserPlus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Star,
  StarOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
  channel_id: string;
  message_type: 'text' | 'system';
  is_read: boolean;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  participant_count: number;
  unread_count: number;
  last_message?: string;
  last_activity?: string;
  is_favorite: boolean;
  is_muted: boolean;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_online: boolean;
  last_seen?: string;
  status: 'available' | 'busy' | 'away' | 'offline';
}

interface CallHistoryEntry {
  id: string;
  caller_name: string;
  caller_avatar?: string;
  duration: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'missed';
  call_type: 'audio' | 'video';
  status: 'completed' | 'missed' | 'declined';
}

interface ActiveCall {
  id: string;
  type: 'audio' | 'video';
  participants: string[];
  start_time: string;
  is_muted: boolean;
  is_video_off: boolean;
}

export default function SimpleCommunication() {
  const { profile } = useAuth();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Call state
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ caller: string; type: 'audio' | 'video' } | null>(null);
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();
  const messagePollingRef = useRef<NodeJS.Timeout>();

  // Initialize data
  useEffect(() => {
    loadInitialData();
    startMessagePolling();
    
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [profile?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (activeCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [activeCall]);

  // Message polling for real-time updates
  const startMessagePolling = () => {
    messagePollingRef.current = setInterval(() => {
      if (selectedChannel) {
        loadMessages(selectedChannel.id);
      }
    }, 5000); // Poll every 5 seconds
  };

  const loadInitialData = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (membersError) throw membersError;

      // Transform members data
      const transformedMembers: TeamMember[] = (membersData || []).map(member => ({
        id: member.id,
        full_name: member.full_name || 'Unknown User',
        email: member.email || '',
        avatar_url: member.avatar_url,
        role: member.role || 'intern',
        is_online: Math.random() > 0.5, // Mock online status
        status: ['available', 'busy', 'away', 'offline'][Math.floor(Math.random() * 4)] as any
      }));

      setTeamMembers(transformedMembers);
      setOnlineUsers(new Set(transformedMembers.filter(m => m.is_online).map(m => m.id)));
      
      // Create initial channels
      const initialChannels: Channel[] = [
        {
          id: 'general',
          name: 'General',
          description: 'General team discussions',
          type: 'public',
          participant_count: transformedMembers.length,
          unread_count: 0,
          last_message: 'Welcome to the team communication!',
          last_activity: new Date().toISOString(),
          is_favorite: false,
          is_muted: false
        },
        {
          id: 'development',
          name: 'Development',
          description: 'Development discussions',
          type: 'private',
          participant_count: transformedMembers.filter(m => m.role === 'admin').length,
          unread_count: 0,
          is_favorite: false,
          is_muted: false
        },
        {
          id: 'random',
          name: 'Random',
          description: 'Random conversations',
          type: 'public',
          participant_count: transformedMembers.length,
          unread_count: 0,
          is_favorite: false,
          is_muted: false
        }
      ];
      
      setChannels(initialChannels);
      setSelectedChannel(initialChannels[0]);
      
      // Initialize call history
      const mockCallHistory: CallHistoryEntry[] = [
        {
          id: '1',
          caller_name: transformedMembers[0]?.full_name || 'Team Member',
          caller_avatar: transformedMembers[0]?.avatar_url,
          duration: '05:32',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'incoming',
          call_type: 'video',
          status: 'completed'
        },
        {
          id: '2',
          caller_name: transformedMembers[1]?.full_name || 'Team Lead',
          caller_avatar: transformedMembers[1]?.avatar_url,
          duration: '02:15',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'outgoing',
          call_type: 'audio',
          status: 'completed'
        }
      ];
      
      setCallHistory(mockCallHistory);
      
      // Load initial messages
      if (initialChannels[0]) {
        await loadMessages(initialChannels[0].id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load communication data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    // For now, use mock messages. In production, this would fetch from database
    const mockMessages: Message[] = [
      {
        id: '1',
        content: `Welcome to #${channels.find(c => c.id === channelId)?.name || 'channel'}! 🎉`,
        sender_id: 'system',
        sender_name: 'System',
        created_at: new Date(Date.now() - 600000).toISOString(),
        channel_id: channelId,
        message_type: 'system',
        is_read: true
      },
      {
        id: '2',
        content: 'Hello everyone! Hope you\'re having a great day.',
        sender_id: teamMembers[0]?.id || 'user1',
        sender_name: teamMembers[0]?.full_name || 'Team Member',
        sender_avatar: teamMembers[0]?.avatar_url,
        created_at: new Date(Date.now() - 300000).toISOString(),
        channel_id: channelId,
        message_type: 'text',
        is_read: true
      }
    ];

    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: profile.id,
      sender_name: profile.full_name || 'You',
      sender_avatar: profile.avatar_url,
      created_at: new Date().toISOString(),
      channel_id: selectedChannel.id,
      message_type: 'text',
      is_read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update channel's last message
    setChannels(prev => prev.map(ch => 
      ch.id === selectedChannel.id 
        ? { ...ch, last_message: message.content, last_activity: message.created_at }
        : ch
    ));

    // Play notification sound
    if (soundEnabled) {
      playNotificationSound();
    }

    toast({
      title: "Message sent",
      description: "Your message has been delivered",
    });
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;

    const newChannel: Channel = {
      id: `channel_${Date.now()}`,
      name: newChannelName,
      description: `${newChannelType} channel for team communication`,
      type: newChannelType,
      participant_count: newChannelType === 'public' ? teamMembers.length : 1,
      unread_count: 0,
      is_favorite: false,
      is_muted: false
    };

    setChannels(prev => [...prev, newChannel]);
    setSelectedChannel(newChannel);
    setNewChannelName('');
    setShowCreateChannel(false);

    toast({
      title: "Channel created",
      description: `Successfully created #${newChannel.name}`,
    });
  };

  const startCall = (type: 'audio' | 'video', targetUser?: string) => {
    const call: ActiveCall = {
      id: Date.now().toString(),
      type,
      participants: targetUser ? [profile!.id, targetUser] : [profile!.id],
      start_time: new Date().toISOString(),
      is_muted: false,
      is_video_off: type === 'audio'
    };

    setActiveCall(call);
    setShowCallDialog(true);

    toast({
      title: `${type === 'audio' ? 'Audio' : 'Video'} call started`,
      description: targetUser ? `Calling ${teamMembers.find(m => m.id === targetUser)?.full_name}` : "Conference call started",
    });

    // Add to call history
    const newCallEntry: CallHistoryEntry = {
      id: call.id,
      caller_name: targetUser ? teamMembers.find(m => m.id === targetUser)?.full_name || 'Unknown' : 'Conference Call',
      caller_avatar: targetUser ? teamMembers.find(m => m.id === targetUser)?.avatar_url : undefined,
      duration: '00:00',
      timestamp: call.start_time,
      type: 'outgoing',
      call_type: type,
      status: 'completed'
    };
    
    setCallHistory(prev => [newCallEntry, ...prev]);

    // Simulate incoming call for demo
    if (targetUser) {
      setTimeout(() => {
        setIncomingCall({
          caller: teamMembers.find(m => m.id === targetUser)?.full_name || 'Unknown',
          type
        });
      }, 2000);
    }
  };

  const endCall = () => {
    if (!activeCall) return;

    const duration = formatCallDuration(callDuration);
    
    setActiveCall(null);
    setShowCallDialog(false);
    setIncomingCall(null);
    setCallDuration(0);

    // Update call history with actual duration
    setCallHistory(prev => prev.map(call => 
      call.id === activeCall.id ? { ...call, duration, status: 'completed' } : call
    ));

    toast({
      title: "Call ended",
      description: `Call duration: ${duration}`,
    });
  };

  const answerCall = () => {
    setIncomingCall(null);
    toast({
      title: "Call answered",
      description: "You are now connected",
    });
  };

  const declineCall = () => {
    setIncomingCall(null);
    if (activeCall) {
      setCallHistory(prev => prev.map(call => 
        call.id === activeCall.id ? { ...call, status: 'declined' } : call
      ));
    }
    toast({
      title: "Call declined",
      description: "Call has been declined",
    });
  };

  const toggleMute = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? { ...prev, is_muted: !prev.is_muted } : null);
      toast({
        title: activeCall.is_muted ? "Unmuted" : "Muted",
        description: activeCall.is_muted ? "Your microphone is now on" : "Your microphone is now off",
      });
    }
  };

  const toggleVideo = () => {
    if (activeCall && activeCall.type === 'video') {
      setActiveCall(prev => prev ? { ...prev, is_video_off: !prev.is_video_off } : null);
      toast({
        title: activeCall.is_video_off ? "Camera on" : "Camera off",
        description: activeCall.is_video_off ? "Your camera is now on" : "Your camera is now off",
      });
    }
  };

  const toggleChannelFavorite = (channelId: string) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, is_favorite: !ch.is_favorite } : ch
    ));
  };

  const toggleChannelMute = (channelId: string) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, is_muted: !ch.is_muted } : ch
    ));
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.channel_id === selectedChannel?.id &&
    (searchQuery === '' || msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCallHistory = callHistory.filter(call =>
    searchQuery === '' || call.caller_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedChannels = [...channels].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Team Communication</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {onlineUsers.size} online
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <div className="p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Button 
                onClick={() => setShowCreateChannel(true)}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Channel
              </Button>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  CHANNELS
                </div>
                {sortedChannels.map((channel) => (
                  <div key={channel.id} className="group relative">
                    <Button
                      variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                      className="w-full justify-start mb-1 pr-8"
                      onClick={() => {
                        setSelectedChannel(channel);
                        loadMessages(channel.id);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {channel.is_favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                          {channel.type === 'public' ? <Hash className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          <span className="truncate">{channel.name}</span>
                          {channel.is_muted && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        {channel.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {channel.unread_count}
                          </Badge>
                        )}
                      </div>
                    </Button>
                    
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChannelFavorite(channel.id);
                        }}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChannel && (
              <>
                <div className="border-b p-4 bg-background">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedChannel.type === 'public' ? <Hash className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                        <h2 className="font-semibold">{selectedChannel.name}</h2>
                        {selectedChannel.is_favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedChannel.description} • {selectedChannel.participant_count} members
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall('audio')}
                        disabled={!!activeCall}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Audio Call
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall('video')}
                        disabled={!!activeCall}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {filteredMessages.map((message) => (
                      <div key={message.id} className={cn(
                        "flex gap-3",
                        message.sender_id === profile?.id && "justify-end"
                      )}>
                        {message.sender_id !== profile?.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender_avatar} />
                            <AvatarFallback>
                              {message.sender_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={cn(
                          "flex-1 max-w-xs",
                          message.sender_id === profile?.id && "flex justify-end"
                        )}>
                          <div className={cn(
                            "rounded-lg p-3",
                            message.sender_id === profile?.id 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted",
                            message.message_type === 'system' && "bg-secondary text-secondary-foreground text-center"
                          )}>
                            {message.sender_id !== profile?.id && message.message_type !== 'system' && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {message.sender_name}
                                </span>
                                <span className="text-xs opacity-70">
                                  {format(new Date(message.created_at), 'HH:mm')}
                                </span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            {message.sender_id === profile?.id && (
                              <div className="text-xs opacity-70 mt-1 text-right">
                                {format(new Date(message.created_at), 'HH:mm')}
                                {message.is_read ? <CheckCircle2 className="h-3 w-3 inline ml-1" /> : <Circle className="h-3 w-3 inline ml-1" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {message.sender_id === profile?.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender_avatar} />
                            <AvatarFallback>
                              {message.sender_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Call History</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="grid gap-3">
              {filteredCallHistory.map((call) => (
                <Card key={call.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={call.caller_avatar} />
                        <AvatarFallback>
                          {call.caller_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{call.caller_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {call.call_type === 'video' ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <Phone className="h-3 w-3" />
                          )}
                          <span>{call.type}</span>
                          <span>•</span>
                          <span>{call.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                        </p>
                        <Badge 
                          variant={
                            call.status === 'missed' ? 'destructive' : 
                            call.status === 'declined' ? 'secondary' : 'default'
                          }
                          className="mt-1"
                        >
                          {call.status}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall(call.call_type, call.caller_name)}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <Badge variant="secondary">
                {teamMembers.length} members
              </Badge>
            </div>

            <div className="grid gap-3">
              {teamMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                          member.is_online ? "bg-green-500" : "bg-gray-400"
                        )} />
                      </div>
                      
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          <span>•</span>
                          <span className={cn(
                            "capitalize",
                            member.status === 'available' && "text-green-600",
                            member.status === 'busy' && "text-red-600",
                            member.status === 'away' && "text-yellow-600"
                          )}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall('audio', member.id)}
                        disabled={!member.is_online || member.id === profile?.id}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall('video', member.id)}
                        disabled={!member.is_online || member.id === profile?.id}
                      >
                        <Video className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Channel Name</label>
              <Input
                placeholder="Enter channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Channel Type</label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={newChannelType === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewChannelType('public')}
                >
                  Public
                </Button>
                <Button
                  variant={newChannelType === 'private' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewChannelType('private')}
                >
                  Private
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createChannel} disabled={!newChannelName.trim()}>
                Create Channel
              </Button>
              <Button variant="outline" onClick={() => setShowCreateChannel(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeCall?.type === 'audio' ? 'Audio' : 'Video'} Call
            </DialogTitle>
          </DialogHeader>
          
          {activeCall && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeCall.type === 'video' ? (
                    <Video className="h-8 w-8 text-primary" />
                  ) : (
                    <Phone className="h-8 w-8 text-primary" />
                  )}
                </div>
                
                <p className="text-lg font-medium">Call Active</p>
                <p className="text-sm text-muted-foreground">
                  Duration: {formatCallDuration(callDuration)}
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  variant={activeCall.is_muted ? "destructive" : "secondary"}
                  size="sm"
                  onClick={toggleMute}
                >
                  {activeCall.is_muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                {activeCall.type === 'video' && (
                  <Button
                    variant={activeCall.is_video_off ? "destructive" : "secondary"}
                    size="sm"
                    onClick={toggleVideo}
                  >
                    {activeCall.is_video_off ? <Camera className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endCall}
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Incoming Call Dialog */}
      <Dialog open={!!incomingCall} onOpenChange={() => setIncomingCall(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Incoming Call</DialogTitle>
          </DialogHeader>
          
          {incomingCall && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {incomingCall.type === 'video' ? (
                    <Video className="h-8 w-8 text-primary" />
                  ) : (
                    <Phone className="h-8 w-8 text-primary" />
                  )}
                </div>
                
                <p className="text-lg font-medium">{incomingCall.caller}</p>
                <p className="text-sm text-muted-foreground">
                  Incoming {incomingCall.type} call
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  variant="default"
                  onClick={answerCall}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Answer
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={declineCall}
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}