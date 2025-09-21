import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
  channel_id: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  participant_count: number;
  unread_count: number;
}

interface CallHistoryEntry {
  id: string;
  caller_name: string;
  caller_avatar?: string;
  duration: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'missed';
  call_type: 'audio' | 'video';
}

export default function SimpleCommunication() {
  const { profile } = useAuth();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();

  // Initialize data
  useEffect(() => {
    loadInitialData();
  }, [profile?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (isInCall) {
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
  }, [isInCall]);

  const loadInitialData = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockChannels: Channel[] = [
        { id: '1', name: 'General', type: 'public', participant_count: 15, unread_count: 3 },
        { id: '2', name: 'Development Team', type: 'private', participant_count: 8, unread_count: 0 },
        { id: '3', name: 'Project Alpha', type: 'private', participant_count: 5, unread_count: 1 },
      ];
      
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Welcome to the team communication system!',
          sender_id: 'system',
          sender_name: 'System',
          created_at: new Date().toISOString(),
          channel_id: '1'
        },
        {
          id: '2',
          content: 'Hello everyone! Ready for today\'s standup?',
          sender_id: 'user1',
          sender_name: 'Sarah Johnson',
          sender_avatar: '/placeholder.svg',
          created_at: new Date(Date.now() - 300000).toISOString(),
          channel_id: '1'
        }
      ];

      const mockCallHistory: CallHistoryEntry[] = [
        {
          id: '1',
          caller_name: 'John Doe',
          caller_avatar: '/placeholder.svg',
          duration: '05:32',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'incoming',
          call_type: 'video'
        },
        {
          id: '2',
          caller_name: 'Jane Smith',
          caller_avatar: '/placeholder.svg',
          duration: '02:15',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'outgoing',
          call_type: 'audio'
        }
      ];
      
      setChannels(mockChannels);
      setMessages(mockMessages);
      setCallHistory(mockCallHistory);
      setSelectedChannel(mockChannels[0]);
      
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: profile.id,
      sender_name: profile.full_name || 'You',
      sender_avatar: profile.avatar_url,
      created_at: new Date().toISOString(),
      channel_id: selectedChannel.id
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Play notification sound
    if (soundEnabled) {
      playNotificationSound();
    }

    toast({
      title: "Message sent",
      description: "Your message has been delivered",
    });
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsInCall(true);
    setIsMuted(false);
    setIsVideoOff(type === 'audio');

    toast({
      title: `${type === 'audio' ? 'Audio' : 'Video'} call started`,
      description: "You are now in a call",
    });

    // Add to call history
    const newCall: CallHistoryEntry = {
      id: Date.now().toString(),
      caller_name: 'Conference Call',
      duration: '00:00',
      timestamp: new Date().toISOString(),
      type: 'outgoing',
      call_type: type
    };
    
    setCallHistory(prev => [newCall, ...prev]);
  };

  const endCall = () => {
    const duration = formatCallDuration(callDuration);
    
    setIsInCall(false);
    setCallDuration(0);

    // Update call history with actual duration
    setCallHistory(prev => prev.map((call, index) => 
      index === 0 ? { ...call, duration } : call
    ));

    toast({
      title: "Call ended",
      description: `Call duration: ${duration}`,
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Your microphone is now on" : "Your microphone is now off",
    });
  };

  const toggleVideo = () => {
    if (callType === 'video') {
      setIsVideoOff(prev => !prev);
      toast({
        title: isVideoOff ? "Camera on" : "Camera off",
        description: isVideoOff ? "Your camera is now on" : "Your camera is now off",
      });
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
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
  };

  const filteredMessages = messages.filter(msg => 
    msg.channel_id === selectedChannel?.id &&
    (searchQuery === '' || msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCallHistory = callHistory.filter(call =>
    searchQuery === '' || call.caller_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Team Communication</h1>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start mb-1"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {channel.type === 'public' ? <MessageSquare className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <span className="truncate">{channel.name}</span>
                      </div>
                      {channel.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                  </Button>
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
                      <h2 className="font-semibold">{selectedChannel.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedChannel.participant_count} members
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall('audio')}
                        disabled={isInCall}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Audio Call
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startCall('video')}
                        disabled={isInCall}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Call Controls */}
                {isInCall && (
                  <div className="bg-primary/10 p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {callType === 'audio' ? 'Audio' : 'Video'} Call Active
                          </span>
                        </div>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatCallDuration(callDuration)}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant={isMuted ? "destructive" : "secondary"}
                          size="sm"
                          onClick={toggleMute}
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        
                        {callType === 'video' && (
                          <Button
                            variant={isVideoOff ? "destructive" : "secondary"}
                            size="sm"
                            onClick={toggleVideo}
                          >
                            {isVideoOff ? <Camera className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
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
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {filteredMessages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender_avatar} />
                          <AvatarFallback>
                            {message.sender_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.sender_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
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
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
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
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(call.timestamp), 'MMM d, HH:mm')}
                      </p>
                      <Badge 
                        variant={call.type === 'missed' ? 'destructive' : 'secondary'}
                        className="mt-1"
                      >
                        {call.type}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}