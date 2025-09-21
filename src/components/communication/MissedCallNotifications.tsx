import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  PhoneMissed,
  PhoneCall,
  Video,
  MessageSquare,
  X,
  Bell,
  BellOff,
  Calendar,
  Clock,
  UserPlus,
  MoreHorizontal,
  Archive,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MissedCall {
  id: string;
  caller: {
    id: string;
    name: string;
    avatar?: string;
    number?: string;
  };
  timestamp: Date;
  callType: 'voice' | 'video';
  attempts: number;
  duration: number;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  reason: 'declined' | 'no_answer' | 'busy' | 'offline';
  hasVoicemail?: boolean;
  voicemailDuration?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface MissedCallNotificationsProps {
  className?: string;
  onCallBack?: (callerId: string, type: 'voice' | 'video') => void;
  onMessage?: (callerId: string) => void;
  onMarkAsRead?: (callId: string) => void;
  onArchive?: (callId: string) => void;
  onDelete?: (callId: string) => void;
  onStar?: (callId: string) => void;
}

export default function MissedCallNotifications({
  className,
  onCallBack,
  onMessage,
  onMarkAsRead,
  onArchive,
  onDelete,
  onStar
}: MissedCallNotificationsProps) {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // Mock missed calls data
    const mockMissedCalls: MissedCall[] = [
      {
        id: '1',
        caller: {
          id: 'user1',
          name: 'John Doe',
          avatar: '/avatars/john.png',
          number: '+1234567890'
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        callType: 'video',
        attempts: 3,
        duration: 0,
        isRead: false,
        isStarred: true,
        isArchived: false,
        reason: 'no_answer',
        hasVoicemail: true,
        voicemailDuration: 45,
        priority: 'high'
      },
      {
        id: '2',
        caller: {
          id: 'user2',
          name: 'Sarah Wilson',
          avatar: '/avatars/sarah.png',
          number: '+0987654321'
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        callType: 'voice',
        attempts: 1,
        duration: 0,
        isRead: false,
        isStarred: false,
        isArchived: false,
        reason: 'declined',
        hasVoicemail: false,
        priority: 'normal'
      },
      {
        id: '3',
        caller: {
          id: 'user3',
          name: 'Mike Johnson',
          number: '+1122334455'
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        callType: 'voice',
        attempts: 2,
        duration: 0,
        isRead: true,
        isStarred: false,
        isArchived: false,
        reason: 'busy',
        hasVoicemail: false,
        priority: 'low'
      }
    ];

    setMissedCalls(mockMissedCalls);
  }, []);

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
    return `${days} days ago`;
  };

  const getReasonText = (reason: MissedCall['reason']): string => {
    switch (reason) {
      case 'declined': return 'Call declined';
      case 'no_answer': return 'No answer';
      case 'busy': return 'Line busy';
      case 'offline': return 'Offline';
      default: return 'Missed call';
    }
  };

  const getReasonColor = (reason: MissedCall['reason']): string => {
    switch (reason) {
      case 'declined': return 'text-red-500';
      case 'no_answer': return 'text-yellow-500';
      case 'busy': return 'text-orange-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: MissedCall['priority']): string => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'normal': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
      default: return '';
    }
  };

  const handleCallBack = (call: MissedCall) => {
    onCallBack?.(call.caller.id, call.callType);
    toast.success(`Calling ${call.caller.name}...`);
    markAsRead(call.id);
  };

  const handleMessage = (call: MissedCall) => {
    onMessage?.(call.caller.id);
    toast.success(`Opening chat with ${call.caller.name}...`);
    markAsRead(call.id);
  };

  const markAsRead = (callId: string) => {
    setMissedCalls(prev => prev.map(call => 
      call.id === callId ? { ...call, isRead: true } : call
    ));
    onMarkAsRead?.(callId);
  };

  const handleStar = (callId: string) => {
    setMissedCalls(prev => prev.map(call => 
      call.id === callId ? { ...call, isStarred: !call.isStarred } : call
    ));
    onStar?.(callId);
    toast.success('Call updated');
  };

  const handleArchive = (callId: string) => {
    setMissedCalls(prev => prev.map(call => 
      call.id === callId ? { ...call, isArchived: !call.isArchived } : call
    ));
    onArchive?.(callId);
    toast.success('Call archived');
  };

  const handleDelete = (callId: string) => {
    setMissedCalls(prev => prev.filter(call => call.id !== callId));
    onDelete?.(callId);
    toast.success('Call deleted');
  };

  const markAllAsRead = () => {
    setMissedCalls(prev => prev.map(call => ({ ...call, isRead: true })));
    toast.success('All calls marked as read');
  };

  const deleteAll = () => {
    setMissedCalls([]);
    toast.success('All missed calls deleted');
  };

  const filteredCalls = missedCalls.filter(call => {
    switch (filter) {
      case 'unread': return !call.isRead;
      case 'starred': return call.isStarred;
      case 'archived': return call.isArchived;
      default: return !call.isArchived;
    }
  });

  const unreadCount = missedCalls.filter(call => !call.isRead && !call.isArchived).length;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PhoneMissed className="h-5 w-5 text-red-500" />
            Missed Calls
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'unread', 'starred', 'archived'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType === 'unread' && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Bulk Actions */}
        {filteredCalls.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={deleteAll}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 p-4">
            {filteredCalls.map((call, index) => (
              <div key={call.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border-l-4",
                    !call.isRead && "bg-blue-50/50",
                    getPriorityColor(call.priority)
                  )}
                >
                  {/* Avatar & Status */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={call.caller.avatar} />
                      <AvatarFallback>
                        {call.caller.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      {call.callType === 'video' ? (
                        <Video className="h-3 w-3 text-red-500" />
                      ) : (
                        <PhoneMissed className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    {!call.isRead && (
                      <div className="absolute -top-1 -left-1 h-3 w-3 bg-blue-500 rounded-full" />
                    )}
                  </div>

                  {/* Call Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{call.caller.name}</h3>
                        {call.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {call.hasVoicemail && (
                          <Badge variant="secondary" className="text-xs">
                            Voicemail
                          </Badge>
                        )}
                        {call.attempts > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {call.attempts} calls
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(call.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={getReasonColor(call.reason)}>
                          {getReasonText(call.reason)}
                        </span>
                        {call.hasVoicemail && call.voicemailDuration && (
                          <>
                            <span>•</span>
                            <span className="text-muted-foreground">
                              {call.voicemailDuration}s voicemail
                            </span>
                          </>
                        )}
                        {call.caller.number && (
                          <>
                            <span>•</span>
                            <span className="text-muted-foreground">
                              {call.caller.number}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCallBack(call)}
                        >
                          <PhoneCall className="h-3 w-3 text-green-500" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMessage(call)}
                        >
                          <MessageSquare className="h-3 w-3 text-blue-500" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleStar(call.id)}
                        >
                          <Star className={cn("h-3 w-3", call.isStarred ? "text-yellow-500 fill-current" : "text-muted-foreground")} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleArchive(call.id)}
                        >
                          <Archive className="h-3 w-3 text-muted-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDelete(call.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Priority Indicator */}
                    {call.priority === 'urgent' && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < filteredCalls.length - 1 && <Separator />}
              </div>
            ))}

            {filteredCalls.length === 0 && (
              <div className="text-center py-12">
                <PhoneMissed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No missed calls' : `No ${filter} missed calls`}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}