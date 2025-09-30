import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Phone,
  Video,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Filter,
  Calendar,
  Clock,
  MessageSquare,
  Trash2,
  Star,
  Archive,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useCallHistory } from '@/hooks/useCallHistory';

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  participant: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: Date;
  duration: number; // in seconds
  status: 'completed' | 'declined' | 'no_answer' | 'failed';
  isStarred: boolean;
  notes?: string;
}

interface EnhancedCallHistoryProps {
  className?: string;
  onCallBack?: (participantId: string, callType: 'voice' | 'video') => void;
  onMessage?: (participantId: string) => void;
}

export default function EnhancedCallHistory({
  className,
  onCallBack,
  onMessage
}: EnhancedCallHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');
  const { user } = useAuth();
  const { callHistory: rawCallHistory, isLoading } = useCallHistory();

  // Transform database call history to match CallRecord interface
  const callHistory: CallRecord[] = rawCallHistory.map((call) => {
    const isIncoming = call.receiver_id === user?.id;
    const isMissed = call.status === 'no_answer' && isIncoming;
    
    return {
      id: call.id,
      type: isMissed ? 'missed' : (isIncoming ? 'incoming' : 'outgoing'),
      callType: (call.call_type === 'video' ? 'video' : 'voice') as 'voice' | 'video',
      participant: {
        id: isIncoming ? call.caller_id || '' : call.receiver_id || '',
        name: isIncoming ? call.caller_name || 'Unknown' : call.receiver_name || 'Unknown',
        role: ''
      },
      timestamp: new Date(call.started_at || Date.now()),
      duration: call.duration_seconds || 0,
      status: (call.status === 'completed' ? 'completed' : 
                call.status === 'declined' ? 'declined' :
                call.status === 'failed' ? 'failed' : 'no_answer') as 'completed' | 'declined' | 'no_answer' | 'failed',
      isStarred: false
    };
  });

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date): string => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getCallIcon = (record: CallRecord) => {
    const iconClass = "h-4 w-4";
    
    if (record.type === 'missed') {
      return <PhoneMissed className={cn(iconClass, "text-red-500")} />;
    }
    
    if (record.callType === 'video') {
      return <Video className={cn(iconClass, record.type === 'incoming' ? "text-green-500" : "text-blue-500")} />;
    }
    
    if (record.type === 'incoming') {
      return <PhoneIncoming className={cn(iconClass, "text-green-500")} />;
    } else {
      return <PhoneOutgoing className={cn(iconClass, "text-blue-500")} />;
    }
  };

  const getStatusBadge = (record: CallRecord) => {
    switch (record.status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'no_answer':
        return <Badge variant="secondary">No Answer</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const filteredHistory = callHistory.filter(record => {
    const matchesSearch = record.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || record.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCallBack = (record: CallRecord) => {
    onCallBack?.(record.participant.id, record.callType);
    toast.success(`Calling ${record.participant.name}...`);
  };

  const handleMessage = (record: CallRecord) => {
    onMessage?.(record.participant.id);
    toast.success(`Opening chat with ${record.participant.name}...`);
  };

  const handleToggleStar = (recordId: string) => {
    // In a real implementation, this would update the database
    // For now, we'll just show a toast
    toast.success('Starred status updated');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call History
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search call history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'missed', 'incoming', 'outgoing'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="text-xs"
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 p-4">
            {filteredHistory.map((record, index) => (
              <div key={record.id}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  {/* Call Type Icon */}
                  <div className="flex-shrink-0">
                    {getCallIcon(record)}
                  </div>

                  {/* Participant Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={record.participant.avatar} />
                      <AvatarFallback>
                        {record.participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">
                            {record.participant.name}
                          </h3>
                          {record.isStarred && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                          {record.participant.role && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {record.participant.role}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(record.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-xs">
                          {getStatusBadge(record)}
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(record.duration)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCallBack(record)}
                          >
                            {record.callType === 'video' ? (
                              <Video className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Phone className="h-3 w-3 text-green-500" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMessage(record)}
                          >
                            <MessageSquare className="h-3 w-3 text-blue-500" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleStar(record.id)}
                          >
                            <Star className={cn("h-3 w-3", record.isStarred ? "text-yellow-500 fill-current" : "text-muted-foreground")} />
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
                    </div>
                  </div>
                </div>
                
                {index < filteredHistory.length - 1 && <Separator />}
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No calls found matching your search' : 'No call history available'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}