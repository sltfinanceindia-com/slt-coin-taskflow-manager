import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Pin,
  Users,
  Clock
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
  last_message_sender?: string;
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

  // Enhanced filtering with better conversation sorting
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
        getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.last_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.last_message_sender?.toLowerCase().includes(searchQuery.toLowerCase())
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
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
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

  const getConversationPartner = (channel: Channel) => {
    if (!channel.is_direct_message) return null;
    return channel.channel_members?.find(member => 
      member.user_id !== profile?.user_id
    )?.profiles;
  };

  const renderChannelItem = (channel: Channel) => {
    const conversationPartner = getConversationPartner(channel);
    const displayName = getChannelDisplayName(channel);
    const isUnread = channel.unread_count && channel.unread_count > 0;
    
    return (
      <TooltipProvider key={channel.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative",
                "hover:bg-muted/50 hover:shadow-sm",
                selectedChannel === channel.id && "bg-primary/5 border border-primary/20 shadow-sm",
                isUnread && "bg-blue-50/80 border-l-4 border-l-blue-500"
              )}
              onClick={() => setSelectedChannel(channel.id)}
            >
              {/* Pinned indicator */}
              {channel.is_pinned && (
                <Pin className="h-3 w-3 text-blue-600 absolute top-1 right-1" />
              )}
              
              {/* Avatar/Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {channel.is_direct_message && conversationPartner ? (
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                      <AvatarImage src={conversationPartner.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {conversationPartner.full_name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                      getStatusBadgeColor(getUserPresence(conversationPartner.id))
                    )} />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted/80 flex items-center justify-center">
                    {getChannelIcon(channel)}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Name and Time Row */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn(
                    "font-semibold text-sm leading-tight",
                    isUnread ? "text-foreground" : "text-foreground/90"
                  )}>
                    {displayName}
                  </h3>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatLastMessageTime(channel.last_message_time)}
                    </span>
                  </div>
                </div>
                
                {/* Last Message Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {channel.last_message ? (
                      <div className="flex items-center gap-1">
                        {channel.last_message_sender && !channel.is_direct_message && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {channel.last_message_sender}:
                          </span>
                        )}
                        <p className={cn(
                          "text-xs truncate",
                          isUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"
                        )}>
                          {channel.last_message}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex items-center gap-1">
                    {channel.is_muted && (
                      <BellOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    {isUnread && (
                      <Badge variant="destructive" className="h-5 min-w-[20px] text-xs px-1.5 bg-blue-600">
                        {channel.unread_count! > 99 ? '99+' : channel.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Channel metadata for non-DM channels */}
                {!channel.is_direct_message && channel.channel_members && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{channel.channel_members.length} members</span>
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-medium">{displayName}</div>
              {channel.last_message && (
                <div className="text-xs opacity-90">
                  Last: {channel.last_message}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderTeamMember = (member: Profile) => {
    const presence = getUserPresence(member.id);
    const isOnline = presence === 'online';

    return (
      <TooltipProvider key={member.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-200 group hover:shadow-sm"
              onClick={() => showUserProfile(member)}
            >
              <div className="relative shrink-0">
                <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-semibold">
                    {member.full_name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                  getStatusBadgeColor(presence)
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className={cn(
                      "font-semibold text-sm leading-tight truncate",
                      isOnline ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {member.full_name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </span>
                      {member.department && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {member.department}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        startDirectMessage(member);
                      }}
                      className="h-7 w-7 p-0"
                      title="Send message"
                    >
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      title="Start call"
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      title="Start video call"
                    >
                      <Video className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-medium">{member.full_name}</div>
              <div className="text-xs opacity-90">
                {member.role} • {member.department || 'No department'}
              </div>
              <div className="text-xs opacity-90 capitalize">
                Status: {presence || 'Unknown'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="h-full flex flex-col border-r bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <CardHeader className="pb-4 shrink-0 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Communications</CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCompactView(!compactView)}
              className="h-8 w-8 p-0"
              title={compactView ? "Expand view" : "Compact view"}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/10">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-sm">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {profile?.full_name?.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-tight">
              {profile?.full_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b bg-muted/10 shrink-0">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className="flex-1 rounded-none h-12 text-sm font-medium relative"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Recent Chats
            {channels.some(c => c.unread_count && c.unread_count > 0) && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] text-xs px-1.5 bg-red-500"
              >
                {channels.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('team')}
            className="flex-1 rounded-none h-12 text-sm font-medium relative"
          >
            <Users className="h-4 w-4 mr-2" />
            Team Members
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] text-xs px-1.5 bg-green-100 text-green-700"
            >
              {teamMembers.filter(m => getUserPresence(m.id) === 'online').length}
            </Badge>
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0 border-b bg-muted/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Find team members...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm bg-background/50 border-muted-foreground/20 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {activeTab === 'chats' ? (
              filteredChannels.length > 0 ? (
                filteredChannels.map(renderChannelItem)
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No conversations found</p>
                  <p className="text-sm">Start chatting with your team members</p>
                </div>
              )
            ) : (
              filteredMembers.length > 0 ? (
                <div className="space-y-2">
                  {filteredMembers.map(renderTeamMember)}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No team members found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
