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
  Users
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

  // Enhanced filtering with better conversation sorting
  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter(member => 
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aPresence = getUserPresence(a.id);
        const bPresence = getUserPresence(b.id);
        if (aPresence?.activity_status === 'online' && bPresence?.activity_status !== 'online') return -1;
        if (bPresence?.activity_status === 'online' && aPresence?.activity_status !== 'online') return 1;
        return a.full_name.localeCompare(b.full_name);
      });
  }, [teamMembers, searchQuery, getUserPresence]);

  const filteredChannels = useMemo(() => {
    return channels
      .filter(channel => 
        getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
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
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 168) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message) {
      return <User className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
    return channel.type === 'private' 
      ? <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
      : <Hash className="h-4 w-4 text-muted-foreground shrink-0" />;
  };

  return (
    <Card className="h-full flex flex-col border-r bg-background w-80 min-w-80 max-w-80">
      {/* Header */}
      <CardHeader className="pb-4 shrink-0 border-b">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Communications</CardTitle>
          <div className="flex items-center gap-1">
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
            <div className="text-sm font-medium">{profile?.full_name}</div>
            <div className="flex items-center gap-1.5">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b bg-muted/20 shrink-0">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className="flex-1 rounded-none h-10 text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Recent
            {channels.some(c => c.unread_count && c.unread_count > 0) && (
              <Badge variant="destructive" className="ml-2 h-4 min-w-4 text-xs px-1">
                {channels.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('team')}
            className="flex-1 rounded-none h-10 text-sm font-medium"
          >
            <Users className="h-4 w-4 mr-2" />
            Team
            <Badge variant="secondary" className="ml-2 h-4 min-w-4 text-xs px-1">
              {teamMembers.filter(m => getUserPresence(m.id)?.activity_status === 'online').length}
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
          <div className="p-2">
            {activeTab === 'chats' ? (
              filteredChannels.length > 0 ? (
                <div className="space-y-1">
                  {filteredChannels.map(channel => (
                    <TooltipProvider key={channel.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group",
                              selectedChannel === channel.id && "bg-muted",
                              channel.unread_count && channel.unread_count > 0 && "bg-blue-50/50"
                            )}
                            onClick={() => setSelectedChannel(channel.id)}
                          >
                            {channel.is_pinned && (
                              <Pin className="h-3 w-3 text-blue-600 absolute top-1 right-1" />
                            )}
                            
                            <div className="shrink-0">
                              {getChannelIcon(channel)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn(
                                  "text-sm font-medium",
                                  channel.unread_count && channel.unread_count > 0 ? "font-semibold" : "font-medium"
                                )}>
                                  {getChannelDisplayName(channel)}
                                </span>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                  {channel.is_muted && (
                                    <BellOff className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  {channel.unread_count && channel.unread_count > 0 && (
                                    <Badge variant="destructive" className="h-4 min-w-4 text-xs px-1">
                                      {channel.unread_count > 99 ? '99+' : channel.unread_count}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex-1 min-w-0">
                                  {channel.last_message ? (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {channel.last_message_sender && !channel.is_direct_message && (
                                        <span className="font-medium">{channel.last_message_sender}: </span>
                                      )}
                                      {channel.last_message}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">No messages yet</p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatLastMessageTime(channel.last_message_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="max-w-xs">
                            <div className="font-medium">{getChannelDisplayName(channel)}</div>
                            {channel.last_message && (
                              <div className="text-xs opacity-90 mt-1">
                                Last: {channel.last_message}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">No conversations found</p>
                  <p className="text-xs">Start a conversation with your team</p>
                </div>
              )
            ) : (
              filteredMembers.length > 0 ? (
                <div className="space-y-1">
                  {filteredMembers.map(member => {
                    const presence = getUserPresence(member.id);
                    const isOnline = presence?.activity_status === 'online';

                    return (
                      <TooltipProvider key={member.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                              onClick={() => showUserProfile(member)}
                            >
                              <div className="relative shrink-0">
                                <Avatar className="h-8 w-8">
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
                                  <div className="min-w-0 flex-1">
                                    <div className={cn(
                                      "text-sm font-medium",
                                      isOnline ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                      {member.full_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      <span className="capitalize">{member.role}</span>
                                      {member.department && (
                                        <>
                                          <span> • </span>
                                          <span>{member.department}</span>
                                        </>
                                      )}
                                    </div>
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
                                      
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0"
                                      
                                    >
                                      <Phone className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0"
                                      
                                    >
                                      <Video className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <div className="max-w-xs">
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-xs opacity-90 mt-1">
                                {member.role} • {member.department || 'No department'}
                              </div>
                              <div className="text-xs opacity-90 capitalize">
                                Status: {presence?.activity_status || 'Unknown'}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
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
