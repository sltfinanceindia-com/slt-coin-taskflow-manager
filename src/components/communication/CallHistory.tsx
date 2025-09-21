import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Video,
  VideoOff,
  Clock,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Trash2,
  Star,
  StarOff,
  Archive,
  ArchiveRestore,
  RefreshCw,
  FileText,
  Eye,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CallRecord {
  id: string;
  participantName: string;
  participantAvatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  duration: number; // in seconds
  timestamp: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  isStarred: boolean;
  isArchived: boolean;
  notes?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
}

interface CallHistoryProps {
  className?: string;
  onCallContact?: (contactId: string, type: 'voice' | 'video') => void;
}

type FilterType = 'all' | 'incoming' | 'outgoing' | 'missed' | 'starred' | 'archived';
type SortBy = 'date' | 'duration' | 'name' | 'type';

export default function CallHistory({ className, onCallContact }: CallHistoryProps) {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock call history data
    const mockHistory: CallRecord[] = [
      {
        id: '1',
        participantName: 'John Doe',
        participantAvatar: '/avatars/john.png',
        type: 'outgoing',
        callType: 'video',
        duration: 1245, // 20:45
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        quality: 'excellent',
        isStarred: true,
        isArchived: false,
        notes: 'Project discussion',
        recordingUrl: '/recordings/call1.mp4'
      },
      {
        id: '2',
        participantName: 'Sarah Wilson',
        participantAvatar: '/avatars/sarah.png',
        type: 'incoming',
        callType: 'voice',
        duration: 567, // 9:27
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        quality: 'good',
        isStarred: false,
        isArchived: false
      },
      {
        id: '3',
        participantName: 'Mike Johnson',
        type: 'missed',
        callType: 'video',
        duration: 0,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        quality: 'fair',
        isStarred: false,
        isArchived: false
      },
      {
        id: '4',
        participantName: 'Team Meeting',
        type: 'outgoing',
        callType: 'video',
        duration: 3600, // 1 hour
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        quality: 'excellent',
        isStarred: true,
        isArchived: false,
        recordingUrl: '/recordings/team-meeting.mp4',
        transcriptUrl: '/transcripts/team-meeting.txt'
      }
    ];

    setCallHistory(mockHistory);
  }, []);

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return 'No answer';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getCallIcon = (record: CallRecord) => {
    const iconClass = "h-4 w-4";
    
    if (record.type === 'missed') {
      return <PhoneMissed className={cn(iconClass, "text-red-500")} />;
    }
    
    if (record.callType === 'video') {
      return record.type === 'incoming' 
        ? <Video className={cn(iconClass, "text-green-500")} />
        : <Video className={cn(iconClass, "text-blue-500")} />;
    }
    
    return record.type === 'incoming'
      ? <PhoneIncoming className={cn(iconClass, "text-green-500")} />
      : <PhoneOutgoing className={cn(iconClass, "text-blue-500")} />;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleStarToggle = (callId: string) => {
    setCallHistory(prev => prev.map(call => 
      call.id === callId ? { ...call, isStarred: !call.isStarred } : call
    ));
    toast.success('Call updated');
  };

  const handleArchiveToggle = (callId: string) => {
    setCallHistory(prev => prev.map(call => 
      call.id === callId ? { ...call, isArchived: !call.isArchived } : call
    ));
    toast.success('Call archived');
  };

  const handleDeleteCall = (callId: string) => {
    setCallHistory(prev => prev.filter(call => call.id !== callId));
    toast.success('Call deleted');
  };

  const handleDownloadRecording = (url: string, fileName: string) => {
    // Simulate download
    toast.success(`Downloading ${fileName}...`);
  };

  const handleViewTranscript = (url: string) => {
    // Open transcript in modal/new window
    toast.success('Opening transcript...');
  };

  const handleCallBack = (record: CallRecord) => {
    onCallContact?.(record.id, record.callType);
    toast.success(`Calling ${record.participantName}...`);
  };

  const filteredAndSortedHistory = callHistory
    .filter(call => {
      const matchesSearch = call.participantName.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesFilter = true;
      
      switch (filterType) {
        case 'incoming':
          matchesFilter = call.type === 'incoming';
          break;
        case 'outgoing':
          matchesFilter = call.type === 'outgoing';
          break;
        case 'missed':
          matchesFilter = call.type === 'missed';
          break;
        case 'starred':
          matchesFilter = call.isStarred;
          break;
        case 'archived':
          matchesFilter = call.isArchived;
          break;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.participantName.localeCompare(b.participantName);
        case 'duration':
          return b.duration - a.duration;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  const refreshHistory = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Call history refreshed');
    }, 1000);
  };

  const exportHistory = () => {
    // Export call history to CSV/PDF
    toast.success('Exporting call history...');
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Call History
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={refreshHistory} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search call history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'incoming', 'outgoing', 'missed', 'starred', 'archived'] as FilterType[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <div className="flex gap-2">
                {(['date', 'name', 'duration', 'type'] as SortBy[]).map((sort) => (
                  <Button
                    key={sort}
                    variant={sortBy === sort ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(sort)}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-1 p-4">
            {filteredAndSortedHistory.map((call, index) => (
              <div key={call.id}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Avatar & Call Icon */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={call.participantAvatar} />
                      <AvatarFallback>
                        {call.participantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      {getCallIcon(call)}
                    </div>
                  </div>

                  {/* Call Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{call.participantName}</h3>
                        {call.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {call.isArchived && <Archive className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(call.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDuration(call.duration)}</span>
                        <span>•</span>
                        <span className={getQualityColor(call.quality)}>
                          {call.quality}
                        </span>
                        {call.callType === 'video' && (
                          <>
                            <span>•</span>
                            <Video className="h-3 w-3" />
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {call.recordingUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDownloadRecording(call.recordingUrl!, `${call.participantName}-recording`)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {call.transcriptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleViewTranscript(call.transcriptUrl!)}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleStarToggle(call.id)}
                        >
                          {call.isStarred ? (
                            <StarOff className="h-3 w-3" />
                          ) : (
                            <Star className="h-3 w-3" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCallBack(call)}
                        >
                          <PhoneCall className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {call.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {call.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                {index < filteredAndSortedHistory.length - 1 && <Separator />}
              </div>
            ))}

            {filteredAndSortedHistory.length === 0 && (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No calls found</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}