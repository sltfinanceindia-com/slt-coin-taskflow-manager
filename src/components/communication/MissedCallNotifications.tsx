import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  PhoneMissed, 
  Video, 
  Phone, 
  X, 
  Clock,
  RotateCcw,
  Bell,
  BellOff,
  Users,
  Calendar,
  MessageSquare,
  Mail,
  Settings,
  Star,
  StarOff,
  Pin,
  PinOff,
  Archive,
  Trash2,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
  MapPin,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Zap,
  Wifi,
  WifiOff,
  Loader2,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, differenceInHours, differenceInMinutes } from 'date-fns';
import { audioNotifications } from '@/utils/audioNotifications';
import { useToast } from '@/hooks/use-toast';

export interface MissedCall {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole?: string;
  participantDepartment?: string;
  participantPhone?: string;
  participantEmail?: string;
  type: 'audio' | 'video' | 'conference';
  callDirection: 'incoming' | 'outgoing';
  missedAt: Date;
  attempts: number;
  duration?: number; // How long the call rang
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
  isStarred?: boolean;
  isPinned?: boolean;
  isRead?: boolean;
  readAt?: Date;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: string;
  reason?: 'busy' | 'declined' | 'no_answer' | 'network_error' | 'dnd';
  callbackRequested?: boolean;
  scheduledCallback?: Date;
  relatedCalls?: string[]; // Related call IDs
  meetingId?: string;
  groupCallId?: string;
  participants?: string[]; // For group calls
}

interface CallStats {
  totalMissed: number;
  todayMissed: number;
  callbackRate: number;
  responseTime: number;
  peakHours: { hour: number; count: number }[];
  frequentCallers: { participantId: string; name: string; count: number }[];
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  priority: 'all' | 'high' | 'urgent';
  quietHours: { start: string; end: string; enabled: boolean };
  autoMarkRead: boolean;
  groupSimilar: boolean;
  maxNotifications: number;
  soundVolume: number;
  customSounds: Record<string, string>;
}

interface MissedCallNotificationsProps {
  onCallBack?: (participantId: string, type: 'audio' | 'video') => Promise<void>;
  onDismiss?: (callId: string) => void;
  onMarkRead?: (callId: string) => void;
  onScheduleCallback?: (callId: string, scheduledTime: Date) => void;
  onStar?: (callId: string) => void;
  onPin?: (callId: string) => void;
  onArchive?: (callId: string) => void;
  onViewDetails?: (call: MissedCall) => void;
  onBulkAction?: (callIds: string[], action: 'read' | 'archive' | 'delete') => void;
  enableBulkActions?: boolean;
  enableAdvancedFeatures?: boolean;
  enableAnalytics?: boolean;
  maxVisibleCalls?: number;
  groupByDate?: boolean;
  showCallStats?: boolean;
  allowCustomization?: boolean;
  className?: string;
}

