import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AttendanceClockIn: React.FC = () => {
  const { 
    settings, 
    todayAttendance, 
    locationError, 
    isLoading, 
    clockIn, 
    clockOut 
  } = useGeoAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isClockedIn = !!todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  const isClockedOut = !!todayAttendance?.clock_out_time;

  const getStatusBadge = () => {
    if (!todayAttendance) return <Badge variant="secondary">Not Clocked In</Badge>;
    if (todayAttendance.status === 'late') return <Badge variant="destructive">Late</Badge>;
    if (isClockedOut) return <Badge variant="outline">Completed</Badge>;
    if (isClockedIn) return <Badge className="bg-green-500">Working</Badge>;
    return <Badge variant="secondary">Not Started</Badge>;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Clock Card */}
      <Card className="md:col-span-2">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-mono">
            {format(currentTime, 'HH:mm:ss')}
          </CardTitle>
          <CardDescription className="text-lg">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            {getStatusBadge()}
          </div>

          {settings?.enable_geo_fencing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location tracking enabled ({settings.geo_fence_radius_meters}m radius)</span>
            </div>
          )}

          {locationError && (
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            {!isClockedIn && !isClockedOut && (
              <Button 
                size="lg" 
                className="min-w-40"
                onClick={() => clockIn.mutate()}
                disabled={clockIn.isPending}
              >
                <LogIn className="h-5 w-5 mr-2" />
                {clockIn.isPending ? 'Clocking In...' : 'Clock In'}
              </Button>
            )}

            {isClockedIn && (
              <Button 
                size="lg" 
                variant="destructive"
                className="min-w-40"
                onClick={() => clockOut.mutate()}
                disabled={clockOut.isPending}
              >
                <LogOut className="h-5 w-5 mr-2" />
                {clockOut.isPending ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            )}

            {isClockedOut && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Completed for today</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      {todayAttendance && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Clock In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {todayAttendance.clock_in_time 
                  ? format(new Date(todayAttendance.clock_in_time), 'HH:mm:ss')
                  : '--:--:--'
                }
              </p>
              {todayAttendance.clock_in_within_geofence !== null && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span className={todayAttendance.clock_in_within_geofence ? 'text-green-600' : 'text-amber-600'}>
                    {todayAttendance.clock_in_within_geofence ? 'Within office area' : 'Outside office area'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Clock Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {todayAttendance.clock_out_time 
                  ? format(new Date(todayAttendance.clock_out_time), 'HH:mm:ss')
                  : '--:--:--'
                }
              </p>
              {todayAttendance.total_hours !== null && (
                <p className="text-sm text-muted-foreground mt-2">
                  Total: {todayAttendance.total_hours.toFixed(2)} hours
                  {todayAttendance.overtime_hours && todayAttendance.overtime_hours > 0 && (
                    <span className="text-amber-600 ml-2">
                      (+{todayAttendance.overtime_hours.toFixed(2)} overtime)
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
