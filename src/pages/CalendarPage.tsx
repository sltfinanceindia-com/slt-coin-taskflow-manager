/**
 * Standalone Calendar Page
 * Unified calendar with personal, team, and company views
 */

import { useState } from 'react';
import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Building2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'my' | 'team' | 'company'>('my');
  const { profile } = useAuth();
  const { events } = useCalendarEvents();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getEventsForDate = (date: Date) => {
    return events?.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    }) || [];
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'leave': return 'bg-amber-500';
      case 'holiday': return 'bg-green-500';
      case 'task': return 'bg-purple-500';
      case 'shift': return 'bg-cyan-500';
      default: return 'bg-muted-foreground';
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <StandalonePageLayout 
      activeTab="calendar"
      contentClassName="max-w-7xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">Manage your schedule and events</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* View Tabs */}
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="my" className="gap-2">
              <Calendar className="h-4 w-4" />
              My Calendar
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team Calendar
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4" />
              Company Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value={view} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Grid */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-4">
                    <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                      Today
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Padding for start of month */}
                    {paddingDays.map((_, idx) => (
                      <div key={`pad-${idx}`} className="aspect-square p-1" />
                    ))}
                    
                    {/* Actual days */}
                    {daysInMonth.map(day => {
                      const dayEvents = getEventsForDate(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "aspect-square p-1 rounded-lg transition-colors hover:bg-muted relative",
                            isToday(day) && "bg-primary/10 font-bold",
                            isSelected && "ring-2 ring-primary",
                            !isSameMonth(day, currentDate) && "text-muted-foreground/50"
                          )}
                        >
                          <span className={cn(
                            "text-sm",
                            isToday(day) && "text-primary font-bold"
                          )}>
                            {format(day, 'd')}
                          </span>
                          
                          {/* Event indicators */}
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayEvents.slice(0, 3).map((event, idx) => (
                                <div
                                  key={idx}
                                  className={cn("w-1.5 h-1.5 rounded-full", getEventTypeColor(event.event_type))}
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Day Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDateEvents.map((event, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={cn("w-2 h-full min-h-[40px] rounded-full", getEventTypeColor(event.event_type))} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                                </p>
                                {event.location && (
                                  <p className="text-sm text-muted-foreground mt-1 truncate">{event.location}</p>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {event.event_type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No events on this day</p>
                        <Button variant="link" className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Event
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Click a date to view events</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Holidays</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-muted-foreground">Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-sm text-muted-foreground">Shifts</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StandalonePageLayout>
  );
}
