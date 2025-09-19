import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export interface CallRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'declined' | 'busy';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
}

interface CallHistoryProps {
  onCallParticipant?: (participantId: string, type: 'audio' | 'video') => void;
  className?: string;
}

export function CallHistory({ onCallParticipant, className }: CallHistoryProps) {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, load from Supabase
      const mockData: CallRecord[] = [
        {
          id: '1',
          participantId: 'user-1',
          participantName: 'John Doe',
          participantAvatar: '/avatar1.jpg',
          type: 'video',
          direction: 'incoming',
          status: 'answered',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
          duration: 900
        },
        {
          id: '2',
          participantId: 'user-2',
          participantName: 'Jane Smith',
          type: 'audio',
          direction: 'outgoing',
          status: 'missed',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: '3',
          participantId: 'user-3',
          participantName: 'Mike Johnson',
          type: 'video',
          direction: 'incoming',
          status: 'declined',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        }
      ];
      
      setCallHistory(mockData);
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = callHistory.filter(call => {
    const matchesSearch = call.participantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'missed' && call.status === 'missed') ||
                         (filterType === 'incoming' && call.direction === 'incoming') ||
                         (filterType === 'outgoing' && call.direction === 'outgoing');
    
    return matchesSearch && matchesFilter;
  });

  const getCallIcon = (call: CallRecord) => {
    const iconClass = "h-4 w-4";
    
    if (call.status === 'missed') {
      return <PhoneMissed className={cn(iconClass, "text-destructive")} />;
    }
    
    if (call.direction === 'incoming') {
      return <PhoneIncoming className={cn(iconClass, "text-green-600")} />;
    }
    
    return <PhoneOutgoing className={cn(iconClass, "text-blue-600")} />;
  };

  const getCallStatusBadge = (call: CallRecord) => {
    const statusConfig = {
      answered: { variant: 'default' as const, label: 'Answered' },
      missed: { variant: 'destructive' as const, label: 'Missed' },
      declined: { variant: 'secondary' as const, label: 'Declined' },
      busy: { variant: 'outline' as const, label: 'Busy' }
    };
    
    const config = statusConfig[call.status];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const formatCallTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCallParticipant = (call: CallRecord, type: 'audio' | 'video') => {
    onCallParticipant?.(call.participantId, type);
  };

  const clearHistory = () => {
    setCallHistory([]);
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Call History</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-1">
            {(['all', 'missed', 'incoming', 'outgoing'] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterType === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(filter)}
                className="capitalize text-xs"
              >
                {filter === 'all' ? 'All' : filter}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PhoneCall className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No calls found</p>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {filteredHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={call.participantAvatar} />
                    <AvatarFallback>{call.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium truncate">{call.participantName}</p>
                      {getCallIcon(call)}
                      {call.type === 'video' && <Video className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getCallStatusBadge(call)}
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCallParticipant(call, 'audio')}
                        className="h-8 w-8 p-0"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCallParticipant(call, 'video')}
                        className="h-8 w-8 p-0"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}