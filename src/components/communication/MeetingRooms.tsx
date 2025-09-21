import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  Plus,
  Settings,
  Copy,
  ExternalLink,
  Play,
  Square,
  Mic,
  MicOff,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { useWebRTC, type MeetingRoom } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';

interface MeetingRoomsProps {
  className?: string;
}

export default function MeetingRooms({ className }: MeetingRoomsProps) {
  const { meetingRooms, createMeetingRoom, joinMeetingRoom, fetchMeetingRooms } = useWebRTC();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: '',
    maxParticipants: 10
  });

  useEffect(() => {
    fetchMeetingRooms();
  }, [fetchMeetingRooms]);

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Meeting title is required",
        variant: "destructive"
      });
      return;
    }

    const startDate = newMeeting.scheduledStart ? new Date(newMeeting.scheduledStart) : new Date();
    const endDate = newMeeting.scheduledEnd ? new Date(newMeeting.scheduledEnd) : new Date(Date.now() + 3600000);

    await createMeetingRoom(
      newMeeting.title,
      newMeeting.description || undefined,
      startDate,
      endDate
    );

    setNewMeeting({
      title: '',
      description: '',
      scheduledStart: '',
      scheduledEnd: '',
      maxParticipants: 10
    });
    setIsCreateDialogOpen(false);
    fetchMeetingRooms();
  };

  const handleJoinMeeting = async (meetingId: string, withVideo: boolean = false) => {
    await joinMeetingRoom(meetingId, withVideo);
  };

  const copyMeetingLink = (meetingId: string) => {
    const meetingUrl = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(meetingUrl);
    toast({
      title: "Link Copied",
      description: "Meeting link copied to clipboard"
    });
  };

  const getStatusBadge = (meeting: MeetingRoom) => {
    switch (meeting.status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{meeting.status}</Badge>;
    }
  };

  const formatMeetingTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const upcomingMeetings = meetingRooms.filter(m => 
    m.status === 'scheduled' && new Date(m.scheduled_start) > new Date()
  );
  
  const activeMeetings = meetingRooms.filter(m => m.status === 'active');
  const pastMeetings = meetingRooms.filter(m => 
    m.status === 'ended' || (m.status === 'scheduled' && new Date(m.scheduled_start) < new Date())
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meeting Rooms</h2>
          <p className="text-muted-foreground">Schedule and join video meetings</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  placeholder="Enter meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Meeting agenda or description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={newMeeting.scheduledStart}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, scheduledStart: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={newMeeting.scheduledEnd}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, scheduledEnd: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMeeting}>
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              className="flex-1 gap-2" 
              onClick={() => handleJoinMeeting('instant', true)}
            >
              <Video className="h-4 w-4" />
              Start Instant Meeting
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => handleJoinMeeting('instant', false)}
            >
              <Phone className="h-4 w-4" />
              Start Audio Call
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Meetings */}
      {activeMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Active Meetings ({activeMeetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeMeetings.map((meeting) => (
                <div key={meeting.id} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        {getStatusBadge(meeting)}
                        {meeting.is_recording && (
                          <Badge variant="destructive">
                            <Square className="h-3 w-3 mr-1 fill-current" />
                            Recording
                          </Badge>
                        )}
                      </div>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Started {formatDistanceToNow(new Date(meeting.scheduled_start))} ago
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meeting.participants.length}/{meeting.max_participants}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => copyMeetingLink(meeting.id)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" onClick={() => handleJoinMeeting(meeting.id, true)}>
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings ({upcomingMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        {getStatusBadge(meeting)}
                      </div>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatMeetingTime(meeting.scheduled_start)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Max {meeting.max_participants} participants
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => copyMeetingLink(meeting.id)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={new Date(meeting.scheduled_start) > new Date()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinMeeting(meeting.id, true)}
                        disabled={new Date(meeting.scheduled_start) > new Date()}
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No upcoming meetings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule a meeting to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      {pastMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {pastMeetings.slice(0, 10).map((meeting) => (
                  <div key={meeting.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{meeting.title}</h4>
                          {getStatusBadge(meeting)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatMeetingTime(meeting.scheduled_start)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}