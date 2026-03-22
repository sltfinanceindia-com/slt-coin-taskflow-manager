import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin } from 'lucide-react';

const statusConfig = {
  present: { label: 'Present', className: 'bg-green-500' },
  late: { label: 'Late', className: 'bg-amber-500' },
  absent: { label: 'Absent', className: 'bg-red-500' },
  half_day: { label: 'Half Day', className: 'bg-blue-500' },
  on_leave: { label: 'On Leave', className: 'bg-purple-500' },
  wfh: { label: 'WFH', className: 'bg-indigo-500' },
};

export const AttendanceHistory: React.FC = () => {
  const { myAttendance, isLoading } = useGeoAttendance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          Attendance History (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {myAttendance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No attendance records found
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {myAttendance.map((record) => {
                const status = statusConfig[record.status as keyof typeof statusConfig] || { label: record.status, className: 'bg-gray-500' };
                return (
                  <div key={record.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="font-medium text-sm">
                        {format(new Date(record.attendance_date), 'EEE, MMM d')}
                      </span>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Clock In</span>
                        <p className="font-medium">
                          {record.clock_in_time 
                            ? format(new Date(record.clock_in_time), 'HH:mm')
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Clock Out</span>
                        <p className="font-medium">
                          {record.clock_out_time 
                            ? format(new Date(record.clock_out_time), 'HH:mm')
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Hours</span>
                        <p className="font-medium">
                          {record.total_hours !== null 
                            ? `${record.total_hours.toFixed(1)}h`
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Overtime</span>
                        <p className="font-medium">
                          {record.overtime_hours && record.overtime_hours > 0
                            ? <span className="text-amber-600">+{record.overtime_hours.toFixed(1)}h</span>
                            : '-'
                          }
                        </p>
                      </div>
                    </div>
                    {record.clock_in_within_geofence !== null && (
                      <div className="flex items-center gap-1 text-xs pt-1 border-t">
                        <MapPin className={`h-3 w-3 ${record.clock_in_within_geofence ? 'text-green-500' : 'text-amber-500'}`} />
                        <span className={record.clock_in_within_geofence ? 'text-green-600' : 'text-amber-600'}>
                          {record.clock_in_within_geofence ? 'Within office area' : 'Outside office area'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAttendance.map((record) => {
                    const status = statusConfig[record.status as keyof typeof statusConfig] || { label: record.status, className: 'bg-gray-500' };
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.attendance_date), 'EEE, MMM d')}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.className}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {record.clock_in_time 
                            ? format(new Date(record.clock_in_time), 'HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {record.clock_out_time 
                            ? format(new Date(record.clock_out_time), 'HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {record.total_hours !== null 
                            ? `${record.total_hours.toFixed(1)}h`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {record.overtime_hours && record.overtime_hours > 0
                            ? <span className="text-amber-600">+{record.overtime_hours.toFixed(1)}h</span>
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {record.clock_in_within_geofence !== null && (
                              <MapPin className={`h-4 w-4 ${record.clock_in_within_geofence ? 'text-green-500' : 'text-amber-500'}`} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
