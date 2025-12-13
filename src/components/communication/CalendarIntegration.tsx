import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, Video, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'reminder' | 'deadline';
  attendees?: string[];
  location?: string;
  isOnline?: boolean;
  meetingUrl?: string;
}

interface CalendarIntegrationProps {
  onEventSelect?: (event: CalendarEvent) => void;
  onCreateEvent?: (event: Partial<CalendarEvent>) => void;
  className?: string;
}

export default function CalendarIntegration({ 
  onEventSelect, 
  onCreateEvent, 
  className 
}: CalendarIntegrationProps) {
  const { profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = addDays(startOfWeek, 14); // Get 2 weeks of events

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', profile.id)
        .gte('start_time', startOfWeek.toISOString())
        .lte('start_time', endOfWeek.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      const mappedEvents: CalendarEvent[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        type: (event.event_type as 'meeting' | 'reminder' | 'deadline') || 'meeting',
        attendees: event.attendees || undefined,
        location: event.location || undefined,
        isOnline: event.is_online || false,
        meetingUrl: event.meeting_url || undefined
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return <Video className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'reminder': return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'reminder': return 'bg-yellow-500';
    }
  };

  const formatEventTime = (start: Date, end: Date) => {
    const startTime = format(start, 'HH:mm');
    const endTime = format(end, 'HH:mm');
    return `${startTime} - ${endTime}`;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: Record<string, CalendarEvent[]> = {};
    
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: profile.id,
          organization_id: profile.organization_id,
          title: eventData.title || 'New Event',
          description: eventData.description,
          start_time: eventData.start?.toISOString() || new Date().toISOString(),
          end_time: eventData.end?.toISOString() || new Date().toISOString(),
          event_type: eventData.type || 'meeting',
          is_online: eventData.isOnline || false,
          meeting_url: eventData.meetingUrl,
          location: eventData.location
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        type: (data.event_type as 'meeting' | 'reminder' | 'deadline') || 'meeting',
        isOnline: data.is_online || false,
        meetingUrl: data.meeting_url || undefined,
        location: data.location || undefined
      };

      setEvents(prev => [...prev, newEvent].sort((a, b) => a.start.getTime() - b.start.getTime()));
      onCreateEvent?.(newEvent);
      setShowCreateForm(false);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleJoinMeeting = (event: CalendarEvent) => {
    if (event.meetingUrl) {
      window.open(event.meetingUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">Calendar</h3>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const groupedEvents = groupEventsByDate(events);

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Upcoming Events</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm}
          >
            Schedule Meeting
          </Button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <Card className="p-4 bg-muted/50">
            <CreateEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
            />
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            return (
              <div key={dateKey}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {getDateLabel(date)}
                </h4>
                <div className="space-y-2">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onEventSelect?.(event)}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        getEventColor(event.type)
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getEventIcon(event.type)}
                          <h5 className="font-medium text-sm truncate">
                            {event.title}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatEventTime(event.start, event.end)}
                        </p>
                        
                        {event.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {event.attendees && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{event.attendees.length} attendees</span>
                            </div>
                          )}
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.isOnline && (
                            <Badge variant="secondary" className="text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {event.meetingUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinMeeting(event);
                          }}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {Object.keys(groupedEvents).length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">No upcoming events</h4>
              <p className="text-sm text-muted-foreground">
                Schedule a meeting to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface CreateEventFormProps {
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

function CreateEventForm({ onSubmit, onCancel }: CreateEventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('meeting');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isOnline, setIsOnline] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    onSubmit({
      title,
      description,
      type,
      start: startDateTime,
      end: endDateTime,
      isOnline,
      meetingUrl: isOnline ? 'https://meet.google.com/new' : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Event Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="meeting">Meeting</option>
            <option value="reminder">Reminder</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Start Time</label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">End Time</label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isOnline"
          checked={isOnline}
          onChange={(e) => setIsOnline(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="isOnline" className="text-sm">
          Online meeting
        </label>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" className="flex-1">
          Create Event
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}