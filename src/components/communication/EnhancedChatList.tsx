import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Hash, 
  Lock, 
  Users, 
  MessageCircle, 
  Plus,
  Pin,
  MoreHorizontal,
  Circle,
  Archive
} from 'lucide-react';
import type { Channel, TeamMember } from '@/hooks/useCommunication';
import { usePresence } from '@/hooks/usePresence';
import { useChatUsers } from '@/hooks/useChatUsers';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedChatListProps {
  channels: Channel[];
  teamMembers: TeamMember[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onMemberSelect: (member: TeamMember) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function EnhancedChatList({
  channels,
  teamMembers,
  selectedChannel,
  onChannelSelect,
  onMemberSelect,
  searchQuery = '',
  onSearchChange
}: EnhancedChatListProps) {
  const { profile } = useAuth();
  const { presenceList, getStatusText, getStatusBadgeColor } = usePresence();
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());

  // Debug log to see team members
  useEffect(() => {
    console.log('📋 EnhancedChatList - Team Members:', teamMembers.length, teamMembers);
    console.log('📋 EnhancedChatList - Channels:', channels.length);
    console.log('📋 EnhancedChatList - Current Profile:', profile?.id);
  }, [teamMembers, channels, profile]);

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message) {
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
    return channel.type === 'private' ? <Lock className="h-4 w-4 text-orange-500" /> : <Hash className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIndicator = (userId: string) => {
    const presence = presenceList.find(p => p.user_id === userId);
    const statusColor = getStatusBadgeColor(presence);
    
    return (
      <div className={cn(
        "w-3 h-3 rounded-full border-2 border-background absolute -bottom-0.5 -right-0.5",
        statusColor
      )} />
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false });
    } catch {
      return 'now';
    }
  };

  const getDirectMessageUser = (channel: Channel, currentUserId: string): TeamMember | null => {
    if (!channel.is_direct_message || !channel.participant_ids) return null;
    
    const otherUserId = channel.participant_ids.find(id => id !== currentUserId);
    if (!otherUserId) return null;
    
    // Find the user in teamMembers
    const user = teamMembers.find(member => member.id === otherUserId);
    
    // Debug log
    if (!user) {
      console.log('⚠️ User not found in teamMembers:', otherUserId);
      console.log('Available teamMembers:', teamMembers.map(m => m.id));
    }
    
    return user || null;
  };

  const getChannelDisplayName = (channel: Channel, currentUserId: string) => {
    if (channel.is_direct_message) {
      const user = getDirectMessageUser(channel, currentUserId);
      if (user) {
        return user.full_name;
      }
      // Fallback: if user not found, show loading or "User"
      return teamMembers.length === 0 ? 'Loading...' : 'User';
    }
    return channel.name;
  };

  // Process and sort channels
  const processedChannels = useMemo(() => {
    let filtered = channels.filter(channel =>
      getChannelDisplayName(channel, profile?.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by: pinned first, then unread, then recent activity
    return filtered.sort((a, b) => {
      const aPinned = pinnedChats.has(a.id);
      const bPinned = pinnedChats.has(b.id);
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (a.unread_count > 0 && b.unread_count === 0) return -1;
      if (a.unread_count === 0 && b.unread_count > 0) return 1;
      
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [channels, searchQuery, pinnedChats, teamMembers]);

  const pinnedChannels = processedChannels.filter(channel => pinnedChats.has(channel.id));
  const recentChannels = processedChannels.filter(channel => !pinnedChats.has(channel.id));

  const togglePin = (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const renderChannelRow = (channel: Channel) => {
    const user = getDirectMessageUser(channel, profile?.id || '');
    const isPinned = pinnedChats.has(channel.id);
    const isSelected = selectedChannel?.id === channel.id;

    return (
      <div key={channel.id} className="group">
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-auto py-3 px-3 group-hover:bg-muted/50 transition-colors",
            isSelected && "bg-primary/10 border-l-2 border-primary"
          )}
          onClick={() => onChannelSelect(channel)}
        >
          <div className="flex items-center gap-3 w-full">
            {/* Avatar/Icon */}
            <div className="relative flex-shrink-0">
              {channel.is_direct_message && user ? (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-sm">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                   </Avatar>
                   {getStatusIndicator(user.id)}
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {getChannelIcon(channel)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h4 className="font-medium text-sm truncate">
                    {getChannelDisplayName(channel, profile?.id || '')}
                  </h4>
                  {isPinned && (
                    <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  {channel.unread_count > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] text-xs flex items-center justify-center">
                      {channel.unread_count > 99 ? '99+' : channel.unread_count}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {channel.last_message?.timestamp ? formatTimestamp(channel.last_message.timestamp) : ''}
                </span>
              </div>
              
              {/* Last Message */}
              {channel.last_message ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {!channel.is_direct_message && (
                      <span className="font-medium">{channel.last_message.sender_name}: </span>
                    )}
                    {channel.last_message.content}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {channel.is_direct_message && user ? 
                    getStatusText(presenceList.find(p => p.user_id === user.id)) :
                    'No messages yet'
                  }
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => togglePin(channel.id, e)}
              >
                <Pin className={cn("h-3 w-3", isPinned ? "text-primary" : "text-muted-foreground")} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </Button>
      </div>
    );
  };

  // Filter team members based on search and exclude current user
  const filteredTeamMembers = useMemo(() => {
    return teamMembers
      .filter(member => member.id !== profile?.id) // Exclude current user
      .filter(member => 
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [teamMembers, searchQuery, profile]);

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search or type a command"
            className="pl-10 bg-muted/50"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {/* Pinned Section */}
          {pinnedChannels.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Pinned ({pinnedChannels.length})
                </span>
              </div>
              {pinnedChannels.map(renderChannelRow)}
              <Separator className="my-2" />
            </div>
          )}

          {/* Recent Section */}
          {recentChannels.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent ({recentChannels.length})
                </span>
              </div>
              {recentChannels.map(renderChannelRow)}
              <Separator className="my-2" />
            </div>
          )}

          {/* Team Members Section */}
          {filteredTeamMembers.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Team Members ({filteredTeamMembers.length})
                </span>
              </div>
              {filteredTeamMembers.map(member => {
                const presence = presenceList.find(p => p.user_id === member.id);
                const statusColor = getStatusBadgeColor(presence);
                
                return (
                  <div key={member.id} className="group">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto py-3 px-3 group-hover:bg-muted/50 transition-colors"
                      onClick={() => onMemberSelect(member)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {/* Avatar with status */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="text-sm">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "w-3 h-3 rounded-full border-2 border-background absolute -bottom-0.5 -right-0.5",
                            statusColor
                          )} />
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {member.full_name}
                            </h4>
                            <Badge 
                              variant={member.role === 'admin' ? 'default' : 'secondary'} 
                              className="text-xs h-5"
                            >
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {getStatusText(presence)}
                          </p>
                        </div>

                        {/* Message Icon */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {processedChannels.length === 0 && filteredTeamMembers.length === 0 && (
            <div className="text-center py-12 px-4">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No team members found' : 'No team members available'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}