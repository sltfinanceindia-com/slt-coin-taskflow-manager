import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneMissed, 
  PhoneOutgoing, 
  Video, 
  Clock, 
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Star,
  StarOff,
  MoreVertical,
  Archive,
  UserPlus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Pause,
  Volume2,
  Signal,
  Wifi,
  WifiOff,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  FileDown as Export
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface CallRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantEmail?: string;
  participantRole?: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'declined' | 'busy' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  quality?: 'excellent' | 'good' | 'poor';
  recordingUrl?: string;
  notes?: string;
  isStarred?: boolean;
  isArchived?: boolean;
  callCost?: number;
  participants?: string[];
}

interface CallStats {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageCallDuration: number;
  callsByType: { audio: number; video: number };
  callsByDay: { [key: string]: number };
  topContacts: { name: string; count: number; avatar?: string }[];
}

interface CallHistoryProps {
  onCallParticipant?: (participantId: string, type: 'audio' | 'video') => void;
  onMessageParticipant?: (participantId: string) => void;
  onExportData?: (data: CallRecord[]) => void;
  className?: string;
  enableAnalytics?: boolean;
  maxRecords?: number;
}

export function CallHistory({ 
  onCallParticipant, 
  onMessageParticipant,
  onExportData,
  className,
  enableAnalytics = true,
  maxRecords = 1000
}: CallHistoryProps) {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'missed' | 'incoming' | 'outgoing' | 'starred' | 'archived'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'duration' | 'name'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    setIsLoading(true);
    try {
      // Enhanced mock data with more realistic scenarios
      const mockData: CallRecord[] = Array.from({ length: 50 }, (_, i) => {
        const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis', 'Alex Chen', 'Emma Thompson'];
        const roles = ['Manager', 'Developer', 'Designer', 'Analyst', 'Consultant', 'Director'];
        const statuses: CallRecord['status'][] = ['answered', 'missed', 'declined', 'busy', 'failed'];
        const qualities: CallRecord['quality'][] = ['excellent', 'good', 'poor'];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        const isVideo = Math.random() > 0.6;
        const direction = Math.random() > 0.5 ? 'incoming' : 'outgoing';
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const quality = qualities[Math.floor(Math.random() * qualities.length)];
        
        // Generate realistic timestamps
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const startTime = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
        
        let duration: number | undefined;
        let endTime: Date | undefined;
        
        if (status === 'answered') {
          duration = Math.floor(Math.random() * 1800) + 30; // 30s to 30min
          endTime = new Date(startTime.getTime() + duration * 1000);
        }

        return {
          id: `call-${i}`,
          participantId: `user-${i % 8}`,
          participantName: randomName,
          participantAvatar: Math.random() > 0.5 ? `/avatar${(i % 8) + 1}.jpg` : undefined,
          participantEmail: `${randomName.toLowerCase().replace(' ', '.')}@company.com`,
          participantRole: roles[Math.floor(Math.random() * roles.length)],
          type: isVideo ? 'video' : 'audio',
          direction,
          status,
          startTime,
          endTime,
          duration,
          quality,
          recordingUrl: status === 'answered' && Math.random() > 0.7 ? `/recordings/call-${i}.mp3` : undefined,
          notes: Math.random() > 0.8 ? 'Important client discussion about project timeline' : undefined,
          isStarred: Math.random() > 0.9,
          isArchived: Math.random() > 0.95,
          callCost: isVideo ? Math.random() * 0.5 : Math.random() * 0.2,
          participants: direction === 'incoming' && Math.random() > 0.8 ? 
            ['user-group-1', 'user-group-2'] : undefined
        };
      });
      
      setCallHistory(mockData);
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = callHistory.filter(call => {
      const matchesSearch = 
        call.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.participantEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.participantRole?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = (() => {
        switch (filterType) {
          case 'missed': return call.status === 'missed';
          case 'incoming': return call.direction === 'incoming';
          case 'outgoing': return call.direction === 'outgoing';
          case 'starred': return call.isStarred;
          case 'archived': return call.isArchived;
          default: return !call.isArchived; // Hide archived by default
        }
      })();

      const matchesDateRange = (() => {
        const now = new Date();
        switch (dateRange) {
          case 'today': return isToday(call.startTime);
          case 'week': 
            return call.startTime >= startOfWeek(now) && call.startTime <= endOfWeek(now);
          case 'month':
            return call.startTime >= startOfMonth(now) && call.startTime <= endOfMonth(now);
          default: return true;
        }
      })();
      
      return matchesSearch && matchesFilter && matchesDateRange;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'time':
          comparison = a.startTime.getTime() - b.startTime.getTime();
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case 'name':
          comparison = a.participantName.localeCompare(b.participantName);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered.slice(0, maxRecords);
  }, [callHistory, searchQuery, filterType, dateRange, sortBy, sortOrder, maxRecords]);

  // Calculate call statistics
  const callStats = useMemo((): CallStats => {
    const relevantCalls = callHistory.filter(call => !call.isArchived);
    
    const totalCalls = relevantCalls.length;
    const answeredCalls = relevantCalls.filter(call => call.status === 'answered').length;
    const missedCalls = relevantCalls.filter(call => call.status === 'missed').length;
    
    const totalDuration = relevantCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const averageCallDuration = answeredCalls > 0 ? totalDuration / answeredCalls : 0;
    
    const callsByType = {
      audio: relevantCalls.filter(call => call.type === 'audio').length,
      video: relevantCalls.filter(call => call.type === 'video').length
    };

    const callsByDay: { [key: string]: number } = {};
    relevantCalls.forEach(call => {
      const day = format(call.startTime, 'yyyy-MM-dd');
      callsByDay[day] = (callsByDay[day] || 0) + 1;
    });

    const contactCounts: { [key: string]: { name: string; count: number; avatar?: string } } = {};
    relevantCalls.forEach(call => {
      if (!contactCounts[call.participantId]) {
        contactCounts[call.participantId] = {
          name: call.participantName,
          count: 0,
          avatar: call.participantAvatar
        };
      }
      contactCounts[call.participantId].count++;
    });

    const topContacts = Object.values(contactCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCalls,
      answeredCalls,
      missedCalls,
      totalDuration,
      averageCallDuration,
      callsByType,
      callsByDay,
      topContacts
    };
  }, [callHistory]);

  // Group calls by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: CallRecord[] } = {};
    
    filteredAndSortedHistory.forEach(call => {
      let dateKey: string;
      
      if (isToday(call.startTime)) {
        dateKey = 'Today';
      } else if (isYesterday(call.startTime)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(call.startTime, 'MMMM dd, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(call);
    });
    
    return groups;
  }, [filteredAndSortedHistory]);

  const getCallIcon = useCallback((call: CallRecord) => {
    const iconClass = "h-4 w-4";
    
    if (call.status === 'missed') {
      return <PhoneMissed className={cn(iconClass, "text-red-500")} />;
    }
    if (call.status === 'failed') {
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    }
    if (call.direction === 'incoming') {
      return <PhoneIncoming className={cn(iconClass, "text-green-600")} />;
    }
    return <PhoneOutgoing className={cn(iconClass, "text-blue-600")} />;
  }, []);

  const getCallStatusBadge = useCallback((call: CallRecord) => {
    const statusConfig = {
      answered: { variant: 'default' as const, label: 'Answered', color: 'text-green-600' },
      missed: { variant: 'destructive' as const, label: 'Missed', color: 'text-red-600' },
      declined: { variant: 'secondary' as const, label: 'Declined', color: 'text-yellow-600' },
      busy: { variant: 'outline' as const, label: 'Busy', color: 'text-orange-600' },
      failed: { variant: 'destructive' as const, label: 'Failed', color: 'text-red-600' }
    };
    
    const config = statusConfig[call.status];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  }, []);

  const getQualityIndicator = useCallback((quality?: string) => {
    if (!quality) return null;
    
    const qualityConfig = {
      excellent: { icon: Signal, color: 'text-green-500' },
      good: { icon: Wifi, color: 'text-yellow-500' },
      poor: { icon: WifiOff, color: 'text-red-500' }
    };
    
    const config = qualityConfig[quality as keyof typeof qualityConfig];
    const IconComponent = config.icon;
    
    return <IconComponent className={cn("h-3 w-3", config.color)} />;
  }, []);

  const formatCallTime = useCallback((date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const handleCallParticipant = (call: CallRecord, type: 'audio' | 'video') => {
    onCallParticipant?.(call.participantId, type);
  };

  const handleStarCall = (callId: string) => {
    setCallHistory(prev => prev.map(call => 
      call.id === callId ? { ...call, isStarred: !call.isStarred } : call
    ));
  };

  const handleArchiveCall = (callId: string) => {
    setCallHistory(prev => prev.map(call => 
      call.id === callId ? { ...call, isArchived: !call.isArchived } : call
    ));
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadCallHistory();
    setRefreshing(false);
  };

  const exportData = () => {
    onExportData?.(filteredAndSortedHistory);
  };

  const renderCallItem = (call: CallRecord) => (
    <div
      key={call.id}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group cursor-pointer"
      onClick={() => setSelectedCall(call)}
    >
      <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
        <AvatarImage src={call.participantAvatar} />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 font-medium">
          {call.participantName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="font-medium truncate">{call.participantName}</p>
          <div className="flex items-center space-x-1">
            {getCallIcon(call)}
            {call.type === 'video' && <Video className="h-3 w-3 text-muted-foreground" />}
            {call.participants && call.participants.length > 0 && (
              <Users className="h-3 w-3 text-muted-foreground" />
            )}
            {call.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
            {getQualityIndicator(call.quality)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{call.participantRole}</span>
          <span>•</span>
          <span>{formatCallTime(call.startTime)}</span>
          {call.duration && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(call.duration)}</span>
              </div>
            </>
          )}
          {call.recordingUrl && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <PlayCircle className="h-3 w-3 text-blue-500" />
                <span>Recorded</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {getCallStatusBadge(call)}
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarCall(call.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  {call.isStarred ? 
                    <Star className="h-4 w-4 text-yellow-500 fill-current" /> :
                    <StarOff className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>{call.isStarred ? 'Remove star' : 'Add star'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallParticipant(call, 'audio');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Call back</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallParticipant(call, 'video');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>

            {onMessageParticipant && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessageParticipant(call.participantId);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <PhoneCall className="h-4 w-4 text-blue-500" />
          <div>
            <div className="text-2xl font-bold">{callStats.totalCalls}</div>
            <div className="text-xs text-muted-foreground">Total Calls</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-2xl font-bold">{callStats.answeredCalls}</div>
            <div className="text-xs text-muted-foreground">Answered</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <div>
            <div className="text-2xl font-bold">{callStats.missedCalls}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-purple-500" />
          <div>
            <div className="text-2xl font-bold">{formatDuration(Math.floor(callStats.averageCallDuration))}</div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <Card className={cn("h-full flex flex-col", className)}>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <PhoneCall className="h-5 w-5" />
              <span>Call History</span>
              <Badge variant="secondary" className="text-xs">
                {filteredAndSortedHistory.length}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {enableAnalytics && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="text-muted-foreground"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="text-muted-foreground"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={exportData}
                className="text-muted-foreground"
              >
                <Export className="h-4 w-4" />
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Call History Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Auto-archive calls older than</label>
                      <Select defaultValue="90">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">6 months</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {showStats && renderStatsCards()}
          
          <div className="space-y-3">
            {/* Enhanced Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls, names, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            {/* Enhanced Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex space-x-1">
                {(['all', 'missed', 'incoming', 'outgoing', 'starred'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(filter)}
                    className="capitalize text-xs h-8"
                  >
                    {filter === 'all' ? 'All' : filter}
                  </Button>
                ))}
              </div>
              
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Sort by time</SelectItem>
                  <SelectItem value="duration">Sort by duration</SelectItem>
                  <SelectItem value="name">Sort by name</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-8 w-8 p-0"
              >
                {sortOrder === 'desc' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
                className="h-8"
              >
                {viewMode === 'list' ? 'Group' : 'List'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading call history...</p>
              </div>
            ) : filteredAndSortedHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <PhoneCall className="h-12 w-12 mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-medium">No calls found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setDateRange('all');
                }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="p-4">
                {viewMode === 'list' ? (
                  <div className="space-y-1">
                    {filteredAndSortedHistory.map(renderCallItem)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedHistory).map(([date, calls]) => (
                      <div key={date}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-1">
                          {date} ({calls.length} calls)
                        </h3>
                        <div className="space-y-1">
                          {calls.map(renderCallItem)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Call Details Dialog */}
        {selectedCall && (
          <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedCall.participantAvatar} />
                    <AvatarFallback>{selectedCall.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedCall.participantName}</div>
                    <div className="text-sm text-muted-foreground">{selectedCall.participantRole}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Call Type</div>
                    <div className="text-muted-foreground capitalize">
                      {selectedCall.type} {selectedCall.direction}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Status</div>
                    <div className="text-muted-foreground capitalize">{selectedCall.status}</div>
                  </div>
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div className="text-muted-foreground">
                      {format(selectedCall.startTime, 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  {selectedCall.duration && (
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-muted-foreground">{formatDuration(selectedCall.duration)}</div>
                    </div>
                  )}
                  {selectedCall.quality && (
                    <div>
                      <div className="font-medium">Call Quality</div>
                      <div className="text-muted-foreground capitalize">{selectedCall.quality}</div>
                    </div>
                  )}
                </div>
                
                {selectedCall.notes && (
                  <div>
                    <div className="font-medium mb-2">Notes</div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedCall.notes}
                    </p>
                  </div>
                )}
                
                {selectedCall.recordingUrl && (
                  <div>
                    <div className="font-medium mb-2">Recording</div>
                    <Button variant="outline" size="sm" className="w-full">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Play Recording
                    </Button>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleCallParticipant(selectedCall, 'audio')}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Back
                  </Button>
                  <Button
                    onClick={() => handleCallParticipant(selectedCall, 'video')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
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
