import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimeEntry {
  id: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
  hours_type?: string;
  is_billable?: boolean;
}

interface WeeklyCalendarGridProps {
  weekStart: Date;
  entries: TimeEntry[];
  onAddEntry?: (date: Date) => void;
  targetHoursPerDay?: number;
}

export function WeeklyCalendarGrid({
  weekStart,
  entries,
  onAddEntry,
  targetHoursPerDay = 8,
}: WeeklyCalendarGridProps) {
  const days = useMemo(() => {
    const dayArray = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayEntries = entries.filter(e => 
        isSameDay(parseISO(e.work_date), date)
      );
      const totalHours = dayEntries.reduce(
        (sum, e) => sum + (e.regular_hours || 0) + (e.overtime_hours || 0),
        0
      );
      
      dayArray.push({
        date,
        entries: dayEntries,
        totalHours,
        isWeekend: i >= 5,
      });
    }
    return dayArray;
  }, [weekStart, entries]);

  const weekTotal = days.reduce((sum, d) => sum + d.totalHours, 0);
  const weekTarget = targetHoursPerDay * 5; // Only weekdays

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Weekly Calendar
          </div>
          <Badge variant={weekTotal >= weekTarget ? 'default' : 'secondary'}>
            {weekTotal}h / {weekTarget}h target
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Grid View */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "border rounded-lg p-2 min-h-[120px] flex flex-col",
                day.isWeekend && "bg-muted/30",
                isSameDay(day.date, new Date()) && "ring-2 ring-primary"
              )}
            >
              {/* Day Header */}
              <div className="text-center border-b pb-1 mb-2">
                <div className="text-xs text-muted-foreground">
                  {format(day.date, 'EEE')}
                </div>
                <div className="font-medium text-sm">
                  {format(day.date, 'dd')}
                </div>
              </div>

              {/* Hours Summary */}
              <div className="flex-1">
                {day.entries.length > 0 ? (
                  <div className="space-y-1">
                    {day.entries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          entry.is_billable
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        )}
                      >
                        {entry.regular_hours + (entry.overtime_hours || 0)}h
                        {entry.project && (
                          <span className="ml-1 opacity-75">
                            - {entry.project.name.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    ))}
                    {day.entries.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{day.entries.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">-</span>
                  </div>
                )}
              </div>

              {/* Day Total & Add Button */}
              <div className="pt-2 border-t mt-auto">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      day.totalHours >= targetHoursPerDay
                        ? "text-green-600"
                        : day.totalHours > 0
                        ? "text-yellow-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {day.totalHours}h
                  </span>
                  {onAddEntry && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => onAddEntry(day.date)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden space-y-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                day.isWeekend && "bg-muted/30",
                isSameDay(day.date, new Date()) && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    {format(day.date, 'EEE')}
                  </div>
                  <div className="font-medium">{format(day.date, 'dd')}</div>
                </div>
                <div>
                  {day.entries.length > 0 ? (
                    <div className="text-sm">
                      {day.entries.length} {day.entries.length === 1 ? 'entry' : 'entries'}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No entries</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={day.totalHours >= targetHoursPerDay ? 'default' : 'secondary'}
                >
                  {day.totalHours}h
                </Badge>
                {onAddEntry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddEntry(day.date)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Week Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Week Total
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{weekTotal}h</span>
            <span className="text-sm text-muted-foreground">
              / {weekTarget}h target
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
