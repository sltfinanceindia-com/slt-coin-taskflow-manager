import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Clock,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Coffee,
  Moon,
  Sun,
  Zap,
  Focus,
  Heart,
  Briefcase,
  Home,
  Car,
  Plane,
  Gamepad2,
  Music,
  Book,
  Camera,
  Palette,
  Settings,
  Edit3,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneCall,
  MessageSquare,
  UserPlus,
  UserMinus,
  Star,
  Crown,
  Shield,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Building,
  GraduationCap,
  Stethoscope,
  Code,
  Wrench,
  Paintbrush,
  Calculator,
  Scale,
  Lightbulb,
  Target,
  Rocket,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/usePresence';
import { format, formatDistanceToNow, isToday, parseISO, addMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ExtendedStatusOption {
  value: string;
  label: string;
  color: string;
  bgColor: string;
  description: string;
  icon: React.ReactNode;
  category: 'availability' | 'activity' | 'mood' | 'location';
  priority: number;
  allowMessage?: boolean;
  allowCalls?: boolean;
  autoExpiry?: boolean;
  defaultDuration?: number; // in minutes
}

interface CustomStatus {
  id: string;
  emoji: string;
  text: string;
  expiresAt?: Date;
  color: string;
}

interface PresenceSchedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  recurring: boolean;
  daysOfWeek?: number[];
}

interface PresenceIndicatorProps {
  userId: string;
  showText?: boolean;
  showAvatar?: boolean;
  showLastSeen?: boolean;
  showSchedule?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dot' | 'badge' | 'full' | 'minimal' | 'card';
  className?: string;
  interactive?: boolean;
  realTime?: boolean;
  showAdvancedOptions?: boolean;
  allowCustomStatus?: boolean;
  allowScheduling?: boolean;
  showAnalytics?: boolean;
  enableAnimations?: boolean;
  onStatusChange?: (status: string) => void;
  onPresenceClick?: (userId: string) => void;
}

const enhancedStatusOptions: ExtendedStatusOption[] = [
  {
    value: 'Available',
    label: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-500',
    description: 'Ready to collaborate and respond',
    icon: <Check className="h-3 w-3" />,
    category: 'availability',
    priority: 1,
    allowMessage: true,
    allowCalls: true,
  },
  {
    value: 'Busy',
    label: 'Busy',
    color: 'text-red-700',
    bgColor: 'bg-red-500',
    description: 'Do not disturb - urgent only',
    icon: <X className="h-3 w-3" />,
    category: 'availability',
    priority: 2,
    allowMessage: false,
    allowCalls: false,
    autoExpiry: true,
    defaultDuration: 120,
  },
  {
    value: 'Away',
    label: 'Away',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-500',
    description: 'Stepped away, will return soon',
    icon: <Clock className="h-3 w-3" />,
    category: 'availability',
    priority: 3,
    allowMessage: true,
    allowCalls: false,
    autoExpiry: true,
    defaultDuration: 60,
  },
  {
    value: 'In a meeting',
    label: 'In a meeting',
    color: 'text-purple-700',
    bgColor: 'bg-purple-500',
    description: 'Currently in a meeting',
    icon: <Users className="h-3 w-3" />,
    category: 'activity',
    priority: 2,
    allowMessage: false,
    allowCalls: false,
    autoExpiry: true,
    defaultDuration: 60,
  },
  {
    value: 'Focusing',
    label: 'Focusing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-500',
    description: 'Deep work mode - minimize interruptions',
    icon: <Focus className="h-3 w-3" />,
    category: 'activity',
    priority: 2,
    allowMessage: false,
    allowCalls: false,
    autoExpiry: true,
    defaultDuration: 90,
  },
  {
    value: 'On a call',
    label: 'On a call',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-500',
    description: 'Currently on a phone call',
    icon: <PhoneCall className="h-3 w-3" />,
    category: 'activity',
    priority: 2,
    allowMessage: false,
    allowCalls: false,
    autoExpiry: true,
    defaultDuration: 30,
  },
  {
    value: 'Working remotely',
    label: 'Working remotely',
    color: 'text-teal-700',
    bgColor: 'bg-teal-500',
    description: 'Working from home or remote location',
    icon: <Home className="h-3 w-3" />,
    category: 'location',
    priority: 4,
    allowMessage: true,
    allowCalls: true,
  },
  {
    value: 'On vacation',
    label: 'On vacation',
    color: 'text-orange-700',
    bgColor: 'bg-orange-500',
    description: 'Out of office - enjoying time off',
    icon: <Plane className="h-3 w-3" />,
    category: 'location',
    priority: 5,
    allowMessage: false,
    allowCalls: false,
  },
  {
    value: 'Sick',
    label: 'Sick',
    color: 'text-red-700',
    bgColor: 'bg-red-400',
    description: 'Not feeling well',
    icon: <Heart className="h-3 w-3" />,
    category: 'availability',
    priority: 5,
    allowMessage: false,
    allowCalls: false,
  },
  {
    value: 'Appear offline',
    label: 'Appear offline',
    color: 'text-gray-700',
    bgColor: 'bg-gray-400',
    description: 'Invisible to others',
    icon: <EyeOff className="h-3 w-3" />,
    category: 'availability',
    priority: 6,
    allowMessage: false,
    allowCalls: false,
  }
];

