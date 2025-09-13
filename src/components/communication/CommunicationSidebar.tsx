import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search,
  Settings,
  Circle,
  User,
  Globe,
  Hash,
  Phone,
  Video,
  MoreHorizontal,
  Bell,
  BellOff,
  Pin
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  department?: string;
  email?: string;
  bio?: string;
}

interface Channel {
  id: string;
  name: string;
  type: string;
  is_direct_message?: boolean;
  participant_ids?: string[];
  created_at: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  is_muted?: boolean;
  is_pinned?: boolean;
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

interface CommunicationSidebarProps {
  profile: any;
  channels: Channel[];
  teamMembers: Profile[];
  selectedChannel: string | null;
  activeTab: string;
  searchQuery: string;
  setSelectedChannel: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  startDirectMessage: (member: Profile) => void;
  showUserProfile: (member: Profile) => void;
  getChannelDisplayName: (channel: Channel) => string;
}

export function CommunicationSidebar({
  profile,
  channels,
  teamMembers,
  selectedChannel,
  activeTab,
  searchQuery,
  setSelectedChannel,
  setActiveTab,
  setSearchQuery,
  startDirectMessage,
  showUserProfile,
  getChannelDisplayName
}: CommunicationSidebarProps) {
  const { getStatusBadgeColor, getUserPresence } = usePresence();
  const [compactView, setCompactView] = useState(false);

  // Enhanced filtering with sorting
  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter(member => 
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by presence (online first), then by name
        const aPresence = getUserPresence(a.id);
        const bPresence = getUserPresence(b.id);
        if (aPresence === 'online' && bPresence !== 'online') return -1;
        if (bPresence === 'online' && aPresence !== 'online') return 1;
        return a.full_name.localeCompare(b.full_name);
      });
  }, [teamMembers, searchQuery, getUserPresence]);

  const filteredChannels = useMemo(() => {
    return channels
      .filter(channel => 
        getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by pinned first, then by unread, then by recent activity
        if (a.is_pinned && !b.is_pinned) return -1;
        if (b.is_pinned && !a.is_pinned) return 1;
        if (a.unread_count && !b.unread_count) return -1;
        if (b.unread_count && !a.unread_count) return 1;
        return new Date(b.last_message_time || b.created_at).getTime() - 
               new Date(a.last_message_time || a.created_at).getTime();
      });
  }, [channels, searchQuery, getChannelDisplayName]);

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message) {
      return <User className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
    return channel.type === 'private' 
      ? <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
      : <Hash className="h-4 w-4 text-muted-foreground shrink-0" />;
  };

  const renderChannelItem = (channel: Channel) => (
    <div
      key={channel.id}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 group relative",
        selectedChannel === channel.id && "bg-muted border-l-4 border-l-primary",
        channel.unread_count && channel.unread_count > 0 && "bg-blue-50/50"
      )}
      onClick={() => setSelectedChannel(channel.id)}
    >
      {channel.is_pinned && (
        <Pin className="h-3 w-3 text-muted-foreground absolute -top-1 -left-1" />
      )}
      
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {getChannelIcon(channel)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm truncate",
              channel.unread_count && channel.unread_count > 0 ? "font-semibold" : "font-medium"
            )}>
              {getChannelDisplayName(channel)}
            </span>
            
            <div className="flex items-center gap-1 shrink-0">
              {channel.is_muted && (
                <BellOff className="h-3 w-3 text-muted-foreground" />
              )}
              {channel.unread_count && channel.unread_count > 0 && (
                <Badge variant="default" className="h-5 min-w-[20px] text-xs px-1.5 bg-red-500">
                  {channel.unread_count > 99 ? '99+' : channel.unread_count}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatLastMessageTime(channel.last_message_time)}
              </span>
            </div>
          </div>
          
          {channel.last_message && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {channel.last_message}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTeamMember = (member: Profile) => {
    const presence = getUserPresence(member.id);
    const isOnline = presence === 'online';

    return (
      <div
        key={member.id}
        className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 group"
        onClick={() => showUserProfile(member)}
      >
        <div className="relative shrink-0">
          <Avatar className={cn("h-8 w-8", compactView && "h-6 w-6")}>
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {member.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
            getStatusBadgeColor(presence)
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className={cn(
              "text-sm font-medium truncate",
              isOnline ? "text-foreground" : "text-muted-foreground"
            )}>
              {member.full_name}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  startDirectMessage(member);
                }}
                className="h-6 w-6 p-0"
                title="Send message"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                title="Start call"
              >
                <Phone className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                title="Start video call"
              >
                <Video className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {!compactView && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="capitalize">{member.role}</span>
              {member.department && (
                <>
                  <span>•</span>
                  <span className="truncate">{member.department}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col border-r bg-background/95">
      {/* Header */}
      <CardHeader className="pb-3 shrink-0 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Communications</CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCompactView(!compactView)}
              className="h-7 w-7 p-0"
              title={compactView ? "Expand view" : "Compact view"}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profile?.full_name}</div>
            <div className="flex items-center gap-1.5">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b bg-muted/20 shrink-0">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className="flex-1 rounded-none h-10 text-xs font-medium"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Chats
            {channels.some(c => c.unread_count && c.unread_count > 0) && (
              <Badge variant="destructive" className="ml-1.5 h-4 min-w-[16px] text-[10px] px-1">
                {channels.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('team')}
            className="flex-1 rounded-none h-10 text-xs font-medium"
          >
            <User className="h-3.5 w-3.5 mr-1.5" />
            Team
            <Badge variant="secondary" className="ml-1.5 h-4 min-w-[16px] text-[10px] px-1">
              {teamMembers.filter(m => getUserPresence(m.id) === 'online').length}
            </Badge>
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 shrink-0 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Find people...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8 text-sm bg-muted/50"
            />
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            {activeTab === 'chats' ? (
              filteredChannels.length > 0 ? (
                filteredChannels.map(renderChannelItem)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">No conversations found</p>
                  <p className="text-xs">Start a conversation with your team</p>
                </div>
              )
            ) : (
              filteredMembers.length > 0 ? (
                <div className="space-y-0.5">
                  {filteredMembers.map(renderTeamMember)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">No team members found</p>
                  <p className="text-xs">Try adjusting your search</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
