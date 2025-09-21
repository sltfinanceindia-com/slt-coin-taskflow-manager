import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  MessageSquare,
  Users,
  Phone,
  Video,
  Search,
  Settings,
  Menu,
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Bell,
  BellOff,
  UserIcon,
  Hash,
  Circle,
  Check,
  CheckCheck,
  Mic,
  Camera,
  Share,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice';
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  participants: string[];
  unreadCount: number;
  lastMessage?: Message;
  avatar?: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  role: string;
  lastSeen?: Date;
}

interface MobileLayoutProps {
  onChannelSelect?: (channelId: string) => void;
  onMemberSelect?: (memberId: string) => void;
}

type View = 'channels' | 'chat' | 'members' | 'settings';

export default function MobileLayout({ onChannelSelect, onMemberSelect }: MobileLayoutProps) {
  const [currentView, setCurrentView] = useState<View>('channels');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedChannelData, setSelectedChannelData] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'members'>('channels');

  useEffect(() => {
    // Mock data initialization
    const mockChannels: Channel[] = [
      {
        id: '1',
        name: 'General',
        type: 'public',
        participants: ['user1', 'user2'],
        unreadCount: 3,
        lastMessage: {
          id: 'msg1',
          content: 'Welcome to the team!',
          sender: 'Admin',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'text',
          isOwn: false,
          status: 'read'
        }
      },
      {
        id: '2',
        name: 'Development',
        type: 'private',
        participants: ['user1', 'user3'],
        unreadCount: 1,
        lastMessage: {
          id: 'msg2',
          content: 'Code review needed',
          sender: 'John',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text',
          isOwn: false,
          status: 'delivered'
        }
      }
    ];

    const mockMembers: TeamMember[] = [
      {
        id: 'user1',
        name: 'John Doe',
        status: 'online',
        role: 'Developer'
      },
      {
        id: 'user2',
        name: 'Sarah Wilson',
        status: 'away',
        role: 'Designer',
        lastSeen: new Date(Date.now() - 1000 * 60 * 15)
      }
    ];

    setChannels(mockChannels);
    setTeamMembers(mockMembers);
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      // Mock messages for selected channel
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey everyone! How is the project going?',
          sender: 'John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'text',
          isOwn: false,
          status: 'read'
        },
        {
          id: '2',
          content: 'Going well! Just finished the authentication module.',
          sender: 'You',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text',
          isOwn: true,
          status: 'delivered'
        },
        {
          id: '3',
          content: 'Great work! Can you share the code?',
          sender: 'Sarah Wilson',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'text',
          isOwn: false,
          status: 'read'
        }
      ];
      setMessages(mockMessages);
      
      const channelData = channels.find(c => c.id === selectedChannel);
      setSelectedChannelData(channelData || null);
    }
  }, [selectedChannel, channels]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setCurrentView('chat');
    onChannelSelect?.(channelId);
  };

  const handleMemberSelect = (memberId: string) => {
    // Create or find direct message channel
    const existingDM = channels.find(c => 
      c.type === 'direct' && c.participants.includes(memberId)
    );
    
    if (existingDM) {
      handleChannelSelect(existingDM.id);
    } else {
      // Create new DM channel
      const member = teamMembers.find(m => m.id === memberId);
      if (member) {
        const newChannel: Channel = {
          id: `dm-${Date.now()}`,
          name: member.name,
          type: 'direct',
          participants: ['current-user', memberId],
          unreadCount: 0,
          avatar: member.avatar
        };
        setChannels(prev => [...prev, newChannel]);
        handleChannelSelect(newChannel.id);
      }
    }
    onMemberSelect?.(memberId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content: newMessage.trim(),
      sender: 'You',
      timestamp: new Date(),
      type: 'text',
      isOwn: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update channel's last message
    setChannels(prev => prev.map(channel => 
      channel.id === selectedChannel 
        ? { ...channel, lastMessage: message }
        : channel
    ));

    toast.success('Message sent');
  };

  const handleBackToChannels = () => {
    setCurrentView('channels');
    setSelectedChannel(null);
    setSelectedChannelData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3" />;
      case 'delivered': return <CheckCheck className="h-3 w-3" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Channels/Members List View
  if (currentView === 'channels') {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Sheet open={showSettings} onOpenChange={setShowSettings}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Notifications</span>
                          <Switch 
                            checked={notificationsEnabled} 
                            onCheckedChange={setNotificationsEnabled}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Sound</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Vibration</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={activeTab === 'channels' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('channels')}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chats
            </Button>
            <Button
              variant={activeTab === 'members' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('members')}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              People
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {activeTab === 'channels' ? (
            <div className="space-y-1 p-2">
              {filteredChannels.map(channel => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleChannelSelect(channel.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      {channel.type === 'direct' ? (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={channel.avatar} />
                          <AvatarFallback>
                            <UserIcon className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                          <Hash className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      {channel.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-medium">
                            {channel.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{channel.name}</h3>
                        {channel.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(channel.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {channel.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {channel.lastMessage.sender}: {channel.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredMembers.map(member => (
                <Button
                  key={member.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleMemberSelect(member.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          <UserIcon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                        getStatusColor(member.status)
                      )} />
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-sm">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      {member.status === 'offline' && member.lastSeen && (
                        <p className="text-xs text-muted-foreground">
                          Last seen {formatLastSeen(member.lastSeen)}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  // Chat View
  if (currentView === 'chat' && selectedChannelData) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBackToChannels}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              {selectedChannelData.type === 'direct' ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChannelData.avatar} />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="font-medium text-sm">{selectedChannelData.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedChannelData.type === 'direct' ? 'Direct Message' : 'Group Chat'}
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.isOwn ? "justify-end" : "justify-start"
                )}
              >
                {!message.isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {message.sender.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[80%] space-y-1",
                  message.isOwn ? "items-end" : "items-start"
                )}>
                  {!message.isOwn && (
                    <p className="text-xs font-medium text-muted-foreground">
                      {message.sender}
                    </p>
                  )}
                  
                  <div className={cn(
                    "rounded-2xl px-4 py-2 text-sm",
                    message.isOwn 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {message.content}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.isOwn && getMessageStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}