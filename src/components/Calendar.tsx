import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'deadline' | 'training' | 'personal';
}

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    date: new Date(2024, 11, 15),
    time: '09:00',
    type: 'meeting'
  },
  {
    id: '2',
    title: 'Project Deadline',
    date: new Date(2024, 11, 20),
    time: '17:00',
    type: 'deadline'
  },
  {
    id: '3',
    title: 'Training Session',
    date: new Date(2024, 11, 25),
    time: '14:00',
    type: 'training'
  }
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events] = useState<CalendarEvent[]>(sampleEvents);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const hasEvent = (day: number) => {
    return events.some(event => 
      event.date.getDate() === day &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => 
      event.date.getDate() === day &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'training': return 'bg-green-500';
      case 'personal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 h-24 border border-border/50" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      
      days.push(
        <div
          key={day}
          className={cn(
            "p-2 h-24 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors",
            isToday(day) && "bg-primary/10 border-primary",
            isSelected(day) && "bg-primary/20"
          )}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            isToday(day) && "text-primary"
          )}>
            {day}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={cn(
                  "text-xs px-1 py-0.5 rounded text-white truncate",
                  getEventColor(event.type)
                )}
                title={`${event.time} - ${event.title}`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate.getDate()) : [];

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-7 gap-0">
                {/* Day headers */}
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground border border-border/50 bg-muted/30"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? (
                  `Events for ${selectedDate.toLocaleDateString()}`
                ) : (
                  'Select a date'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                        getEventColor(event.type)
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.time}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {event.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  {selectedDate ? 'No events for this date' : 'Select a date to view events'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .filter(event => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                        getEventColor(event.type)
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.date.toLocaleDateString()} at {event.time}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {event.type}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { type: 'meeting', label: 'Meetings' },
                  { type: 'deadline', label: 'Deadlines' },
                  { type: 'training', label: 'Training' },
                  { type: 'personal', label: 'Personal' }
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      getEventColor(type as CalendarEvent['type'])
                    )} />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}