const moodEmojis = ['😊', '😎', '🤔', '😴', '🚀', '💪', '🎯', '☕', '🎵', '📚', '🏠', '✈️', '🎮', '💻'];

export function PresenceIndicator({ 
  userId, 
  showText = false, 
  showAvatar = false,
  showLastSeen = false,
  showSchedule = false,
  size = 'md',
  variant = 'dot',
  className,
  interactive = false,
  realTime = true,
  showAdvancedOptions = false,
  allowCustomStatus = true,
  allowScheduling = false,
  showAnalytics = false,
  enableAnimations = true,
  onStatusChange,
  onPresenceClick
}: PresenceIndicatorProps) {
  const { 
    getUserPresence, 
    getStatusBadgeColor, 
    getStatusText, 
    setUserStatus
  } = usePresence();
  
  const [isEditing, setIsEditing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  const [schedules, setSchedules] = useState<PresenceSchedule[]>([]);
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [notifications, setNotifications] = useState({
    mentions: true,
    directMessages: true,
    calls: false,
    meetings: true
  });
  
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const presence = getUserPresence(userId);
  const isCurrentUser = userId === 'current-user'; // Replace with actual current user check
  
  const sizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5'
  };

  const avatarSizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Real-time presence updates
  useEffect(() => {
    if (realTime) {
      intervalRef.current = setInterval(() => {
        // Fetch latest presence data
        // This would be replaced with actual WebSocket or polling logic
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTime]);

  const handleStatusChange = async (status: string, customOptions?: { 
    message?: string; 
    emoji?: string; 
    expiryTime?: Date 
  }) => {
    try {
      if (customOptions) {
        await setCustomStatus(status, customOptions.message, customOptions.emoji, customOptions.expiryTime);
      } else {
        await setUserStatus(status);
      }
      
      onStatusChange?.(status);
      setShowStatusPicker(false);
      
      toast({
        title: "Status Updated",
        description: `Your status is now: ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const scheduleStatusChange = async (scheduleData: PresenceSchedule) => {
    try {
      await scheduleStatus(scheduleData);
      setSchedules(prev => [...prev, scheduleData]);
      toast({
        title: "Status Scheduled",
        description: `Status will change to "${scheduleData.status}" at ${scheduleData.startTime}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule status change.",
        variant: "destructive"
      });
    }
  };

  const getStatusOption = (statusValue: string) => {
    return enhancedStatusOptions.find(option => option.value === statusValue);
  };

  const getPresenceAnalytics = () => {
    if (!showAnalytics || !isCurrentUser) return null;
    
    const analytics = getUserAnalytics(userId);
    return analytics;
  };

  const renderStatusDot = () => {
    const statusOption = getStatusOption(presence?.status || 'Offline');
    const isOnline = presence?.status !== 'Offline' && presence?.status !== 'Appear offline';
    
    return (
      <div className="relative">
        <div className={cn(
          "rounded-full border-2 border-background transition-all duration-300",
          statusOption ? statusOption.bgColor : 'bg-gray-400',
          sizeClasses[size],
          enableAnimations && isOnline && 'animate-pulse',
          interactive && 'hover:scale-110 cursor-pointer'
        )} />
        
        {/* Activity indicator */}
        {enableAnimations && isOnline && (
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping",
            statusOption?.color
          )} />
        )}
        
        {/* Custom emoji overlay */}
        {presence?.emoji && (
          <div className="absolute -top-1 -right-1 text-xs">
            {presence.emoji}
          </div>
        )}
      </div>
    );
  };

  const renderBadge = () => {
    const statusOption = getStatusOption(presence?.status || 'Offline');
    
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "flex items-center gap-1 transition-all duration-200",
          statusOption?.color,
          interactive && 'hover:scale-105 cursor-pointer'
        )}
      >
        <div className={cn("w-2 h-2 rounded-full", statusOption?.bgColor)} />
        <span className={textSizeClasses[size]}>{statusOption?.label}</span>
        {presence?.emoji && <span>{presence.emoji}</span>}
      </Badge>
    );
  };

  const renderFullStatus = () => {
    const statusOption = getStatusOption(presence?.status || 'Offline');
    
    return (
      <div className={cn("flex items-center gap-2", interactive && 'cursor-pointer')}>
        {showAvatar && presence?.profile && (
          <div className="relative">
            <Avatar className={avatarSizeClasses[size]}>
              <AvatarImage src={presence.profile.avatar_url} />
              <AvatarFallback className="text-xs">
                {presence.profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5">
              {renderStatusDot()}
            </div>
          </div>
        )}
        
        {!showAvatar && renderStatusDot()}
        
        <div className="flex flex-col">
          {showText && (
            <span className={cn("font-medium", textSizeClasses[size])}>
              {presence?.profile?.full_name || 'Unknown User'}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            {statusOption?.icon}
            <span className={cn("text-muted-foreground", textSizeClasses[size])}>
              {statusOption?.label}
            </span>
            {presence?.emoji && <span>{presence.emoji}</span>}
          </div>
          
          {presence?.status_message && (
            <span className={cn("text-muted-foreground italic", textSizeClasses[size])}>
              "{presence.status_message}"
            </span>
          )}
          
          {showLastSeen && presence?.last_seen && (
            <span className={cn("text-muted-foreground", textSizeClasses[size])}>
              {formatDistanceToNow(presence.last_seen, { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderCard = () => {
    const statusOption = getStatusOption(presence?.status || 'Offline');
    const analytics = getPresenceAnalytics();
    
    return (
      <Card className={cn("p-4 transition-all duration-200", interactive && 'hover:shadow-md cursor-pointer')}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {presence?.profile && (
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={presence.profile.avatar_url} />
                    <AvatarFallback>
                      {presence.profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    {renderStatusDot()}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold">
                  {presence?.profile?.full_name || 'Unknown User'}
                </h4>
                <div className="flex items-center gap-2">
                  {statusOption?.icon}
                  <span className="text-sm text-muted-foreground">
                    {statusOption?.label}
                  </span>
                  {presence?.emoji && <span>{presence.emoji}</span>}
                </div>
              </div>
            </div>
            
            {showAnalytics && analytics && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Today</div>
                <div className="text-sm font-medium">
                  {analytics.hoursActive}h active
                </div>
              </div>
            )}
          </div>
          
          {presence?.status_message && (
            <p className="text-sm text-muted-foreground mb-2">
              "{presence.status_message}"
            </p>
          )}
          
          {presence?.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{presence.location}</span>
            </div>
          )}
          
          {showLastSeen && presence?.last_seen && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last seen {formatDistanceToNow(presence.last_seen, { addSuffix: true })}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStatusPicker = () => {
    const categorizedOptions = enhancedStatusOptions.reduce((acc, option) => {
      if (!acc[option.category]) acc[option.category] = [];
      acc[option.category].push(option);
      return acc;
    }, {} as Record<string, ExtendedStatusOption[]>);

    return (
      <div className="w-96 max-h-[600px] overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            {allowScheduling && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
            {showAdvancedOptions && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {/* Current Status Display */}
            {presence && (
              <Card className="p-3 bg-muted/30">
                <div className="flex items-center gap-3">
                  {presence.profile && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={presence.profile.avatar_url} />
                      <AvatarFallback>
                        {presence.profile.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{presence.profile?.full_name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusOption(presence.status)?.icon}
                      <span>{presence.status}</span>
                      {presence.emoji && <span>{presence.emoji}</span>}
                    </div>
                  </div>
                </div>
                {presence.status_message && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{presence.status_message}"
                  </p>
                )}
              </Card>
            )}

            {/* Status Options by Category */}
            {Object.entries(categorizedOptions).map(([category, options]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium capitalize text-muted-foreground">
                  {category.replace('_', ' ')}
                </h4>
                <div className="space-y-1">
                  {options.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-3 transition-all duration-200",
                        "hover:bg-accent/50 group"
                      )}
                      onClick={() => {
                        if (option.autoExpiry && option.defaultDuration) {
                          const expiryTime = addMinutes(new Date(), option.defaultDuration);
                          handleStatusChange(option.value, { expiryTime });
                        } else {
                          handleStatusChange(option.value);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn("p-1.5 rounded-full", option.bgColor)}>
                          <div className="text-white">
                            {option.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{option.label}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {option.allowMessage && <MessageSquare className="h-3 w-3 text-green-600" />}
                              {option.allowCalls && <PhoneCall className="h-3 w-3 text-blue-600" />}
                              {option.autoExpiry && <Clock className="h-3 w-3 text-orange-600" />}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                          {option.autoExpiry && option.defaultDuration && (
                            <p className="text-xs text-orange-600 mt-1">
                              Auto-expires in {option.defaultDuration}m
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {allowCustomStatus && (
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Custom Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Select value={selectedEmoji} onValueChange={setSelectedEmoji}>
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-32">
                        <div className="grid grid-cols-4 gap-1 p-2">
                          {moodEmojis.map((emoji) => (
                            <SelectItem key={emoji} value={emoji} className="p-2 hover:bg-accent">
                              <span className="text-lg">{emoji}</span>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="What's your status?"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {customMessage.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Clear status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Never" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30m">After 30 minutes</SelectItem>
                        <SelectItem value="1h">After 1 hour</SelectItem>
                        <SelectItem value="4h">After 4 hours</SelectItem>
                        <SelectItem value="today">End of today</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleStatusChange('Custom', {
                    message: customMessage,
                    emoji: selectedEmoji,
                    expiryTime: expiryTime || undefined
                  })}
                  disabled={!customMessage.trim()}
                >
                  Set Custom Status
                </Button>

                {/* Recent Custom Statuses */}
                {customStatuses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Recent</h4>
                    {customStatuses.slice(0, 3).map((status) => (
                      <Button
                        key={status.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2"
                        onClick={() => handleStatusChange('Custom', {
                          message: status.text,
                          emoji: status.emoji,
                          expiryTime: status.expiresAt
                        })}
                      >
                        <span className="mr-2">{status.emoji}</span>
                        <span className="truncate">{status.text}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {allowScheduling && (
            <TabsContent value="schedule" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Schedule automatic status changes based on your calendar or time.
                </p>

                {/* Quick Schedule Options */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto p-3 flex flex-col items-start">
                    <Coffee className="h-4 w-4 mb-1" />
                    <span className="text-xs">Lunch Break</span>
                    <span className="text-xs text-muted-foreground">12:00 - 13:00</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 flex flex-col items-start">
                    <Focus className="h-4 w-4 mb-1" />
                    <span className="text-xs">Focus Time</span>
                    <span className="text-xs text-muted-foreground">14:00 - 16:00</span>
                  </Button>
                </div>

                {/* Active Schedules */}
                {schedules.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Active Schedules</h4>
                    {schedules.map((schedule) => (
                      <Card key={schedule.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{schedule.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </TabsContent>
          )}

          {showAdvancedOptions && (
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Notification Preferences</h4>
                  <div className="space-y-3">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Privacy Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Show last seen</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Show online status</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Allow status messages</label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                {showAnalytics && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Activity Analytics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly active hours</span>
                        <span className="font-medium">32.5h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Most active day</span>
                        <span className="font-medium">Tuesday</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status changes</span>
                        <span className="font-medium">24 this week</span>
                      </div>
                    </div>
                    <Progress value={65} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      65% more active than last week
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  };

  const renderPresenceIndicator = () => {
    switch (variant) {
      case 'badge':
        return renderBadge();
      case 'full':
        return renderFullStatus();
      case 'card':
        return renderCard();
      case 'minimal':
        return (
          <div className="flex items-center gap-1">
            {renderStatusDot()}
            {showText && (
              <span className={cn("text-muted-foreground", textSizeClasses[size])}>
                {getStatusOption(presence?.status || 'Offline')?.label}
              </span>
            )}
          </div>
        );
      default:
        return renderStatusDot();
    }
  };

  if (interactive && presence && isCurrentUser) {
    return (
      <TooltipProvider>
        <Popover open={showStatusPicker} onOpenChange={setShowStatusPicker}>
          <PopoverTrigger asChild>
            <div 
              className={cn("cursor-pointer transition-all duration-200 hover:scale-105", className)}
              onClick={() => onPresenceClick?.(userId)}
            >
              {renderPresenceIndicator()}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-4" align="start" side="bottom">
            {renderStatusPicker()}
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              className,
              interactive && "cursor-pointer transition-all duration-200 hover:scale-105"
            )}
            onClick={() => onPresenceClick?.(userId)}
          >
            {renderPresenceIndicator()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{presence?.profile?.full_name || 'Unknown User'}</p>
            <p className="text-xs">
              {getStatusOption(presence?.status || 'Offline')?.description}
            </p>
            {presence?.status_message && (
              <p className="text-xs italic">"{presence.status_message}"</p>
            )}
            {showLastSeen && presence?.last_seen && (
              <p className="text-xs text-muted-foreground">
                Last seen {formatDistanceToNow(presence.last_seen, { addSuffix: true })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Enhanced hook for managing presence state
export function useEnhancedPresence() {
  const [presenceData, setPresenceData] = useState<Record<string, any>>({});
  const [currentUserStatus, setCurrentUserStatus] = useState('Available');
  
  const updatePresence = useCallback((userId: string, data: any) => {
    setPresenceData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ...data, lastUpdated: new Date() }
    }));
  }, []);

  const setStatus = useCallback(async (status: string, options?: {
    message?: string;
    emoji?: string;
    expiryTime?: Date;
  }) => {
    setCurrentUserStatus(status);
    // Update backend
    // await api.updateStatus(status, options);
  }, []);

  const scheduleStatus = useCallback(async (schedule: PresenceSchedule) => {
    // Schedule status change
    // await api.scheduleStatus(schedule);
  }, []);

  return {
    presenceData,
    currentUserStatus,
    updatePresence,
    setStatus,
    scheduleStatus
  };
}
