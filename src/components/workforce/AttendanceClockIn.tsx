import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut, MapPin, AlertCircle, CheckCircle2, MapPinOff, Navigation } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

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
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check location permission on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    setIsCheckingLocation(true);
    try {
      if (!navigator.geolocation) {
        setLocationEnabled(false);
        return;
      }
      
      // Check permission state
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationEnabled(result.state === 'granted');
        
        result.addEventListener('change', () => {
          setLocationEnabled(result.state === 'granted');
        });
      }
      
      // Try to get current location to verify
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false),
        { timeout: 5000 }
      );
    } catch (error) {
      setLocationEnabled(false);
    } finally {
      setIsCheckingLocation(false);
    }
  };

  const handleEnableLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationEnabled(true);
        toast.success('Location enabled successfully');
      },
      (error) => {
        if (error.code === 1) {
          toast.error('Location permission denied. Please enable location in your browser settings.');
        } else {
          toast.error('Failed to get location. Please try again.');
        }
        setLocationEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isClockedIn = !!todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  const isClockedOut = !!todayAttendance?.clock_out_time;
  const requiresLocation = settings?.enable_geo_fencing;

  const getStatusBadge = () => {
    if (!todayAttendance) return <Badge variant="secondary">Not Clocked In</Badge>;
    if (todayAttendance.status === 'late') return <Badge variant="destructive">Late</Badge>;
    if (isClockedOut) return <Badge variant="outline">Completed</Badge>;
    if (isClockedIn) return <Badge className="bg-green-500">Working</Badge>;
    return <Badge variant="secondary">Not Started</Badge>;
  };

  const canClockIn = !requiresLocation || locationEnabled;
  const canClockOut = !requiresLocation || locationEnabled;

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            {!isClockedIn && !isClockedOut && (
              <Button 
                size="lg" 
                className="w-full sm:w-auto sm:min-w-40 h-11 sm:h-12 text-sm sm:text-base"
                onClick={() => clockIn.mutate()}
                disabled={clockIn.isPending}
              >
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {clockIn.isPending ? 'Clocking In...' : 'Clock In'}
              </Button>
            )}

            {isClockedIn && (
              <Button 
                size="lg" 
                variant="destructive"
                className="w-full sm:w-auto sm:min-w-40 h-11 sm:h-12 text-sm sm:text-base"
                onClick={() => clockOut.mutate()}
                disabled={clockOut.isPending}
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {clockOut.isPending ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            )}

            {isClockedOut && (
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm sm:text-base">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