export function MissedCallNotifications({ 
  onCallBack, 
  onDismiss,
  onMarkRead,
  onScheduleCallback,
  onStar,
  onPin,
  onArchive,
  onViewDetails,
  onBulkAction,
  enableBulkActions = true,
  enableAdvancedFeatures = true,
  enableAnalytics = false,
  maxVisibleCalls = 20,
  groupByDate = true,
  showCallStats = true,
  allowCustomization = true,
  className 
}: MissedCallNotificationsProps) {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'timeline'>('detailed');
  const [sortBy, setSortBy] = useState<'time' | 'name' | 'attempts' | 'priority'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'starred' | 'pinned' | 'high_priority'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    priority: 'all',
    quietHours: { start: '22:00', end: '08:00', enabled: false },
    autoMarkRead: false,
    groupSimilar: true,
    maxNotifications: 10,
    soundVolume: 80,
    customSounds: {}
  });

  const { toast } = useToast();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadMissedCalls();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  useEffect(() => {
    audioNotifications.initialize();
    loadMissedCalls();
    loadSettings();
  }, []);

  // Enhanced call statistics
  const callStats = useMemo((): CallStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayMissed = missedCalls.filter(call => 
      call.missedAt >= today
    ).length;
    
    const callbackCount = missedCalls.filter(call => 
      call.callbackRequested || call.scheduledCallback
    ).length;
    
    const callbackRate = missedCalls.length > 0 ? (callbackCount / missedCalls.length) * 100 : 0;
    
    // Calculate average response time for callbacks
    const responseTimes = missedCalls
      .filter(call => call.readAt)
      .map(call => differenceInMinutes(call.readAt!, call.missedAt));
    
    const responseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    // Peak hours analysis
    const hourCounts: Record<number, number> = {};
    missedCalls.forEach(call => {
      const hour = call.missedAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Frequent callers
    const callerCounts: Record<string, { name: string; count: number }> = {};
    missedCalls.forEach(call => {
      if (!callerCounts[call.participantId]) {
        callerCounts[call.participantId] = {
          name: call.participantName,
          count: 0
        };
      }
      callerCounts[call.participantId].count++;
    });
    
    const frequentCallers = Object.entries(callerCounts)
      .map(([participantId, data]) => ({ participantId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalMissed: missedCalls.length,
      todayMissed,
      callbackRate,
      responseTime,
      peakHours,
      frequentCallers
    };
  }, [missedCalls]);

  const loadMissedCalls = useCallback(() => {
    try {
      const stored = localStorage.getItem('missedCalls');
      if (stored) {
        const calls = JSON.parse(stored).map((call: any) => ({
          ...call,
          missedAt: new Date(call.missedAt),
          readAt: call.readAt ? new Date(call.readAt) : undefined,
          scheduledCallback: call.scheduledCallback ? new Date(call.scheduledCallback) : undefined
        }));
        setMissedCalls(calls);
      }
    } catch (error) {
      console.error('Failed to load missed calls:', error);
    }
  }, []);

  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem('missedCallSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const saveMissedCalls = useCallback((calls: MissedCall[]) => {
    try {
      localStorage.setItem('missedCalls', JSON.stringify(calls));
    } catch (error) {
      console.error('Failed to save missed calls:', error);
    }
  }, []);

  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    try {
      localStorage.setItem('missedCallSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  // Enhanced filtering and sorting
  const filteredAndSortedCalls = useMemo(() => {
    let filtered = missedCalls.filter(call => {
      const matchesSearch = searchQuery === '' || 
        call.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.participantRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.participantDepartment?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = (() => {
        switch (filterBy) {
          case 'unread': return !call.isRead;
          case 'starred': return call.isStarred;
          case 'pinned': return call.isPinned;
          case 'high_priority': return call.priority === 'high' || call.priority === 'urgent';
          default: return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });

    // Sort calls
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'time':
          comparison = a.missedAt.getTime() - b.missedAt.getTime();
          break;
        case 'name':
          comparison = a.participantName.localeCompare(b.participantName);
          break;
        case 'attempts':
          comparison = a.attempts - b.attempts;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[b.priority || 'low'] || 1) - (priorityOrder[a.priority || 'low'] || 1);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered.slice(0, maxVisibleCalls);
  }, [missedCalls, searchQuery, filterBy, sortBy, sortOrder, maxVisibleCalls]);

  // Group calls by date if enabled
  const groupedCalls = useMemo(() => {
    if (!groupByDate) {
      return { 'All Calls': filteredAndSortedCalls };
    }

    const groups: Record<string, MissedCall[]> = {};
    
    filteredAndSortedCalls.forEach(call => {
      let groupKey: string;
      
      if (isToday(call.missedAt)) {
        groupKey = 'Today';
      } else if (isYesterday(call.missedAt)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(call.missedAt, 'MMMM d, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(call);
    });

    return groups;
  }, [filteredAndSortedCalls, groupByDate]);

  const addMissedCall = async (call: Omit<MissedCall, 'id'>) => {
    const newCall: MissedCall = {
      ...call,
      id: `missed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false
    };
    
    setMissedCalls(prev => {
      const existingIndex = prev.findIndex(c => c.participantId === call.participantId && !c.isRead);
      
      let updatedCalls;
      if (existingIndex >= 0 && settings.groupSimilar) {
        updatedCalls = [...prev];
        updatedCalls[existingIndex] = {
          ...updatedCalls[existingIndex],
          missedAt: call.missedAt,
          attempts: updatedCalls[existingIndex].attempts + 1
        };
      } else {
        updatedCalls = [newCall, ...prev];
      }
      
      const trimmedCalls = updatedCalls.slice(0, settings.maxNotifications);
      saveMissedCalls(trimmedCalls);
      
      return trimmedCalls;
    });

    // Check quiet hours
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const isQuietHours = settings.quietHours.enabled && 
      currentTime >= settings.quietHours.start && 
      currentTime <= settings.quietHours.end;

    // Play notification if enabled and not in quiet hours
    if (settings.soundEnabled && !isQuietHours) {
      await audioNotifications.playMissedCall();
    }
    
    // Show toast notification
    toast({
      title: "Missed Call",
      description: `${call.participantName} tried to call you`,
      action: (
        <Button
          size="sm"
          onClick={() => handleCallBack(call.participantId, call.type)}
        >
          Call Back
        </Button>
      ),
    });

    return newCall;
  };

  const handleCallBack = async (participantId: string, type: 'audio' | 'video' | 'conference') => {
    try {
      if (onCallBack) {
        await onCallBack(participantId, type === 'conference' ? 'video' : type);
      }
      
      // Mark as read and add callback request
      setMissedCalls(prev => prev.map(call => 
        call.participantId === participantId 
          ? { ...call, isRead: true, readAt: new Date(), callbackRequested: true }
          : call
      ));
      
      toast({
        title: "Callback Initiated",
        description: "Starting call...",
      });
    } catch (error) {
      toast({
        title: "Callback Failed",
        description: "Could not start the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkRead = (callId: string) => {
    setMissedCalls(prev => prev.map(call => 
      call.id === callId 
        ? { ...call, isRead: true, readAt: new Date() }
        : call
    ));
    onMarkRead?.(callId);
  };

  const handleBulkAction = (action: 'read' | 'archive' | 'delete') => {
    if (selectedCalls.size === 0) return;

    const callIds = Array.from(selectedCalls);
    
    switch (action) {
      case 'read':
        setMissedCalls(prev => prev.map(call => 
          callIds.includes(call.id) 
            ? { ...call, isRead: true, readAt: new Date() }
            : call
        ));
        break;
      case 'archive':
        setMissedCalls(prev => prev.filter(call => !callIds.includes(call.id)));
        break;
      case 'delete':
        setMissedCalls(prev => prev.filter(call => !callIds.includes(call.id)));
        break;
    }

    onBulkAction?.(callIds, action);
    setSelectedCalls(new Set());
    
    toast({
      title: "Action Completed",
      description: `${action === 'read' ? 'Marked as read' : action === 'archive' ? 'Archived' : 'Deleted'} ${callIds.length} call(s)`,
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCallTypeIcon = (type: string, size = 'h-4 w-4') => {
    switch (type) {
      case 'video': return <Video className={size} />;
      case 'conference': return <Users className={size} />;
      default: return <Phone className={size} />;
    }
  };

  const renderCallCard = (call: MissedCall) => {
    const isSelected = selectedCalls.has(call.id);
    const timeSince = formatDistanceToNow(call.missedAt, { addSuffix: true });
    const hoursAgo = differenceInHours(new Date(), call.missedAt);

    return (
      <Card 
        key={call.id} 
        className={cn(
          "transition-all duration-200 hover:shadow-md cursor-pointer",
          !call.isRead && "border-l-4 border-l-blue-500 bg-blue-50/30",
          call.isPinned && "border-t-2 border-t-yellow-400",
          call.priority === 'urgent' && "border-l-4 border-l-red-500 bg-red-50/30",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={() => {
          if (enableBulkActions) {
            setSelectedCalls(prev => {
              const newSet = new Set(prev);
              if (newSet.has(call.id)) {
                newSet.delete(call.id);
              } else {
                newSet.add(call.id);
              }
              return newSet;
            });
          } else {
            handleMarkRead(call.id);
          }
        }}
      >
        <CardContent className={cn("p-4", viewMode === 'compact' && "p-3")}>
          <div className="flex items-center space-x-3">
            {enableBulkActions && (
              <div className={cn(
                "w-4 h-4 border-2 rounded transition-all duration-200",
                isSelected ? "bg-primary border-primary" : "border-gray-300"
              )}>
                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
              </div>
            )}

            <div className="relative">
              <Avatar className={cn(viewMode === 'compact' ? "h-8 w-8" : "h-12 w-12")}>
                <AvatarImage src={call.participantAvatar} />
                <AvatarFallback className="font-medium">
                  {call.participantName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Call type indicator */}
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                {getCallTypeIcon(call.type, 'h-3 w-3')}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className={cn(
                  "truncate",
                  viewMode === 'compact' ? "text-sm font-medium" : "font-semibold",
                  !call.isRead && "font-bold"
                )}>
                  {call.participantName}
                </p>
                
                {call.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                {call.isPinned && <Pin className="h-3 w-3 text-blue-500" />}
                
                {call.attempts > 1 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {call.attempts} calls
                  </Badge>
                )}
                
                {call.priority && call.priority !== 'low' && (
                  <Badge className={cn("text-xs h-4 px-1", getPriorityColor(call.priority))}>
                    {call.priority}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeSince}</span>
                </div>
                
                {call.participantRole && (
                  <>
                    <span>•</span>
                    <span className="truncate">{call.participantRole}</span>
                  </>
                )}
                
                {call.location && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{call.location}</span>
                  </>
                )}
              </div>

              {viewMode === 'detailed' && (
                <div className="mt-2 space-y-1">
                  {call.reason && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Reason: {call.reason.replace('_', ' ')}</span>
                    </div>
                  )}
                  
                  {call.scheduledCallback && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Callback scheduled for {format(call.scheduledCallback, 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                  
                  {call.tags && call.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {call.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs h-4 px-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              {/* Quick actions */}
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallBack(call.participantId, 'audio');
                        }}
                        className={cn(
                          "hover:bg-green-100 hover:text-green-700 transition-colors",
                          viewMode === 'compact' ? "h-6 w-6 p-0" : "h-8 w-8 p-0"
                        )}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Call back</TooltipContent>
                  </Tooltip>
                  
                  {call.type !== 'audio' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallBack(call.participantId, call.type);
                          }}
                          className={cn(
                            "hover:bg-blue-100 hover:text-blue-700 transition-colors",
                            viewMode === 'compact' ? "h-6 w-6 p-0" : "h-8 w-8 p-0"
                          )}
                        >
                          {getCallTypeIcon(call.type, 'h-3 w-3')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Video call back</TooltipContent>
                    </Tooltip>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStar?.(call.id);
                          setMissedCalls(prev => prev.map(c => 
                            c.id === call.id ? { ...c, isStarred: !c.isStarred } : c
                          ));
                        }}
                        className={cn(
                          "hover:bg-yellow-100 hover:text-yellow-700 transition-colors",
                          viewMode === 'compact' ? "h-6 w-6 p-0" : "h-8 w-8 p-0"
                        )}
                      >
                        {call.isStarred ? 
                          <Star className="h-3 w-3 fill-current text-yellow-500" /> : 
                          <StarOff className="h-3 w-3" />
                        }
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{call.isStarred ? 'Unstar' : 'Star'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Time indicator */}
              <div className={cn(
                "text-xs text-muted-foreground",
                hoursAgo < 1 ? "text-red-500" : hoursAgo < 24 ? "text-orange-500" : ""
              )}>
                {format(call.missedAt, 'HH:mm')}
              </div>

              {/* Urgency indicator */}
              {hoursAgo < 1 && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-500 font-medium">Recent</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (missedCalls.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <PhoneMissed className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Missed Calls</h3>
          <p className="text-sm text-muted-foreground">
            You're all caught up! Missed calls will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 hover:bg-transparent"
              >
                <div className="flex items-center space-x-2">
                  <PhoneMissed className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-base">
                    Missed Calls ({missedCalls.filter(c => !c.isRead).length})
                  </CardTitle>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </Button>

              {showCallStats && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    Today: {callStats.todayMissed}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Response: {Math.round(callStats.responseTime)}min
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Auto refresh indicator */}
              {autoRefresh && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded">
                      <Activity className="h-3 w-3 animate-pulse text-green-500" />
                      <span>Live</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Auto-refreshing • Last update: {format(lastRefresh, 'HH:mm')}</TooltipContent>
                </Tooltip>
              )}

              {/* Settings */}
              {allowCustomization && (
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Notification Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sound Notifications</label>
                          <Switch 
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, soundEnabled: checked })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Auto Mark Read</label>
                          <Switch 
                            checked={settings.autoMarkRead}
                            onCheckedChange={(checked) => 
                              saveSettings({ ...settings, autoMarkRead: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sound Volume: {settings.soundVolume}%</label>
                        <Slider
                          value={[settings.soundVolume]}
                          onValueChange={([value]) => 
                            saveSettings({ ...settings, soundVolume: value })
                          }
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Priority Filter</label>
                          <Select 
                            value={settings.priority} 
                            onValueChange={(value: any) => 
                              saveSettings({ ...settings, priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All calls</SelectItem>
                              <SelectItem value="high">High priority only</SelectItem>
                              <SelectItem value="urgent">Urgent only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Max Notifications</label>
                          <Select 
                            value={settings.maxNotifications.toString()} 
                            onValueChange={(value) => 
                              saveSettings({ ...settings, maxNotifications: parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Bulk actions */}
              {enableBulkActions && selectedCalls.size > 0 && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBulkAction('read')}
                    className="h-8 px-2 text-xs"
                  >
                    Mark Read ({selectedCalls.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                    className="h-8 px-2 text-xs"
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {missedCalls.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMissedCalls([]);
                    saveMissedCalls([]);
                    toast({
                      title: "All Notifications Cleared",
                      description: "All missed call notifications have been dismissed",
                    });
                  }}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="flex items-center justify-between space-x-2 mt-3">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 text-xs border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center space-x-1">
                {/* View mode */}
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter */}
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="starred">Starred</SelectItem>
                    <SelectItem value="pinned">Pinned</SelectItem>
                    <SelectItem value="high_priority">Priority</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-7 w-7 p-0"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                </Button>

                {/* Refresh */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    loadMissedCalls();
                    setLastRefresh(new Date());
                  }}
                  className="h-7 w-7 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 pt-0">
            {/* Analytics Dashboard */}
            {enableAnalytics && (
              <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{callStats.totalMissed}</div>
                  <div className="text-xs text-muted-foreground">Total Missed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round(callStats.callbackRate)}%</div>
                  <div className="text-xs text-muted-foreground">Callback Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round(callStats.responseTime)}m</div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{callStats.todayMissed}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
              </div>
            )}

            {/* Missed Call List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {groupByDate ? (
                Object.entries(groupedCalls).map(([dateGroup, calls]) => (
                  <div key={dateGroup}>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-muted-foreground">{dateGroup}</h4>
                      <div className="flex-1 h-px bg-border" />
                      <Badge variant="secondary" className="text-xs">
                        {calls.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {calls.map(renderCallCard)}
                    </div>
                  </div>
                ))
              ) : (
                filteredAndSortedCalls.map(renderCallCard)
              )}

              {filteredAndSortedCalls.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No calls found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}

// Enhanced hook with additional functionality
export function useMissedCalls() {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [analytics, setAnalytics] = useState<CallStats | null>(null);

  const addMissedCall = useCallback((call: Omit<MissedCall, 'id'>) => {
    const newCall: MissedCall = {
      ...call,
      id: `missed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false
    };
    
    setMissedCalls(prev => {
      const existingIndex = prev.findIndex(c => c.participantId === call.participantId && !c.isRead);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          missedAt: call.missedAt,
          attempts: updated[existingIndex].attempts + 1
        };
        return updated;
      } else {
        return [newCall, ...prev.slice(0, 49)]; // Keep max 50
      }
    });
    
    return newCall;
  }, []);

  const removeMissedCall = useCallback((callId: string) => {
    setMissedCalls(prev => prev.filter(call => call.id !== callId));
  }, []);

  const markAsRead = useCallback((callId: string) => {
    setMissedCalls(prev => prev.map(call => 
      call.id === callId 
        ? { ...call, isRead: true, readAt: new Date() }
        : call
    ));
  }, []);

  const starCall = useCallback((callId: string) => {
    setMissedCalls(prev => prev.map(call => 
      call.id === callId 
        ? { ...call, isStarred: !call.isStarred }
        : call
    ));
  }, []);

  const clearAllMissedCalls = useCallback(() => {
    setMissedCalls([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return missedCalls.filter(call => !call.isRead).length;
  }, [missedCalls]);

  const getAnalytics = useCallback((): CallStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayMissed = missedCalls.filter(call => 
      call.missedAt >= today
    ).length;
    
    const callbackCount = missedCalls.filter(call => 
      call.callbackRequested
    ).length;
    
    const callbackRate = missedCalls.length > 0 ? (callbackCount / missedCalls.length) * 100 : 0;
    
    const responseTimes = missedCalls
      .filter(call => call.readAt)
      .map(call => differenceInMinutes(call.readAt!, call.missedAt));
    
    const responseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      totalMissed: missedCalls.length,
      todayMissed,
      callbackRate,
      responseTime,
      peakHours: [],
      frequentCallers: []
    };
  }, [missedCalls]);

  return {
    missedCalls,
    addMissedCall,
    removeMissedCall,
    markAsRead,
    starCall,
    clearAllMissedCalls,
    getUnreadCount,
    getAnalytics
  };
}
