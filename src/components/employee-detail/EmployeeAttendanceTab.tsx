/**
 * Employee Attendance Tab
 * Monthly calendar view, attendance stats, regularization requests
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, isToday, addMonths, subMonths,
  startOfWeek, endOfWeek, parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';

interface EmployeeAttendanceTabProps {
  employeeId: string;
}

export function EmployeeAttendanceTab({ employeeId }: EmployeeAttendanceTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const { data: attendance = [] } = useQuery({
    queryKey: ['employee-attendance', employeeId, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
  });

  const attendanceMap = useMemo(() => {
    const map = new Map<string, any>();
    attendance.forEach((record: any) => {
      map.set(record.attendance_date, record);
    });
    return map;
  }, [attendance]);

  const stats = useMemo(() => {
    const present = attendance.filter((a: any) => a.status === 'present').length;
    const absent = attendance.filter((a: any) => a.status === 'absent').length;
    const late = attendance.filter((a: any) => a.status === 'late').length;
    const wfh = attendance.filter((a: any) => a.status === 'wfh').length;
    return { present, absent, late, wfh, total: attendance.length };
  }, [attendance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-amber-500';
      case 'wfh': return 'bg-blue-500';
      case 'leave': return 'bg-purple-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Present</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.present}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Absent</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.absent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Late</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.late}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">WFH</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.wfh}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Attendance Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const record = attendanceMap.get(dateStr);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[60px] p-2 border rounded-lg transition-colors',
                    !isCurrentMonth && 'bg-muted/30 opacity-50',
                    isToday(day) && 'border-primary'
                  )}
                >
                  <div className={cn(
                    'text-sm font-medium',
                    isToday(day) && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </div>
                  {record && (
                    <div className={cn(
                      'mt-1 text-xs px-1 py-0.5 rounded text-white text-center capitalize',
                      getStatusColor(record.status)
                    )}>
                      {record.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span>Late</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>WFH</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span>Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
