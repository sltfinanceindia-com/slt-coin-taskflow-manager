import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  PinOff,
  Users,
  Plus,
  Edit3,
  Archive,
  Star,
  StarOff,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Clock,
  Activity,
  MessageCircle,
  UserPlus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Briefcase,
  Mail,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Maximize2,
  X,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  MicOff,
  Volume2
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  department?: string;
  email?: string;
  bio?: string;
  title?: string;
  phone?: string;
  timezone?: string;
  last_seen?: Date;
  status_message?: string;
}

interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  is_direct_message?: boolean;
  participant_ids?: string[];
  created_at: string;
  updated_at?: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  is_muted?: boolean;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_favorite?: boolean;
  member_count?: number;
  typing_users?: string[];
  channel_members?: {
    user_id: string;
    profiles?: Profile;
  }[];
}

interface CommunicationSidebarProps {
  profile: Profile;
  channels: Channel[];
  teamMembers: Profile[];
  selectedChannel: string | null;
  activeTab: string;
  searchQuery: string;
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  setSelectedChannel: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  startDirectMessage: (member: Profile) => void;
  showUserProfile: (member: Profile) => void;
  getChannelDisplayName: (channel: Channel) => string;
  onCreateChannel?: () => void;
  onInviteMembers?: () => void;
  onArchiveChannel?: (channelId: string) => void;
  onPinChannel?: (channelId: string) => void;
  onMuteChannel?: (channelId: string) => void;
}

