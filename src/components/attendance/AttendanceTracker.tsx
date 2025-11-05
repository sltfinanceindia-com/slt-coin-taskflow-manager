import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Clock, LogIn, LogOut, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';

export function AttendanceTracker() {
  const { profile } = useAuth();
  const { 
    loading, 
    getWeeklyAttendance, 
    getMonthlyAttendance,
    getDailyAttendance,
    formatDuration,
    getAttendanceStatusColor,
    getAttendanceStatusText
  } = useAttendance();
  
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchAttendance = async () => {
      const data = viewMode === 'week' 
        ? await getWeeklyAttendance(profile.id)
        : await getMonthlyAttendance(profile.id);
      setAttendanceRecords(data);
    };

    fetchAttendance();
  }, [profile, viewMode, getWeeklyAttendance, getMonthlyAttendance]);

  const todayRecord = attendanceRecords.find(
    r => r.session_date === new Date().toISOString().split('T')[0]
  );

  const totalHoursThisWeek = attendanceRecords
    .filter(r => {
      const recordDate = new Date(r.session_date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    })
    .reduce((sum, r) => sum + (r.total_minutes || 0), 0);

  const averageHoursPerDay = attendanceRecords.length > 0
    ? attendanceRecords.reduce((sum, r) => sum + (r.total_minutes || 0), 0) / attendanceRecords.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attendance Tracking</h2>
        <p className="text-muted-foreground">Monitor your login/logout sessions and work hours</p>
      </div>

      {/* Today's Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${todayRecord ? getAttendanceStatusColor(todayRecord.attendance_status) : 'bg-gray-400'}`}>
                <LogIn className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">First Login</p>
                <p className="text-lg font-bold">
                  {todayRecord?.first_login 
                    ? format(new Date(todayRecord.first_login), 'HH:mm')
                    : '--:--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500">
                <LogOut className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Logout</p>
                <p className="text-lg font-bold">
                  {todayRecord?.last_logout 
                    ? format(new Date(todayRecord.last_logout), 'HH:mm')
                    : '--:--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Today's Hours</p>
                <p className="text-lg font-bold">
                  {todayRecord ? formatDuration(todayRecord.total_minutes) : '0h 0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className={todayRecord ? getAttendanceStatusColor(todayRecord.attendance_status) : 'bg-gray-400'}>
                  {todayRecord ? getAttendanceStatusText(todayRecord.attendance_status) : 'No Data'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly/Monthly Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>View your attendance records</CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {formatDuration(totalHoursThisWeek)}
                </p>
                <p className="text-sm text-muted-foreground">Total This Week</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {formatDuration(averageHoursPerDay)}
                </p>
                <p className="text-sm text-muted-foreground">Average Per Day</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {attendanceRecords.length}
                </p>
                <p className="text-sm text-muted-foreground">Days Present</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading attendance...</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.session_date}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getAttendanceStatusColor(record.attendance_status)}`} />
                      <div>
                        <p className="font-medium">
                          {format(new Date(record.session_date), 'EEEE, MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.first_login && format(new Date(record.first_login), 'HH:mm')} - 
                          {record.last_logout && ` ${format(new Date(record.last_logout), 'HH:mm')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatDuration(record.total_minutes)}</p>
                      <Badge variant="outline" className="text-xs">
                        {record.session_count} session{record.session_count > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
