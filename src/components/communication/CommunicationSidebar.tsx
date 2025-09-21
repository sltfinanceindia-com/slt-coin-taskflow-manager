import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  Users,
  MessageSquare,
  Phone,
  Video,
  MoreHorizontal,
  Settings,
  Plus,
  Hash,
  User,
  Bell,
  BellOff,
  VolumeOff,
  Volume2,
  Circle,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  participants: string[];
  unreadCount: number;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: Date;
  };
  isActive?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  role: string;
  lastSeen?: Date;
  isInCall?: boolean;
  isMuted?: boolean;
}

interface CommunicationSidebarProps {
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (memberId: string) => void;
  selectedChannel?: string;
  className?: string;
}

export default function CommunicationSidebar({
  onChannelSelect,
  onMemberSelect,
  selectedChannel,
  className
}: CommunicationSidebarProps) {
  const [activeTab, setActiveTab] = useState<'channels' | 'members'>('channels');
  const [searchTerm, setSearchTerm] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setChannels([
      {
        id: '1',
        name: 'General',
        type: 'public',
        participants: ['1', '2', '3'],
        unreadCount: 3,
        lastMessage: {
          content: 'Welcome to the team!',
          sender: 'Admin',
          timestamp: new Date(Date.now() - 1000 * 60 * 5)
        }
      },
      {
        id: '2',
        name: 'Development',
        type: 'public',
        participants: ['1', '2'],
        unreadCount: 1,
        lastMessage: {
          content: 'Code review needed',
          sender: 'John',
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        }
      },
      {
        id: '3',
        name: 'Design',
        type: 'private',
        participants: ['1', '3'],
        unreadCount: 0,
        lastMessage: {
          content: 'New mockups ready',
          sender: 'Sarah',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
        }
      }
    ]);

    setTeamMembers([
      {
        id: '1',
        name: 'John Doe',
        avatar: '/avatars/john.png',
        status: 'online',
        role: 'Developer',
        isInCall: true
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        avatar: '/avatars/sarah.png',
        status: 'away',
        role: 'Designer',
        lastSeen: new Date(Date.now() - 1000 * 60 * 15)
      },
      {
        id: '3',
        name: 'Mike Johnson',
        avatar: '/avatars/mike.png',
        status: 'offline',
        role: 'Manager',
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3)
      }
    ]);
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !showOnlineOnly || member.status === 'online';
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
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
    return `${days}d ago`;
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className={cn("w-16 border-r bg-background", className)}>
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-full h-8"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("w-80 h-full border-r rounded-none", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Communication</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCollapsed(true)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
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
            <Hash className="h-4 w-4 mr-2" />
            Channels
          </Button>
          <Button
            variant={activeTab === 'members' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('members')}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            Team
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-full">
          {activeTab === 'channels' ? (
            <div className="space-y-1 p-4">
              {filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                      {channel.type === 'private' ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Hash className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{channel.name}</span>
                        {channel.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs h-5 min-w-5 flex items-center justify-center">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {channel.lastMessage && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span className="truncate max-w-32">
                            {channel.lastMessage.sender}: {channel.lastMessage.content}
                          </span>
                          <span className="ml-2 flex-shrink-0">
                            {formatMessageTime(channel.lastMessage.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}

              {filteredChannels.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No channels found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {/* Online Only Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Show online only</span>
                <Switch 
                  checked={showOnlineOnly} 
                  onCheckedChange={setShowOnlineOnly}
                />
              </div>

              <Separator />

              {/* Team Members */}
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => onMemberSelect(member.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                          getStatusColor(member.status)
                        )} />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{member.name}</span>
                          <div className="flex items-center gap-1">
                            {member.isInCall && (
                              <Phone className="h-3 w-3 text-green-500" />
                            )}
                            {member.isMuted && (
                              <VolumeOff className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{member.role}</span>
                          {member.status === 'offline' && member.lastSeen && (
                            <span>{formatLastSeen(member.lastSeen)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No team members found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}