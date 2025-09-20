import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Menu, 
  MessageSquare, 
  Users, 
  Phone, 
  Video, 
  ArrowLeft,
  MoreVertical,
  Search,
  X,
  Settings,
  Bell,
  BellOff,
  Star,
  StarOff,
  Pin,
  PinOff,
  Archive,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Smartphone,
  Tablet,
  Monitor,
  Sun,
  Moon,
  Palette,
  Zap,
  Activity,
  Clock,
  MapPin,
  Globe,
  Shield,
  Crown,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Copy,
  Link2,
  ExternalLink,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  Bookmark,
  Calendar,
  FileText,
  Image,
  Headphones,
  Mic,
  Camera,
  Paperclip,
  Send,
  Edit3,
  Trash2,
  RotateCcw,
  Forward,
  Reply,
  Heart,
  ThumbsUp,
  Smile
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen?: Date;
  is_favorite?: boolean;
  location?: string;
  timezone?: string;
  title?: string;
  bio?: string;
  skills?: string[];
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct' | 'group';
  description?: string;
  participant_count?: number;
  unread_count?: number;
  last_message?: string;
  last_message_time?: Date;
  last_message_sender?: string;
  is_muted?: boolean;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_favorite?: boolean;
  avatar_url?: string;
  tags?: string[];
  created_at?: Date;
  updated_at?: Date;
}

interface NotificationSettings {
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
  priority: 'all' | 'mentions' | 'none';
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showOnlineStatus: boolean;
  autoDownload: boolean;
  notifications: NotificationSettings;
}

