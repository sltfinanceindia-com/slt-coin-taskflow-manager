import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Menu, 
  MessageSquare, 
  Users, 
  Phone, 
  Video, 
  ArrowLeft,
  MoreVertical,
  Search,
  Hash,
  X,
  Settings,
  Info,
  Bell,
  BellOff,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Star,
  StarOff,
  Pin,
  PinOff,
  Archive,
  Clock,
  Activity,
  Zap,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Shield,
  Crown,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Copy,
  Link2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { PresenceIndicator } from './PresenceIndicator';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  department?: string;
  title?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  last_seen?: Date;
  location?: string;
  is_favorite?: boolean;
  skills?: string[];
  bio?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  is_direct_message?: boolean;
  participant_count?: number;
  created_at?: Date;
  updated_at?: Date;
  unread_count?: number;
  last_message?: string;
  last_message_time?: Date;
  last_message_sender?: string;
  is_muted?: boolean;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_favorite?: boolean;
  other_user_id?: string;
  members?: TeamMember[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface EnhancedMobileLayoutProps {
  children: React.ReactNode;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  selectedChannel?: string | null;
  teamMembers: TeamMember[];
  channels: Channel[];
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (member: TeamMember) => void;
  onStartCall: (type: 'audio' | 'video', member?: TeamMember) => void;
  getChannelDisplayName: (channel: Channel) => string;
  getChannelIcon: (channel: Channel) => React.ReactNode;
  currentChannelName?: string;
  isLoading?: boolean;
  connectionStatus?: 'online' | 'offline' | 'connecting';
  notifications?: { id: string; message: string; type: 'info' | 'warning' | 'error' }[];
  onClearNotification?: (id: string) => void;
  theme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

// Enhanced breakpoint hook with more granular control
function useAdvancedBreakpoint() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const [breakpoint, setBreakpoint] = useState('mobile');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      setOrientation(height > width ? 'portrait' : 'landscape');
      
      // Enhanced breakpoint detection
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else setBreakpoint('xs');

      // Device type detection
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  return { 
    breakpoint, 
    dimensions, 
    orientation, 
    deviceType,
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md'
  };
}

export function EnhancedMobileLayout({
  children,
  showSidebar,
  onToggleSidebar,
  selectedChannel,
  teamMembers,
  channels,
  onChannelSelect,
  onMemberSelect,
  onStartCall,
  getChannelDisplayName,
  getChannelIcon,
  currentChannelName = 'Communication',
  isLoading = false,
  connectionStatus = 'online',
  notifications = [],
  onClearNotification,
  theme = 'system',
  onThemeChange
}: EnhancedMobileLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'unread' | 'priority'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'pinned' | 'favorites' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<'narrow' | 'normal' | 'wide'>('normal');
  
  const { breakpoint, dimensions, orientation, deviceType, isDesktop, isMobile, isTablet } = useAdvancedBreakpoint();

  // Enhanced filtering logic with multiple criteria
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => {
      const matchesSearch = 
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesOnlineFilter = !showOnlineOnly || member.status === 'online';
      
      return matchesSearch && matchesOnlineFilter;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          if (a.last_seen && b.last_seen) {
            return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
          }
          if (a.status === 'online' && b.status !== 'online') return -1;
          if (b.status === 'online' && a.status !== 'online') return 1;
          return a.full_name.localeCompare(b.full_name);
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [teamMembers, searchQuery, showOnlineOnly, sortBy]);

  const filteredChannels = useMemo(() => {
    let filtered = channels.filter(channel => {
      const matchesSearch = 
        getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = (() => {
        switch (filterBy) {
          case 'unread': return (channel.unread_count || 0) > 0;
          case 'pinned': return channel.is_pinned;
          case 'favorites': return channel.is_favorite;
          case 'archived': return channel.is_archived;
          default: return !channel.is_archived;
        }
      })();

      return matchesSearch && matchesFilter;
    });

    // Enhanced sorting with priority
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Priority channels first
          if (a.is_pinned && !b.is_pinned) return -1;
          if (b.is_pinned && !a.is_pinned) return 1;
          
          // Unread channels next
          if (a.unread_count && !b.unread_count) return -1;
          if (b.unread_count && !a.unread_count) return 1;
          
          // Then by last activity
          return (b.last_message_time?.getTime() || b.updated_at?.getTime() || 0) - 
                 (a.last_message_time?.getTime() || a.updated_at?.getTime() || 0);
        case 'name':
          return getChannelDisplayName(a).localeCompare(getChannelDisplayName(b));
        case 'unread':
          return (b.unread_count || 0) - (a.unread_count || 0);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'low'] || 1) - (priorityOrder[a.priority || 'low'] || 1);
        default:
          return 0;
      }
    });

    return filtered;
  }, [channels, searchQuery, filterBy, sortBy, getChannelDisplayName]);

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const onlineCount = teamMembers.filter(m => m.status === 'online').length;

  const getConnectionIcon = useCallback(() => {
    switch (connectionStatus) {
      case 'online': return <Wifi className="h-3 w-3 text-green-500" />;
      case 'offline': return <WifiOff className="h-3 w-3 text-red-500" />;
      case 'connecting': return <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />;
      default: return <Signal className="h-3 w-3 text-gray-500" />;
    }
  }, [connectionStatus]);

  const formatLastActive = useCallback((date?: Date) => {
    if (!date) return '';
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  }, []);

  const getSidebarWidth = () => {
    switch (sidebarWidth) {
      case 'narrow': return 'w-64 xl:w-72';
      case 'wide': return 'w-96 xl:w-[28rem]';
      default: return 'w-80 xl:w-96';
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex h-screen transition-all duration-300",
        "bg-gradient-to-br from-background via-background to-muted/10",
        isMobile && "flex-col"
      )}>
        {/* Enhanced Desktop Sidebar */}
        {isDesktop && (
          <div className={cn(
            "flex flex-col border-r transition-all duration-300",
            "bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm",
            getSidebarWidth()
          )}>
            <EnhancedSidebarContent 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredChannels={filteredChannels}
              filteredMembers={filteredMembers}
              selectedChannel={selectedChannel}
              onChannelSelect={onChannelSelect}
              onMemberSelect={onMemberSelect}
              onStartCall={onStartCall}
              getChannelDisplayName={getChannelDisplayName}
              getChannelIcon={getChannelIcon}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterBy={filterBy}
              setFilterBy={setFilterBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showOnlineOnly={showOnlineOnly}
              setShowOnlineOnly={setShowOnlineOnly}
              onlineCount={onlineCount}
              isDesktop={true}
              deviceType={deviceType}
              formatLastActive={formatLastActive}
              sidebarWidth={sidebarWidth}
              setSidebarWidth={setSidebarWidth}
              theme={theme}
              onThemeChange={onThemeChange}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 relative">
          {/* Enhanced Header */}
          <div className={cn(
            "flex items-center justify-between transition-all duration-200 sticky top-0 z-50",
            "bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl",
            "border-b border-border/50 shadow-sm",
            isMobile ? "p-3" : "p-4"
          )}>
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
              {/* Mobile Menu Button */}
              {!isDesktop && (
                <Sheet open={showSidebar} onOpenChange={onToggleSidebar}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "shrink-0 hover:bg-primary/10 transition-all duration-200",
                        isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                      )}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="left" 
                    className={cn(
                      "p-0 border-r-0",
                      isMobile ? "w-full" : "w-80"
                    )}
                  >
                    <EnhancedSidebarContent 
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filteredChannels={filteredChannels}
                      filteredMembers={filteredMembers}
                      selectedChannel={selectedChannel}
                      onChannelSelect={(channelId) => {
                        onChannelSelect(channelId);
                        onToggleSidebar();
                      }}
                      onMemberSelect={(member) => {
                        onMemberSelect(member);
                        onToggleSidebar();
                      }}
                      onStartCall={(type, member) => {
                        onStartCall(type, member);
                        onToggleSidebar();
                      }}
                      getChannelDisplayName={getChannelDisplayName}
                      getChannelIcon={getChannelIcon}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      filterBy={filterBy}
                      setFilterBy={setFilterBy}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      showOnlineOnly={showOnlineOnly}
                      setShowOnlineOnly={setShowOnlineOnly}
                      onlineCount={onlineCount}
                      isMobile={isMobile}
                      deviceType={deviceType}
                      formatLastActive={formatLastActive}
                      theme={theme}
                      onThemeChange={onThemeChange}
                    />
                  </SheetContent>
                </Sheet>
              )}
              
              {/* Enhanced Channel Info */}
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {currentChannel && (
                  <div className={cn(
                    "bg-primary/10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    isMobile ? "w-7 h-7" : "w-8 h-8"
                  )}>
                    {getChannelIcon(currentChannel)}
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h1 className={cn(
                      "font-semibold truncate",
                      isMobile ? "text-sm" : "text-base md:text-lg"
                    )}>
                      {currentChannelName}
                    </h1>
                    
                    {isLoading && (
                      <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  
                  {selectedChannel && (
                    <div className="flex items-center space-x-1 md:space-x-2 mt-0.5">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "h-4 text-xs",
                          isMobile && "h-3 text-[10px]"
                        )}
                      >
                        {currentChannel?.is_direct_message ? 'DM' : 'Channel'}
                      </Badge>
                      
                      {currentChannel?.is_direct_message && currentChannel.other_user_id && (
                        <PresenceIndicator userId={currentChannel.other_user_id} size="sm" />
                      )}
                      
                      {currentChannel?.participant_count && currentChannel.participant_count > 2 && (
                        <Badge variant="outline" className="text-xs h-4">
                          <Users className="h-2 w-2 mr-1" />
                          {currentChannel.participant_count}
                        </Badge>
                      )}
                      
                      {currentChannel?.priority && currentChannel.priority !== 'medium' && (
                        <Badge 
                          variant={currentChannel.priority === 'urgent' ? 'destructive' : 
                                 currentChannel.priority === 'high' ? 'default' : 'secondary'}
                          className="text-xs h-4"
                        >
                          {currentChannel.priority}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-1 shrink-0">
              {/* Connection Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-muted/50">
                    {getConnectionIcon()}
                    {!isMobile && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {connectionStatus}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Connection: {connectionStatus} • {onlineCount} online
                </TooltipContent>
              </Tooltip>

              {/* Call Actions */}
              {selectedChannel && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200",
                          isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                        )}
                        onClick={() => onStartCall('video')}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start video call</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "hover:bg-green-500/10 hover:text-green-600 transition-all duration-200",
                          isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                        )}
                        onClick={() => onStartCall('audio')}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start audio call</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "relative hover:bg-primary/10 transition-all duration-200",
                      isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          {notifications.length > 9 ? '9+' : notifications.length}
                        </span>
                      </div>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {notifications.length > 0 ? `${notifications.length} notifications` : 'No notifications'}
                </TooltipContent>
              </Tooltip>

              {/* More Options */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "hover:bg-muted/50 transition-all duration-200",
                      isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className={cn(
            "flex-1 overflow-hidden relative transition-all duration-300",
            "bg-gradient-to-br from-background/50 to-muted/20"
          )}>
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}

            {/* Notifications overlay */}
            {notifications.length > 0 && (
              <div className="absolute top-4 right-4 space-y-2 z-20">
                {notifications.slice(0, 3).map((notification) => (
                  <Card key={notification.id} className={cn(
                    "p-3 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl",
                    notification.type === 'error' && "border-l-red-500",
                    notification.type === 'warning' && "border-l-yellow-500",
                    notification.type === 'info' && "border-l-blue-500"
                  )}>
                    <div className="flex items-center justify-between space-x-2">
                      <p className="text-sm">{notification.message}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => onClearNotification?.(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function EnhancedSidebarContent({
  searchQuery,
  setSearchQuery,
  filteredChannels,
  filteredMembers,
  selectedChannel,
  onChannelSelect,
  onMemberSelect,
  onStartCall,
  getChannelDisplayName,
  getChannelIcon,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  viewMode,
  setViewMode,
  showOnlineOnly,
  setShowOnlineOnly,
  onlineCount,
  isMobile = false,
  isDesktop = false,
  deviceType,
  formatLastActive,
  sidebarWidth,
  setSidebarWidth,
  theme,
  onThemeChange
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredChannels: Channel[];
  filteredMembers: TeamMember[];
  selectedChannel?: string | null;
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (member: TeamMember) => void;
  onStartCall: (type: 'audio' | 'video', member?: TeamMember) => void;
  getChannelDisplayName: (channel: Channel) => string;
  getChannelIcon: (channel: Channel) => React.ReactNode;
  sortBy: 'recent' | 'name' | 'unread' | 'priority';
  setSortBy: (sort: 'recent' | 'name' | 'unread' | 'priority') => void;
  filterBy: 'all' | 'unread' | 'pinned' | 'favorites' | 'archived';
  setFilterBy: (filter: 'all' | 'unread' | 'pinned' | 'favorites' | 'archived') => void;
  viewMode: 'list' | 'grid' | 'compact';
  setViewMode: (mode: 'list' | 'grid' | 'compact') => void;
  showOnlineOnly: boolean;
  setShowOnlineOnly: (show: boolean) => void;
  onlineCount: number;
  isMobile?: boolean;
  isDesktop?: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  formatLastActive: (date?: Date) => string;
  sidebarWidth?: 'narrow' | 'normal' | 'wide';
  setSidebarWidth?: (width: 'narrow' | 'normal' | 'wide') => void;
  theme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}) {
  const [activeTab, setActiveTab] = useState('chats');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getStatusIcon = (member: TeamMember) => {
    switch (member.status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'away':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'busy':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const renderChannelItem = (channel: Channel) => (
    <Button
      key={channel.id}
      variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
      className={cn(
        "w-full justify-start h-auto p-3 relative overflow-hidden group transition-all duration-200",
        selectedChannel === channel.id && "bg-primary/10 border-l-2 border-primary shadow-sm",
        viewMode === 'compact' && "p-2 h-12",
        viewMode === 'grid' && "aspect-square flex-col"
      )}
      onClick={() => onChannelSelect(channel.id)}
    >
      <div className={cn(
        "flex items-center w-full",
        viewMode === 'grid' ? "flex-col space-y-2" : "space-x-3"
      )}>
        {/* Channel Icon */}
        <div className={cn(
          "rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
          selectedChannel === channel.id 
            ? "bg-primary/20 text-primary" 
            : "bg-muted/60 group-hover:bg-primary/10",
          viewMode === 'compact' ? "w-8 h-8" : "w-10 h-10"
        )}>
          {getChannelIcon(channel)}
        </div>
        
        <div className={cn(
          "text-left min-w-0",
          viewMode === 'grid' ? "text-center" : "flex-1"
        )}>
          <div className="flex items-center justify-between">
            <p className={cn(
              "font-medium truncate",
              viewMode === 'compact' ? "text-xs" : "text-sm"
            )}>
              {getChannelDisplayName(channel)}
            </p>
            
            {viewMode !== 'grid' && (
              <div className="flex items-center space-x-1 shrink-0">
                {channel.is_pinned && (
                  <Pin className="h-3 w-3 text-blue-500" />
                )}
                {channel.is_favorite && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
                {channel.is_muted && (
                  <VolumeX className="h-3 w-3 text-gray-500" />
                )}
                {channel.unread_count && channel.unread_count > 0 && (
                  <Badge variant="destructive" className="h-4 min-w-4 text-xs px-1 animate-pulse">
                    {channel.unread_count > 99 ? '99+' : channel.unread_count}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {viewMode !== 'compact' && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground truncate flex-1">
                {channel.is_direct_message 
                  ? 'Direct message' 
                  : channel.description || `${channel.participant_count || 0} members`
                }
              </p>
              {channel.last_message_time && (
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {formatLastActive(channel.last_message_time)}
                </span>
              )}
            </div>
          )}

          {/* Priority indicator */}
          {channel.priority && channel.priority !== 'medium' && (
            <div className="mt-1">
              <Badge 
                variant={channel.priority === 'urgent' ? 'destructive' : 
                       channel.priority === 'high' ? 'default' : 'secondary'}
                className="text-xs h-4"
              >
                {channel.priority}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              // Toggle pin
            }}
          >
            {channel.is_pinned ? 
              <PinOff className="h-3 w-3" /> : 
              <Pin className="h-3 w-3" />
            }
          </Button>
        </div>
      </div>
    </Button>
  );

  const renderMemberItem = (member: TeamMember) => (
    <div 
      key={member.id} 
      className={cn(
        "rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50 group cursor-pointer",
        viewMode === 'compact' ? "p-2" : "p-3",
        viewMode === 'grid' && "aspect-square flex flex-col items-center justify-center text-center"
      )}
      onClick={() => onMemberSelect(member)}
    >
      <div className={cn(
        "flex items-center",
        viewMode === 'grid' ? "flex-col space-y-2" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center min-w-0",
          viewMode === 'grid' ? "flex-col space-y-2" : "space-x-3 flex-1"
        )}>
          <div className="relative shrink-0">
            <Avatar className={cn(
              "ring-2 ring-background transition-all duration-200",
              member.status === 'online' ? "ring-green-500/20" : "ring-muted/20",
              viewMode === 'compact' ? "h-8 w-8" : "h-10 w-10"
            )}>
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                {member.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5">
              {getStatusIcon(member)}
            </div>
          </div>
          
          <div className={cn(
            "min-w-0",
            viewMode === 'grid' ? "text-center" : "flex-1"
          )}>
            <div className="flex items-center justify-between">
              <p className={cn(
                "font-medium truncate",
                member.status === 'online' ? "text-foreground" : "text-muted-foreground",
                viewMode === 'compact' ? "text-xs" : "text-sm"
              )}>
                {member.full_name}
              </p>
              
              {member.is_favorite && (
                <Star className="h-3 w-3 text-yellow-500 fill-current ml-2" />
              )}
            </div>
            
            {viewMode !== 'compact' && (
              <div className="flex flex-col space-y-1 mt-1">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs h-4 bg-background/60"
                  >
                    {member.role}
                  </Badge>
                  {member.department && (
                    <span className="text-xs text-muted-foreground truncate">
                      {member.department}
                    </span>
                  )}
                </div>
                
                {member.last_seen && member.status !== 'online' && (
                  <span className="text-xs text-muted-foreground">
                    Last seen {formatLastActive(member.last_seen)}
                  </span>
                )}
                
                {member.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-2 w-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {member.location}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        {viewMode !== 'grid' && (
          <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-green-100 hover:text-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCall('video', member);
                  }}
                >
                  <Video className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCall('audio', member);
                  }}
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
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMemberSelect(member);
                  }}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card/90 via-card/80 to-card/70 backdrop-blur-lg">
      {/* Enhanced Header */}
      <div className={cn(
        "border-b bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-md",
        isMobile ? "p-3" : "p-4 md:p-6"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className={cn(
              "font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent",
              isMobile ? "text-base" : "text-lg md:text-xl"
            )}>
              Communication Hub
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {onlineCount} online • {filteredChannels.length + filteredMembers.length} total
              </p>
              <Badge variant="secondary" className="text-xs h-4">
                {deviceType}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New conversation</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-muted/80"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            
            {/* Theme Toggle */}
            {onThemeChange && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-muted/80"
                    onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle theme</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-4 bg-muted/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Sidebar Width Control (Desktop only) */}
              {isDesktop && setSidebarWidth && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Sidebar Width</label>
                  <Select value={sidebarWidth} onValueChange={setSidebarWidth}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="narrow">Narrow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Theme Control */}
              {onThemeChange && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Theme</label>
                  <Select value={theme} onValueChange={onThemeChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Search */}
      <div className="p-3 border-b">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 pr-10 bg-background/60 border-muted-foreground/20 focus:border-primary/50 transition-all duration-200",
                isMobile ? "h-9 text-sm" : "h-10"
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-7 text-xs hover:bg-muted/80"
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
              {showAdvancedFilters ? 
                <ChevronUp className="h-3 w-3 ml-1" /> : 
                <ChevronDown className="h-3 w-3 ml-1" />
              }
            </Button>

            <div className="flex items-center space-x-1">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted/50 rounded p-0.5">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-6 w-6 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-6 w-6 p-0"
                >
                  <Grid3X3 className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <Card className="p-3 bg-muted/30 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Filter</label>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="pinned">Pinned</SelectItem>
                        <SelectItem value="favorites">Favorites</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Online Only</label>
                  <Switch
                    checked={showOnlineOnly}
                    onCheckedChange={setShowOnlineOnly}
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className={cn(
            "grid w-full grid-cols-2 m-3 mb-2 bg-muted/60 backdrop-blur-sm",
            isMobile && "m-2 mb-1"
          )}>
            <TabsTrigger 
              value="chats" 
              className="text-xs data-[state=active]:bg-background/80 transition-all duration-200"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Chats</span>
              <Badge variant="secondary" className="ml-1 h-3 text-[10px] px-1">
                {filteredChannels.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="team" 
              className="text-xs data-[state=active]:bg-background/80 transition-all duration-200"
            >
              <Users className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Team</span>
              <Badge variant="secondary" className="ml-1 h-3 text-[10px] px-1">
                {filteredMembers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100%-3rem)]">
            <TabsContent value="chats" className="m-0">
              <div className={cn(
                "space-y-1",
                isMobile ? "px-2 pb-2" : "px-3 pb-3",
                viewMode === 'grid' && "grid grid-cols-2 gap-2 space-y-0"
              )}>
                {filteredChannels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={cn(
                      "mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4",
                      isMobile ? "w-12 h-12" : "w-16 h-16"
                    )}>
                      <MessageSquare className={cn(
                        "text-muted-foreground",
                        isMobile ? "h-6 w-6" : "h-8 w-8"
                      )} />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {searchQuery ? 'No channels found' : 'No channels yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery ? 'Try adjusting your search' : 'Start a conversation with your team'}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" className="mt-3 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Create Channel
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredChannels.map(renderChannelItem)
                )}
              </div>
            </TabsContent>

            <TabsContent value="team" className="m-0">
              <div className={cn(
                "space-y-1",
                isMobile ? "px-2 pb-2" : "px-3 pb-3",
                viewMode === 'grid' && "grid grid-cols-2 gap-2 space-y-0"
              )}>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={cn(
                      "mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4",
                      isMobile ? "w-12 h-12" : "w-16 h-16"
                    )}>
                      <Users className={cn(
                        "text-muted-foreground",
                        isMobile ? "h-6 w-6" : "h-8 w-8"
                      )} />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {searchQuery ? 'No team members found' : 'No team members yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery ? 'Try adjusting your search' : 'Invite members to get started'}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" className="mt-3 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Invite Members
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredMembers.map(renderMemberItem)
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
