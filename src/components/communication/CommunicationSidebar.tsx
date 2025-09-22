import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Hash, 
  Lock, 
  Users, 
  MessageCircle, 
  Plus,
  Settings,
  Filter,
  Circle,
  Phone,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Channel, TeamMember } from '@/hooks/useCommunication';
import { useWebRTC } from '@/hooks/useWebRTC';

interface CommunicationSidebarProps {
  channels: Channel[];
  teamMembers: TeamMember[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onMemberSelect: (member: TeamMember) => void;
  onStartCall?: (memberId: string, callType: 'voice' | 'video') => void;
  collapsed?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export default function CommunicationSidebar({
  channels,
  teamMembers,
  selectedChannel,
  onChannelSelect,
  onMemberSelect,
  collapsed = false,
  searchQuery = '',
  onSearchChange,
  className
}: CommunicationSidebarProps) {
  const { startVoiceCall, startVideoCall } = useWebRTC();
  const [activeTab, setActiveTab] = useState('channels');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message) {
      return <MessageCircle className="h-4 w-4" />;
    }
    return channel.type === 'private' ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredChannels = useMemo(() => {
    return channels.filter(channel =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member =>
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (showOnlineOnly) {
      filtered = filtered.filter(member => member.is_online);
    }
    
    return filtered.sort((a, b) => {
      // Sort by online status first, then by name
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      return a.full_name.localeCompare(b.full_name);
    });
  }, [teamMembers, searchQuery, showOnlineOnly]);

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Unknown';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (collapsed) {
    return (
      <div className={cn("h-full bg-card border-r border-border w-16", className)}>
        <div className="p-2 space-y-2">
          <Button variant="ghost" size="sm" className="w-full h-10 p-0">
            <Hash className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-full h-10 p-0">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-full h-10 p-0">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-card flex flex-col", className)}>
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search channels and people..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels" className="text-xs">
              Channels ({filteredChannels.length})
            </TabsTrigger>
            <TabsTrigger value="people" className="text-xs">
              People ({filteredMembers.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Channels Tab */}
          <TabsContent value="channels" className="h-full m-0">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">CHANNELS</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1">
                {filteredChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto py-2 px-3"
                    onClick={() => onChannelSelect(channel)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {getChannelIcon(channel)}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {channel.name}
                          </span>
                          {channel.unread_count > 0 && (
                            <Badge variant="destructive" className="h-5 text-xs">
                              {channel.unread_count}
                            </Badge>
                          )}
                        </div>
                        {channel.last_message && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {channel.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="h-full m-0">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">TEAM MEMBERS</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                >
                  <Filter className={cn("h-3 w-3", showOnlineOnly && "text-primary")} />
                </Button>
              </div>
              {showOnlineOnly && (
                <div className="text-xs text-muted-foreground mb-2">
                  Showing online only
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-3 group"
                    onClick={() => onMemberSelect(member)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <Circle 
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current",
                            getStatusColor(member.activity_status)
                          )} 
                        />
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {member.full_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.is_online 
                            ? (member.status_message || 'Online') 
                            : `Last seen ${formatLastSeen(member.last_seen)}`
                          }
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startVoiceCall(member.id);
                          }}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startVideoCall(member.id);
                          }}
                        >
                          <Video className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Communication Settings
        </Button>
      </div>
    </div>
  );
}