interface MobileLayoutProps {
  children: React.ReactNode;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  selectedChannel?: string | null;
  teamMembers: Member[];
  channels: Channel[];
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (member: Member) => void;
  onStartCall: (type: 'audio' | 'video', member?: Member) => void;
  onCreateChannel?: () => void;
  onCreateGroup?: () => void;
  onInviteMembers?: () => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  currentUser?: Member;
  connectionStatus?: 'online' | 'offline' | 'connecting';
  unreadCount?: number;
  enableAdvancedFeatures?: boolean;
  enableCustomization?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  showSidebar,
  onToggleSidebar,
  selectedChannel,
  teamMembers,
  channels,
  onChannelSelect,
  onMemberSelect,
  onStartCall,
  onCreateChannel,
  onCreateGroup,
  onInviteMembers,
  onSettings,
  onNotifications,
  currentUser,
  connectionStatus = 'online',
  unreadCount = 0,
  enableAdvancedFeatures = true,
  enableCustomization = true,
  className
}: MobileLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'members' | 'favorites' | 'archived'>('chats');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'unread' | 'alphabetical'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'pinned' | 'groups' | 'direct'>('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    language: 'en',
    fontSize: 'medium',
    compactMode: false,
    showOnlineStatus: true,
    autoDownload: false,
    notifications: {
      sound: true,
      vibration: true,
      showPreview: true,
      quietHours: { enabled: false, start: '22:00', end: '08:00' },
      priority: 'all'
    }
  });

  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced filtering with multiple criteria
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => {
      const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
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
        case 'alphabetical':
          return a.full_name.localeCompare(b.full_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [teamMembers, searchQuery, showOnlineOnly, sortBy]);

  const filteredChannels = useMemo(() => {
    let filtered = channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           channel.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = (() => {
        switch (filterBy) {
          case 'unread': return (channel.unread_count || 0) > 0;
          case 'pinned': return channel.is_pinned;
          case 'groups': return channel.type === 'group' || channel.type === 'public';
          case 'direct': return channel.type === 'direct';
          default: return !channel.is_archived;
        }
      })();

      return matchesSearch && matchesFilter;
    });

    // Enhanced sorting with priority
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
          return (b.last_message_time?.getTime() || b.updated_at?.getTime() || 0) - 
                 (a.last_message_time?.getTime() || a.updated_at?.getTime() || 0);
        case 'name':
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'unread':
          return (b.unread_count || 0) - (a.unread_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [channels, searchQuery, filterBy, sortBy]);

  // Get current channel info
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const channelTitle = currentChannel ? 
    (currentChannel.type === 'direct' ? currentChannel.name : `#${currentChannel.name}`) :
    'Communication';

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
      toast({
        title: "Updated",
        description: "Conversations refreshed",
      });
    }, 1500);
  }, [toast]);

  // Status indicator component
  const StatusIndicator = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'online': return 'bg-green-500';
        case 'away': return 'bg-yellow-500';
        case 'busy': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    };

    return (
      <div className={cn("w-2.5 h-2.5 rounded-full border border-background", getStatusColor())} />
    );
  };

  // Connection status component
  const ConnectionStatus = () => {
    const getIcon = () => {
      switch (connectionStatus) {
        case 'online': return <Wifi className="h-3 w-3 text-green-500" />;
        case 'offline': return <WifiOff className="h-3 w-3 text-red-500" />;
        case 'connecting': return <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />;
        default: return <Signal className="h-3 w-3 text-gray-500" />;
      }
    };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-muted/50">
            {getIcon()}
            <span className="text-xs text-muted-foreground capitalize hidden sm:block">
              {connectionStatus}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Connection: {connectionStatus}</TooltipContent>
      </Tooltip>
    );
  };

  // Enhanced member card component
  const MemberCard = ({ member }: { member: Member }) => (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-sm cursor-pointer",
      viewMode === 'compact' && "p-2",
      member.is_favorite && "ring-1 ring-yellow-200"
    )}>
      <CardContent className={cn("p-3", viewMode === 'compact' && "p-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className={cn(viewMode === 'compact' ? "h-8 w-8" : "h-10 w-10")}>
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="font-medium">
                  {member.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {settings.showOnlineStatus && (
                <div className="absolute -bottom-0.5 -right-0.5">
                  <StatusIndicator status={member.status} />
                </div>
              )}
              {member.is_favorite && (
                <div className="absolute -top-1 -right-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className={cn(
                  "truncate font-medium",
                  viewMode === 'compact' ? "text-xs" : "text-sm"
                )}>
                  {member.full_name}
                </p>
                {member.title && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {member.title}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {member.role}
                </p>
                {member.department && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.department}
                    </p>
                  </>
                )}
              </div>

              {viewMode !== 'compact' && member.last_seen && member.status !== 'online' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last seen {formatDistanceToNow(member.last_seen, { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          
          {viewMode !== 'compact' && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-green-100 hover:text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartCall('video', member);
                        onToggleSidebar();
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
                        onToggleSidebar();
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
                        onToggleSidebar();
                      }}
                    >
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced channel card component
  const ChannelCard = ({ channel }: { channel: Channel }) => {
    const isSelected = selectedChannel === channel.id;
    const hasUnread = (channel.unread_count || 0) > 0;

    return (
      <Button
        variant={isSelected ? 'secondary' : 'ghost'}
        className={cn(
          "w-full justify-start h-auto p-3 relative overflow-hidden group transition-all duration-200",
          isSelected && "bg-primary/10 border-l-2 border-primary shadow-sm",
          viewMode === 'compact' && "p-2",
          hasUnread && !isSelected && "bg-blue-50/50"
        )}
        onClick={() => {
          onChannelSelect(channel.id);
          onToggleSidebar();
        }}
      >
        <div className="flex items-center space-x-3 w-full">
          {/* Channel Avatar/Icon */}
          <div className="relative">
            {channel.avatar_url ? (
              <Avatar className={cn(viewMode === 'compact' ? "h-8 w-8" : "h-10 w-10")}>
                <AvatarImage src={channel.avatar_url} />
                <AvatarFallback>{channel.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className={cn(
                "rounded-full flex items-center justify-center transition-all duration-200",
                isSelected 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted/60 group-hover:bg-primary/10",
                viewMode === 'compact' ? "w-8 h-8" : "w-10 h-10"
              )}>
                {channel.type === 'direct' ? (
                  <User className="h-4 w-4" />
                ) : channel.type === 'private' ? (
                  <Shield className="h-4 w-4" />
                ) : (
                  <Hash className="h-4 w-4" />
                )}
              </div>
            )}
            
            {/* Status indicators */}
            <div className="absolute -top-1 -right-1 flex space-x-1">
              {channel.is_pinned && <Pin className="h-2 w-2 text-blue-500" />}
              {channel.is_favorite && <Star className="h-2 w-2 text-yellow-500 fill-current" />}
              {channel.is_muted && <VolumeX className="h-2 w-2 text-gray-500" />}
            </div>
          </div>
          
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between">
              <p className={cn(
                "truncate font-medium",
                hasUnread && "font-semibold",
                viewMode === 'compact' ? "text-xs" : "text-sm"
              )}>
                {channel.type === 'direct' ? channel.name : `#${channel.name}`}
              </p>
              
              {channel.last_message_time && (
                <span className={cn(
                  "text-muted-foreground ml-2 shrink-0",
                  viewMode === 'compact' ? "text-[10px]" : "text-xs"
                )}>
                  {isToday(channel.last_message_time) 
                    ? format(channel.last_message_time, 'HH:mm')
                    : isYesterday(channel.last_message_time)
                    ? 'Yesterday'
                    : format(channel.last_message_time, 'MMM d')
                  }
                </span>
              )}
            </div>
            
            {viewMode !== 'compact' && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground truncate flex-1">
                  {channel.last_message || 
                   (channel.type === 'direct' ? 'Direct message' : 
                    channel.description || `${channel.participant_count || 0} members`)}
                </p>
                
                {hasUnread && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-4 min-w-4 text-xs px-1 animate-pulse shrink-0"
                  >
                    {channel.unread_count! > 99 ? '99+' : channel.unread_count}
                  </Badge>
                )}
              </div>
            )}

            {/* Tags */}
            {viewMode === 'list' && channel.tags && channel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {channel.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] h-3 px-1">
                    {tag}
                  </Badge>
                ))}
                {channel.tags.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] h-3 px-1">
                    +{channel.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Button>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-screen bg-background", className)}>
        {/* Enhanced Mobile Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-card/95 to-muted/30 backdrop-blur-lg lg:hidden sticky top-0 z-50">
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <Sheet open={showSidebar} onOpenChange={onToggleSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-80 p-0 border-r-0">
                <div className="flex flex-col h-full bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-sm">
                  {/* Enhanced Mobile Sidebar Header */}
                  <SheetHeader className="p-4 border-b bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <SheetTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          Communication Hub
                        </SheetTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <ConnectionStatus />
                          <span className="text-xs text-muted-foreground">
                            {teamMembers.filter(m => m.status === 'online').length} online
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {/* Quick actions */}
                        <Dialog open={showQuickActions} onOpenChange={setShowQuickActions}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Quick Actions</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3 py-4">
                              <Button
                                variant="outline"
                                className="h-auto flex flex-col items-center p-4 space-y-2"
                                onClick={() => {
                                  onCreateChannel?.();
                                  setShowQuickActions(false);
                                }}
                              >
                                <Hash className="h-6 w-6" />
                                <span className="text-sm">New Channel</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="h-auto flex flex-col items-center p-4 space-y-2"
                                onClick={() => {
                                  onCreateGroup?.();
                                  setShowQuickActions(false);
                                }}
                              >
                                <Users className="h-6 w-6" />
                                <span className="text-sm">New Group</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="h-auto flex flex-col items-center p-4 space-y-2"
                                onClick={() => {
                                  onInviteMembers?.();
                                  setShowQuickActions(false);
                                }}
                              >
                                <Send className="h-6 w-6" />
                                <span className="text-sm">Invite</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="h-auto flex flex-col items-center p-4 space-y-2"
                                onClick={() => {
                                  handleRefresh();
                                  setShowQuickActions(false);
                                }}
                              >
                                <RefreshCw className={cn("h-6 w-6", isRefreshing && "animate-spin")} />
                                <span className="text-sm">Refresh</span>
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {enableCustomization && (
                          <Dialog open={showSettings} onOpenChange={setShowSettings}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Settings</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Show Online Status</label>
                                    <Switch
                                      checked={settings.showOnlineStatus}
                                      onCheckedChange={(checked) =>
                                        setSettings(prev => ({ ...prev, showOnlineStatus: checked }))
                                      }
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Compact Mode</label>
                                    <Switch
                                      checked={settings.compactMode}
                                      onCheckedChange={(checked) =>
                                        setSettings(prev => ({ ...prev, compactMode: checked }))
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Theme</label>
                                    <Select 
                                      value={settings.theme} 
                                      onValueChange={(value: any) =>
                                        setSettings(prev => ({ ...prev, theme: value }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Font Size</label>
                                    <Select 
                                      value={settings.fontSize} 
                                      onValueChange={(value: any) =>
                                        setSettings(prev => ({ ...prev, fontSize: value }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="small">Small</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="large">Large</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </SheetHeader>

                  {/* Enhanced Search */}
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search conversations, people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-10 bg-background/60 border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
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

                    {/* Enhanced Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-1">
                        {/* View Mode */}
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

                        {/* Filter */}
                        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                          <SelectTrigger className="w-20 h-6 text-xs">
                            <Filter className="h-3 w-3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="pinned">Pinned</SelectItem>
                            <SelectItem value="groups">Groups</SelectItem>
                            <SelectItem value="direct">Direct</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-1">
                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SortAsc className="h-3 w-3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent">Recent</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="alphabetical">A-Z</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Refresh */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Tabs */}
                  <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-4 m-3 mb-2 bg-muted/60 backdrop-blur-sm">
                      <TabsTrigger value="chats" className="text-xs data-[state=active]:bg-background/80">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Chats</span>
                        <Badge variant="secondary" className="ml-1 h-3 text-[10px] px-1">
                          {filteredChannels.length}
                        </Badge>
                      </TabsTrigger>
                      
                      <TabsTrigger value="members" className="text-xs data-[state=active]:bg-background/80">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Team</span>
                        <Badge variant="secondary" className="ml-1 h-3 text-[10px] px-1">
                          {filteredMembers.length}
                        </Badge>
                      </TabsTrigger>
                      
                      <TabsTrigger value="favorites" className="text-xs data-[state=active]:bg-background/80">
                        <Star className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Starred</span>
                      </TabsTrigger>
                      
                      <TabsTrigger value="archived" className="text-xs data-[state=active]:bg-background/80">
                        <Archive className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Archive</span>
                      </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1">
                      <TabsContent value="chats" className="m-0">
                        <div className={cn(
                          "p-3 space-y-2",
                          viewMode === 'grid' && "grid grid-cols-2 gap-2 space-y-0"
                        )}>
                          {filteredChannels.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">
                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {searchQuery ? 'Try adjusting your search' : 'Start chatting with your team'}
                              </p>
                              {!searchQuery && (
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => onCreateChannel?.()}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  New Chat
                                </Button>
                              )}
                            </div>
                          ) : (
                            filteredChannels.map((channel) => (
                              <ChannelCard key={channel.id} channel={channel} />
                            ))
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="members" className="m-0">
                        <div className="p-3">
                          {/* Online filter toggle */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={showOnlineOnly}
                                onCheckedChange={setShowOnlineOnly}
                                size="sm"
                              />
                              <span className="text-xs text-muted-foreground">Online only</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teamMembers.filter(m => m.status === 'online').length} online
                            </div>
                          </div>

                          <div className={cn(
                            "space-y-2 group",
                            viewMode === 'grid' && "grid grid-cols-2 gap-2 space-y-0"
                          )}>
                            {filteredMembers.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                  <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {searchQuery ? 'No team members found' : 'No team members yet'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {searchQuery ? 'Try adjusting your search' : 'Invite members to get started'}
                                </p>
                                {!searchQuery && (
                                  <Button variant="outline" size="sm" className="mt-3" onClick={() => onInviteMembers?.()}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Invite Members
                                  </Button>
                                )}
                              </div>
                            ) : (
                              filteredMembers.map((member) => (
                                <div 
                                  key={member.id} 
                                  onClick={() => {
                                    onMemberSelect(member);
                                    onToggleSidebar();
                                  }}
                                >
                                  <MemberCard member={member} />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="favorites" className="m-0">
                        <div className="p-3 space-y-2">
                          {channels.filter(c => c.is_favorite).length === 0 ? (
                            <div className="text-center py-12">
                              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-sm text-muted-foreground">No starred conversations</p>
                            </div>
                          ) : (
                            channels
                              .filter(c => c.is_favorite)
                              .map((channel) => <ChannelCard key={channel.id} channel={channel} />)
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="archived" className="m-0">
                        <div className="p-3 space-y-2">
                          {channels.filter(c => c.is_archived).length === 0 ? (
                            <div className="text-center py-12">
                              <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-sm text-muted-foreground">No archived conversations</p>
                            </div>
                          ) : (
                            channels
                              .filter(c => c.is_archived)
                              .map((channel) => <ChannelCard key={channel.id} channel={channel} />)
                          )}
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Enhanced Channel Title */}
            <div className="flex items-center space-x-2 min-w-0">
              {currentChannel && (
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  {currentChannel.type === 'direct' ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : currentChannel.type === 'private' ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <Hash className="h-4 w-4 text-primary" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-semibold truncate">
                  {channelTitle}
                </h1>
                {currentChannel && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs h-4">
                      {currentChannel.type === 'direct' ? 'DM' : 'Channel'}
                    </Badge>
                    {currentChannel.participant_count && currentChannel.participant_count > 1 && (
                      <span className="text-xs text-muted-foreground">
                        {currentChannel.participant_count} members
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 relative"
              onClick={onNotifications}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </Button>

            {/* More Options */}
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop/Mobile Content */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>

        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs z-50">
            <RefreshCw className="h-3 w-3 inline mr-1 animate-spin" />
            Refreshing...
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
