import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWFH } from '@/hooks/useWFH';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';
import { Calendar, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export const WFHCalendar: React.FC = () => {
  const { allRequests } = useWFH();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get approved WFH requests
  const approvedRequests = allRequests.filter(r => r.status === 'approved');

  // Group by date
  const wfhByDate = approvedRequests.reduce((acc, request) => {
    const dateKey = request.request_date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(request);
    return acc;
  }, {} as Record<string, typeof approvedRequests>);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          WFH Calendar - {format(now, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24" />
          ))}

          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayRequests = wfhByDate[dateKey] || [];
            const isCurrentDay = isToday(day);
            const isWeekendDay = isWeekend(day);

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-24 p-2 rounded-lg border transition-colors",
                  isCurrentDay && "ring-2 ring-primary",
                  isWeekendDay && "bg-muted/50",
                  !isWeekendDay && "bg-card hover:bg-accent/50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentDay && "text-primary",
                  isWeekendDay && "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </div>

                {dayRequests.length > 0 && (
                  <div className="space-y-1">
                    {dayRequests.slice(0, 2).map(request => (
                      <div 
                        key={request.id}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={request.employee?.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {request.employee?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-muted-foreground">
                          {request.employee?.full_name?.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                    {dayRequests.length > 2 && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        +{dayRequests.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-indigo-500" />
            <span>Working from Home</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/50 border" />
            <span>Weekend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
