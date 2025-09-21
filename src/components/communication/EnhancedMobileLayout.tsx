import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  Hash,
  Circle,
  Check,
  CheckCheck,
  Mic,
  Camera,
  Share,
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  Pin,
  PinOff,
  Copy,
  Reply,
  Forward,
  Info,
  UserPlus,
  VolumeOff,
  Volume2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
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
  description?: string;
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  role: string;
  lastSeen?: Date;
  isTyping?: boolean;
  customStatus?: string;
}

interface EnhancedMobileLayoutProps {
  onChannelSelect?: (channelId: string) => void;
  onMemberSelect?: (memberId: string) => void;
  currentUserId?: string;
}

type View = 'channels' | 'chat' | 'members' | 'settings' | 'profile';

export default function EnhancedMobileLayout({ 
  onChannelSelect, 
  onMemberSelect,
  currentUserId = 'current-user'
}: EnhancedMobileLayoutProps) {
  const [currentView, setCurrentView] = useState<View>('channels');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedChannelData, setSelectedChannelData] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'members'>('channels');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Mock data initialization
    const mockChannels: Channel[] = [
      {
        id: '1',
        name: 'General',
        type: 'public',
        participants: ['user1', 'user2', 'user3'],
        unreadCount: 3,
        description: 'General team discussions',
        lastMessage: {
          id: 'msg1',
          content: 'Welcome to the team! 🎉',
          sender: 'Admin',
          senderId: 'admin',
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
        description: 'Development team channel',
        isPinned: true,
        lastMessage: {
          id: 'msg2',
          content: 'Code review needed for the new feature',
          sender: 'John',
          senderId: 'user1',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text',
          isOwn: false,
          status: 'delivered'
        }
      },
      {
        id: '3',
        name: 'Sarah Wilson',
        type: 'direct',
        participants: [currentUserId, 'user2'],
        unreadCount: 0,
        avatar: '/avatars/sarah.png',
        lastMessage: {
          id: 'msg3',
          content: 'Thanks for the help!',
          sender: 'Sarah',
          senderId: 'user2',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          type: 'text',
          isOwn: false,
          status: 'read'
        }
      }
    ];

    const mockMembers: TeamMember[] = [
      {
        id: 'user1',
        name: 'John Doe',
        status: 'online',
        role: 'Senior Developer',
        customStatus: '🚀 Shipping features'
      },
      {
        id: 'user2',
        name: 'Sarah Wilson',
        status: 'away',
        role: 'UX Designer',
        lastSeen: new Date(Date.now() - 1000 * 60 * 15),
        customStatus: '🎨 In design mode'
      },
      {
        id: 'user3',
        name: 'Mike Johnson',
        status: 'busy',
        role: 'Project Manager',
        customStatus: '📅 In meetings'
      },
      {
        id: 'user4',
        name: 'Emily Chen',
        status: 'offline',
        role: 'QA Engineer',
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3)
      }
    ];

    setChannels(mockChannels);
    setTeamMembers(mockMembers);
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChannel) {
      // Mock messages for selected channel
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey everyone! How is the project going?',
          sender: 'John Doe',
          senderId: 'user1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          type: 'text',
          isOwn: false,
          status: 'read',
          reactions: [
            { emoji: '👍', users: ['user2', 'user3'] },
            { emoji: '🚀', users: ['user2'] }
          ]
        },
        {
          id: '2',
          content: 'Going really well! Just finished implementing the authentication system. The user experience is much smoother now.',
          sender: 'You',
          senderId: currentUserId,
          timestamp: new Date(Date.now() - 1000 * 60 * 90),
          type: 'text',
          isOwn: true,
          status: 'delivered',
          isPinned: true
        },
        {
          id: '3',
          content: 'That\'s awesome! Can you share some screenshots of the new interface?',
          sender: 'Sarah Wilson',
          senderId: 'user2',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'text',
          isOwn: false,
          status: 'read',
          replyTo: '2'
        },
        {
          id: '4',
          content: 'Sure! Here are the latest designs',
          sender: 'You',
          senderId: currentUserId,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'image',
          isOwn: true,
          status: 'read',
          attachments: [
            {
              id: 'att1',
              name: 'auth-flow.png',
              url: '/images/auth-flow.png',
              type: 'image/png',
              size: 245760
            }
          ]
        },
        {
          id: '5',
          content: 'Perfect! This looks exactly what we needed. Great work! 🎉',
          sender: 'Mike Johnson',
          senderId: 'user3',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'text',
          isOwn: false,
          status: 'read',
          reactions: [
            { emoji: '💯', users: ['user1', 'user2'] }
          ]
        }
      ];
      
      setMessages(mockMessages);
      
      const channelData = channels.find(c => c.id === selectedChannel);
      setSelectedChannelData(channelData || null);
    }
  }, [selectedChannel, channels, currentUserId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (newMessage && selectedChannel) {
      if (!isTyping) {
        setIsTyping(true);
        // Simulate sending typing status to other users
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, selectedChannel, isTyping]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setCurrentView('chat');
    setReplyingTo(null);
    setEditingMessage(null);
    
    // Mark channel as read
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, unreadCount: 0 } : channel
    ));
    
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
          participants: [currentUserId, memberId],
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
      senderId: currentUserId,
      timestamp: new Date(),
      type: 'text',
      isOwn: true,
      status: 'sent',
      replyTo: replyingTo || undefined,
      isEdited: false
    };

    if (editingMessage) {
      // Update existing message
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage 
          ? { ...msg, content: newMessage.trim(), isEdited: true }
          : msg
      ));
      setEditingMessage(null);
      toast.success('Message updated');
    } else {
      // Add new message
      setMessages(prev => [...prev, message]);
      
      // Update channel's last message
      setChannels(prev => prev.map(channel => 
        channel.id === selectedChannel 
          ? { ...channel, lastMessage: message }
          : channel
      ));
    }

    setNewMessage('');
    setReplyingTo(null);
    toast.success('Message sent');
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    messageInputRef.current?.focus();
  };

  const handleEdit = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.isOwn) {
      setEditingMessage(messageId);
      setNewMessage(message.content);
      messageInputRef.current?.focus();
    }
  };

  const handleDelete = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    toast.success('Message deleted');
  };

  const handlePin = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isPinned: !msg.isPinned }
        : msg
    ));
    toast.success('Message pinned');
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(currentUserId)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(u => u !== currentUserId);
            if (existingReaction.users.length === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            // Add reaction
            existingReaction.users.push(currentUserId);
          }
        } else {
          // New reaction
          reactions.push({ emoji, users: [currentUserId] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const handleBackToChannels = () => {
    setCurrentView('channels');
    setSelectedChannel(null);
    setSelectedChannelData(null);
    setReplyingTo(null);
    setEditingMessage(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3" />;
      case 'delivered': return <CheckCheck className="h-3 w-3" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  const getRepliedMessage = (messageId: string) => {
    return messages.find(m => m.id === messageId);
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) && !channel.isArchived
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
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Push notifications</span>
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
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show previews</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Appearance</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Dark mode</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Compact mode</span>
                          <Switch />
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
              {/* Pinned Channels */}
              {filteredChannels.filter(c => c.isPinned).length > 0 && (
                <>
                  <div className="px-3 py-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </h3>
                  </div>
                  {filteredChannels.filter(c => c.isPinned).map(channel => (
                    <ChannelItem 
                      key={channel.id} 
                      channel={channel} 
                      onSelect={handleChannelSelect}
                    />
                  ))}
                  <Separator className="my-2" />
                </>
              )}
              
              {/* Regular Channels */}
              {filteredChannels.filter(c => !c.isPinned).map(channel => (
                <ChannelItem 
                  key={channel.id} 
                  channel={channel} 
                  onSelect={handleChannelSelect}
                />
              ))}
              
              {filteredChannels.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredMembers.map(member => (
                <MemberItem 
                  key={member.id} 
                  member={member} 
                  onSelect={handleMemberSelect}
                />
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No team members found</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>
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
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="font-medium text-sm flex items-center gap-2">
                  {selectedChannelData.name}
                  {selectedChannelData.isMuted && <VolumeOff className="h-3 w-3 text-muted-foreground" />}
                  {selectedChannelData.isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                </h2>
                <div className="text-xs text-muted-foreground">
                  {selectedChannelData.type === 'direct' ? (
                    <span>Direct Message</span>
                  ) : (
                    <span>{selectedChannelData.participants.length} members</span>
                  )}
                  {typingUsers.length > 0 && (
                    <span className="text-primary"> • {typingUsers.join(', ')} typing...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Sheet open={showChannelInfo} onOpenChange={setShowChannelInfo}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Channel Info</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 pt-6">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Hash className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium">{selectedChannelData.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedChannelData.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mute notifications</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pin conversation</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Reply Banner */}
        {replyingTo && (
          <div className="border-b p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Replying to {getRepliedMessage(replyingTo)?.sender}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm mt-1 text-muted-foreground truncate">
              {getRepliedMessage(replyingTo)?.content}
            </p>
          </div>
        )}

        {/* Edit Banner */}
        {editingMessage && (
          <div className="border-b p-3 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Editing message</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setEditingMessage(null);
                setNewMessage('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                previousMessage={index > 0 ? messages[index - 1] : undefined}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
                onReaction={handleReaction}
                currentUserId={currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={messageInputRef}
                placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-10 max-h-32 resize-none pr-20"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
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

// Channel Item Component
interface ChannelItemProps {
  channel: Channel;
  onSelect: (channelId: string) => void;
}

function ChannelItem({ channel, onSelect }: ChannelItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-4"
      onClick={() => onSelect(channel.id)}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="relative">
          {channel.type === 'direct' ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={channel.avatar} />
              <AvatarFallback>
                <User className="h-6 w-6" />
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
                {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{channel.name}</h3>
              {channel.isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
              {channel.isMuted && <VolumeOff className="h-3 w-3 text-muted-foreground" />}
            </div>
            {channel.lastMessage && (
              <span className="text-xs text-muted-foreground">
                {channel.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  );
}

// Member Item Component
interface MemberItemProps {
  member: TeamMember;
  onSelect: (memberId: string) => void;
}

function MemberItem({ member, onSelect }: MemberItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
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

  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-4"
      onClick={() => onSelect(member.id)}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>
              <User className="h-6 w-6" />
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
          {member.customStatus && (
            <p className="text-xs text-muted-foreground">{member.customStatus}</p>
          )}
          {member.status === 'offline' && member.lastSeen && (
            <p className="text-xs text-muted-foreground">
              Last seen {formatLastSeen(member.lastSeen)}
            </p>
          )}
        </div>
      </div>
    </Button>
  );
}

// Message Item Component
interface MessageItemProps {
  message: Message;
  previousMessage?: Message;
  onReply: (messageId: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

function MessageItem({ 
  message, 
  previousMessage, 
  onReply, 
  onEdit, 
  onDelete, 
  onPin, 
  onReaction,
  currentUserId 
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  
  const isGrouped = previousMessage && 
    previousMessage.senderId === message.senderId &&
    (message.timestamp.getTime() - previousMessage.timestamp.getTime()) < 5 * 60 * 1000; // 5 minutes

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3" />;
      case 'delivered': return <CheckCheck className="h-3 w-3" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors",
        message.isOwn ? "justify-end" : "justify-start"
      )}
      onClick={() => setShowActions(true)}
    >
      {!message.isOwn && !isGrouped && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {message.sender.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!message.isOwn && isGrouped && (
        <div className="w-8" />
      )}
      
      <div className={cn(
        "max-w-[80%] space-y-1",
        message.isOwn ? "items-end" : "items-start"
      )}>
        {!message.isOwn && !isGrouped && (
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {message.sender}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        
        {message.isPinned && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Pin className="h-3 w-3" />
            <span>Pinned</span>
          </div>
        )}

        {message.replyTo && (
          <div className="border-l-2 border-muted pl-2 text-xs text-muted-foreground">
            <p>Replying to message</p>
          </div>
        )}
        
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm relative",
          message.isOwn 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {message.content}
          {message.isEdited && (
            <span className="text-xs opacity-60 ml-2">(edited)</span>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Message Actions */}
        {showActions && (
          <div className="flex gap-1 mt-1">
            <Button variant="ghost" size="sm" onClick={() => onReply(message.id)}>
              <Reply className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onReaction(message.id, '👍')}>
              👍
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onReaction(message.id, '❤️')}>
              ❤️
            </Button>
            {message.isOwn && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onEdit(message.id)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(message.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => onPin(message.id)}>
              {message.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </Button>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReaction(message.id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.users.length}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isGrouped && <span>{formatTime(message.timestamp)}</span>}
          {message.isOwn && getMessageStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
}