export function CommunicationSidebar({
  profile,
  channels,
  teamMembers,
  selectedChannel,
  activeTab,
  searchQuery,
  isCollapsed = false,
  onCollapse,
  setSelectedChannel,
  setActiveTab,
  setSearchQuery,
  startDirectMessage,
  showUserProfile,
  getChannelDisplayName,
  onCreateChannel,
  onInviteMembers,
  onArchiveChannel,
  onPinChannel,
  onMuteChannel
}: CommunicationSidebarProps) {
  const { getStatusBadgeColor, getUserPresence } = usePresence();
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'unread'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'pinned' | 'muted'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [compactMode, setCompactMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Enhanced presence tracking
  const onlineMembers = useMemo(() => {
    return teamMembers.filter(member => 
      getUserPresence(member.id)?.activity_status === 'online'
    ).length;
  }, [teamMembers, getUserPresence]);

  // Enhanced filtering with smart categorization
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => 
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort members by presence and activity
    filtered.sort((a, b) => {
      const aPresence = getUserPresence(a.id);
      const bPresence = getUserPresence(b.id);
      
      // Online users first
      if (aPresence?.activity_status === 'online' && bPresence?.activity_status !== 'online') return -1;
      if (bPresence?.activity_status === 'online' && aPresence?.activity_status !== 'online') return 1;
      
      // Then by recent activity
      if (a.last_seen && b.last_seen) {
        return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      }
      
      return a.full_name.localeCompare(b.full_name);
    });

    return filtered;
  }, [teamMembers, searchQuery, getUserPresence]);

  // Enhanced channel filtering and sorting
  const filteredChannels = useMemo(() => {
    let filtered = channels.filter(channel => {
      if (showArchived && !channel.is_archived) return false;
      if (!showArchived && channel.is_archived) return false;
      
      const matchesSearch = getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = (() => {
        switch (filterBy) {
          case 'unread': return (channel.unread_count || 0) > 0;
          case 'pinned': return channel.is_pinned;
          case 'muted': return channel.is_muted;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesFilter;
    });

    // Enhanced sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Pinned channels first
          if (a.is_pinned && !b.is_pinned) return -1;
          if (b.is_pinned && !a.is_pinned) return 1;
          
          // Unread channels next
          if (a.unread_count && !b.unread_count) return -1;
          if (b.unread_count && !a.unread_count) return 1;
          
          // Then by last activity
          return new Date(b.last_message_time || b.updated_at || b.created_at).getTime() - 
                 new Date(a.last_message_time || a.updated_at || a.created_at).getTime();
        
        case 'name':
          return getChannelDisplayName(a).localeCompare(getChannelDisplayName(b));
        
        case 'unread':
          return (b.unread_count || 0) - (a.unread_count || 0);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [channels, searchQuery, filterBy, sortBy, showArchived, getChannelDisplayName]);

  // Group members by department for better organization
  const membersByDepartment = useMemo(() => {
    const groups: { [key: string]: Profile[] } = {};
    
    filteredMembers.forEach(member => {
      const department = member.department || 'Other';
      if (!groups[department]) {
        groups[department] = [];
      }
      groups[department].push(member);
    });
    
    return groups;
  }, [filteredMembers]);

  const formatLastMessageTime = useCallback((timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return format(date, 'HH:mm');
    if (diffInHours < 168) return format(date, 'EEE');
    return format(date, 'MMM dd');
  }, []);

  const getChannelIcon = useCallback((channel: Channel) => {
    if (channel.is_direct_message) {
      return <User className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
    return channel.type === 'private' 
      ? <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
      : <Hash className="h-4 w-4 text-muted-foreground shrink-0" />;
  }, []);

  const getPresenceIcon = useCallback((member: Profile) => {
    const presence = getUserPresence(member.id);
    switch (presence?.activity_status) {
      case 'online':
        return <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />;
      case 'away':
        return <Circle className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />;
      case 'busy':
        return <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500" />;
      default:
        return <Circle className="h-2.5 w-2.5 fill-gray-400 text-gray-400" />;
    }
  }, [getUserPresence]);

  const handleChannelAction = useCallback((action: string, channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'pin':
        onPinChannel?.(channelId);
        break;
      case 'mute':
        onMuteChannel?.(channelId);
        break;
      case 'archive':
        onArchiveChannel?.(channelId);
        break;
    }
  }, [onPinChannel, onMuteChannel, onArchiveChannel]);

  if (isCollapsed) {
    return (
      <Card className="h-full flex flex-col border-r bg-background w-16 min-w-16 max-w-16">
        <CardHeader className="p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapse?.(false)}
            className="h-8 w-8 p-0 mx-auto"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-2">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 mx-auto cursor-pointer">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div>
                    <div className="font-medium">{profile?.full_name}</div>
                    <div className="text-xs opacity-90">{profile?.role}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Separator />
            
            {filteredChannels.slice(0, 5).map(channel => (
              <TooltipProvider key={channel.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedChannel === channel.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedChannel(channel.id)}
                      className="h-8 w-8 p-0 relative"
                    >
                      {getChannelIcon(channel)}
                      {channel.unread_count && channel.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">
                            {channel.unread_count > 9 ? '9+' : channel.unread_count}
                          </span>
                        </div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="max-w-xs">
                      <div className="font-medium">{getChannelDisplayName(channel)}</div>
                      {channel.last_message && (
                        <div className="text-xs opacity-90 mt-1">
                          {channel.last_message}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col border-r bg-gradient-to-b from-background to-muted/20 w-80 min-w-80 max-w-80">
        {/* Enhanced Header */}
        <CardHeader className="pb-3 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base font-semibold flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Communications</span>
              <Badge variant="secondary" className="text-xs">
                {onlineMembers} online
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotifications(!notifications)}
                    className="h-7 w-7 p-0"
                  >
                    {notifications ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {notifications ? 'Disable notifications' : 'Enable notifications'}
                </TooltipContent>
              </Tooltip>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Communication Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compact mode</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCompactMode(!compactMode)}
                      >
                        {compactMode ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show archived</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowArchived(!showArchived)}
                      >
                        {showArchived ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {onCollapse && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCollapse(true)}
                      className="h-7 w-7 p-0"
                    >
                      <Minimize2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Collapse sidebar</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          
          {/* Enhanced User Profile Section */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
               onClick={() => showUserProfile(profile)}>
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {profile?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5">
                {getPresenceIcon(profile)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profile?.full_name}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground capitalize">
                  {getUserPresence(profile.id)?.activity_status || 'offline'}
                </span>
                {profile?.status_message && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {profile.status_message}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Enhanced Tab Navigation */}
          <div className="flex border-b bg-muted/10">
            <Button
              variant={activeTab === 'chats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chats')}
              className="flex-1 rounded-none h-11 text-sm font-medium relative"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversations
              {channels.some(c => c.unread_count && c.unread_count > 0) && (
                <Badge variant="destructive" className="ml-2 h-4 min-w-4 text-xs px-1 animate-pulse">
                  {channels.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('team')}
              className="flex-1 rounded-none h-11 text-sm font-medium relative"
            >
              <Users className="h-4 w-4 mr-2" />
              Team
              <Badge variant="secondary" className="ml-2 h-4 min-w-4 text-xs px-1">
                {onlineMembers}/{teamMembers.length}
              </Badge>
            </Button>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="p-3 space-y-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Find team members...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {activeTab === 'chats' && (
              <div className="flex items-center justify-between space-x-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent activity</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                    <SelectItem value="unread">Unread first</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All conversations</SelectItem>
                    <SelectItem value="unread">Unread only</SelectItem>
                    <SelectItem value="pinned">Pinned only</SelectItem>
                    <SelectItem value="muted">Muted only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Enhanced Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {activeTab === 'chats' ? (
                <>
                  {/* Quick Actions */}
                  <div className="flex space-x-1 mb-3 p-2">
                    {onCreateChannel && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={onCreateChannel} className="h-8 flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Channel
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create new channel</TooltipContent>
                      </Tooltip>
                    )}
                    
                    {onInviteMembers && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={onInviteMembers} className="h-8 flex-1">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Invite team members</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {filteredChannels.length > 0 ? (
                    <div className="space-y-1">
                      {filteredChannels.map(channel => (
                        <div
                          key={channel.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/60 transition-all duration-200 group relative",
                            selectedChannel === channel.id && "bg-primary/10 border-l-2 border-primary shadow-sm",
                            channel.unread_count && channel.unread_count > 0 && "bg-blue-50/50 dark:bg-blue-950/20"
                          )}
                          onClick={() => setSelectedChannel(channel.id)}
                        >
                          {/* Pinned indicator */}
                          {channel.is_pinned && (
                            <Pin className="h-3 w-3 text-blue-600 absolute top-1 right-1" />
                          )}
                          
                          {/* Channel icon */}
                          <div className="shrink-0 relative">
                            {getChannelIcon(channel)}
                            {channel.typing_users && channel.typing_users.length > 0 && (
                              <div className="absolute -bottom-1 -right-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn(
                                "text-sm truncate",
                                channel.unread_count && channel.unread_count > 0 ? "font-semibold" : "font-medium"
                              )}>
                                {getChannelDisplayName(channel)}
                              </span>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                {channel.is_muted && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Mute className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>Muted</TooltipContent>
                                  </Tooltip>
                                )}
                                
                                {channel.is_favorite && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
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
                                {channel.typing_users && channel.typing_users.length > 0 ? (
                                  <p className="text-xs text-green-600 italic animate-pulse">
                                    {channel.typing_users.length === 1 
                                      ? `${channel.typing_users[0]} is typing...`
                                      : `${channel.typing_users.length} people are typing...`
                                    }
                                  </p>
                                ) : channel.last_message ? (
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

                          {/* Quick actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                            <div className="flex space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleChannelAction('pin', channel.id, e)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {channel.is_pinned ? 
                                      <PinOff className="h-3 w-3" /> : 
                                      <Pin className="h-3 w-3" />
                                    }
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {channel.is_pinned ? 'Unpin' : 'Pin'} channel
                                </TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleChannelAction('mute', channel.id, e)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {channel.is_muted ? 
                                      <Volume2 className="h-3 w-3" /> : 
                                      <Mute className="h-3 w-3" />
                                    }
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {channel.is_muted ? 'Unmute' : 'Mute'} channel
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium mb-2">No conversations found</p>
                      <p className="text-xs mb-4">
                        {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation with your team'}
                      </p>
                      {onCreateChannel && !searchQuery && (
                        <Button variant="outline" size="sm" onClick={onCreateChannel}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Channel
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Team statistics */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-2">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-lg font-bold">{onlineMembers}</div>
                          <div className="text-xs text-muted-foreground">Online</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-lg font-bold">{teamMembers.length}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {filteredMembers.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(membersByDepartment).map(([department, members]) => (
                        <div key={department}>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                            {department} ({members.length})
                          </h4>
                          
                          <div className="space-y-1">
                            {members.map(member => {
                              const presence = getUserPresence(member.id);
                              const isOnline = presence?.activity_status === 'online';
                              
                              return (
                                <div
                                  key={member.id}
                                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 group"
                                  onClick={() => setSelectedMember(member)}
                                >
                                  <div className="relative shrink-0">
                                    <Avatar className={cn(
                                      "h-9 w-9 ring-2 ring-background shadow-sm transition-all duration-200",
                                      isOnline ? "ring-green-500/20" : "ring-muted-foreground/20"
                                    )}>
                                      <AvatarImage src={member.avatar_url} />
                                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                                        {member.full_name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-0.5 -right-0.5">
                                      {getPresenceIcon(member)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="min-w-0 flex-1">
                                        <div className={cn(
                                          "text-sm font-medium truncate",
                                          isOnline ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                          {member.full_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          <span className="capitalize">{member.role}</span>
                                          {member.title && (
                                            <>
                                              <span> • </span>
                                              <span>{member.title}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {presence?.activity_status && (
                                      <div className="text-xs text-muted-foreground capitalize mt-1">
                                        {presence.activity_status}
                                        {member.last_seen && !isOnline && (
                                          <span> • Last seen {formatDistanceToNow(member.last_seen)} ago</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            startDirectMessage(member);
                                          }}
                                          className="h-7 w-7 p-0 hover:bg-blue-500/10"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Send message</TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-7 w-7 p-0 hover:bg-green-500/10"
                                        >
                                          <Phone className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Audio call</TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-7 w-7 p-0 hover:bg-purple-500/10"
                                        >
                                          <Video className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Video call</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium mb-2">No team members found</p>
                      <p className="text-xs mb-4">
                        {searchQuery ? 'Try adjusting your search terms' : 'No team members available'}
                      </p>
                      {onInviteMembers && !searchQuery && (
                        <Button variant="outline" size="sm" onClick={onInviteMembers}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite Members
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Member Profile Dialog */}
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedMember.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedMember.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getPresenceIcon(selectedMember)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{selectedMember.full_name}</div>
                    <div className="text-sm text-muted-foreground">{selectedMember.role}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {selectedMember.title && (
                    <div>
                      <div className="font-medium">Title</div>
                      <div className="text-muted-foreground">{selectedMember.title}</div>
                    </div>
                  )}
                  
                  {selectedMember.department && (
                    <div>
                      <div className="font-medium">Department</div>
                      <div className="text-muted-foreground">{selectedMember.department}</div>
                    </div>
                  )}
                  
                  {selectedMember.email && (
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">{selectedMember.email}</div>
                    </div>
                  )}
                  
                  {selectedMember.bio && (
                    <div>
                      <div className="font-medium">About</div>
                      <div className="text-muted-foreground">{selectedMember.bio}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      startDirectMessage(selectedMember);
                      setSelectedMember(null);
                    }}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </TooltipProvider>
  );
}
