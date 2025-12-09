import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AttendanceDashboard: React.FC = () => {
  const { allAttendance, isAdminLoading } = useGeoAttendance();

  const stats = {
    present: allAttendance.filter(a => a.status === 'present' || a.status === 'late').length,
    late: allAttendance.filter(a => a.status === 'late').length,
    onTime: allAttendance.filter(a => a.status === 'present').length,
    wfh: allAttendance.filter(a => a.status === 'wfh').length,
  };

  if (isAdminLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Present</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.present}</div>
            <p className="text-xs text-muted-foreground">Employees today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTime}</div>
            <p className="text-xs text-muted-foreground">Arrived on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Arrived late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working from Home</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.wfh}</div>
            <p className="text-xs text-muted-foreground">Remote today</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance - {format(new Date(), 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {allAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records for today
            </div>
          ) : (
            <div className="space-y-4">
              {allAttendance.map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={record.employee?.avatar_url || undefined} />
                      <AvatarFallback>
                        {record.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{record.employee?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{record.employee?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">
                        In: {record.clock_in_time ? format(new Date(record.clock_in_time), 'HH:mm') : '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Out: {record.clock_out_time ? format(new Date(record.clock_out_time), 'HH:mm') : '-'}
                      </p>
                    </div>
                    <Badge 
                      className={
                        record.status === 'present' ? 'bg-green-500' :
                        record.status === 'late' ? 'bg-amber-500' :
                        record.status === 'wfh' ? 'bg-indigo-500' :
                        'bg-gray-500'
                      }
                    >
                      {record.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
