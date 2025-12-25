import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { MapPin, Clock, Save, AlertTriangle, CheckCircle2, Navigation, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AttendanceSettings: React.FC = () => {
  const { settings, updateSettings } = useGeoAttendance();

  const [formData, setFormData] = useState({
    enable_geo_fencing: false,
    office_latitude: '',
    office_longitude: '',
    geo_fence_radius_meters: 100,
    work_start_time: '09:00',
    work_end_time: '18:00',
    late_threshold_minutes: 15,
    early_leave_threshold_minutes: 15,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        enable_geo_fencing: settings.enable_geo_fencing,
        office_latitude: settings.office_latitude?.toString() || '',
        office_longitude: settings.office_longitude?.toString() || '',
        geo_fence_radius_meters: settings.geo_fence_radius_meters,
        work_start_time: settings.work_start_time,
        work_end_time: settings.work_end_time,
        late_threshold_minutes: settings.late_threshold_minutes,
        early_leave_threshold_minutes: settings.early_leave_threshold_minutes,
      });
    }
  }, [settings]);

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          office_latitude: position.coords.latitude.toFixed(7),
          office_longitude: position.coords.longitude.toFixed(7),
        }));
        setIsGettingLocation(false);
        toast({
          title: "Location Captured",
          description: "Office coordinates have been set to your current location.",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync({
      enable_geo_fencing: formData.enable_geo_fencing,
      office_latitude: formData.office_latitude ? parseFloat(formData.office_latitude) : null,
      office_longitude: formData.office_longitude ? parseFloat(formData.office_longitude) : null,
      geo_fence_radius_meters: formData.geo_fence_radius_meters,
      work_start_time: formData.work_start_time,
      work_end_time: formData.work_end_time,
      late_threshold_minutes: formData.late_threshold_minutes,
      early_leave_threshold_minutes: formData.early_leave_threshold_minutes,
    });
  };
  const hasValidCoordinates = formData.office_latitude && formData.office_longitude;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Geo-Fencing Setup Alert */}
      {formData.enable_geo_fencing && !hasValidCoordinates && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Office Location Required</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Geo-fencing is enabled but no office location is set. Employees won't be able to clock in until you configure the office coordinates below.
          </AlertDescription>
        </Alert>
      )}

      {formData.enable_geo_fencing && hasValidCoordinates && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-400">Geo-Fencing Active</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Office location is configured. Employees must be within {formData.geo_fence_radius_meters}m of the office to clock in.
          </AlertDescription>
        </Alert>
      )}
      {/* Work Hours */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Work Hours
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Configure standard working hours and thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="work-start" className="text-sm">Work Start Time</Label>
              <Input
                id="work-start"
                type="time"
                className="min-h-[44px]"
                value={formData.work_start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, work_start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-end" className="text-sm">Work End Time</Label>
              <Input
                id="work-end"
                type="time"
                className="min-h-[44px]"
                value={formData.work_end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, work_end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="late-threshold" className="text-sm">Late Threshold (minutes)</Label>
              <Input
                id="late-threshold"
                type="number"
                inputMode="numeric"
                min="0"
                max="120"
                className="min-h-[44px]"
                value={formData.late_threshold_minutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  late_threshold_minutes: Math.min(Math.max(parseInt(e.target.value) || 0, 0), 120)
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Grace period before marking as late
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="early-leave" className="text-sm">Early Leave Threshold (minutes)</Label>
              <Input
                id="early-leave"
                type="number"
                inputMode="numeric"
                min="0"
                max="120"
                className="min-h-[44px]"
                value={formData.early_leave_threshold_minutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  early_leave_threshold_minutes: Math.min(Math.max(parseInt(e.target.value) || 0, 0), 120)
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Minutes before work end to flag early leave
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geo-Fencing */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            Geo-Fencing
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Restrict clock in/out to office location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label htmlFor="enable-geo" className="flex items-center justify-between gap-4 cursor-pointer p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Enable Geo-Fencing</span>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Require employees to be within office area to clock in
              </p>
            </div>
            <Switch
              id="enable-geo"
              checked={formData.enable_geo_fencing}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_geo_fencing: checked }))}
            />
          </label>

          {formData.enable_geo_fencing && (
            <div className="space-y-4 pt-4 border-t">
              {/* Location Info Box */}
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
                  <strong>How to set up:</strong> Stand at your office entrance and click "Use Current Location" to automatically capture the coordinates. Alternatively, you can manually enter coordinates from Google Maps.
                </AlertDescription>
              </Alert>

              {/* Quick Location Capture */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Quick Setup</p>
                    <p className="text-xs text-muted-foreground">
                      Capture your current GPS location as the office address
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="default" 
                    onClick={handleGetCurrentLocation} 
                    disabled={isGettingLocation}
                    className="min-h-[44px]"
                  >
                    <Navigation className={`h-4 w-4 mr-2 ${isGettingLocation ? 'animate-pulse' : ''}`} />
                    {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </Button>
                </div>
                
                {locationError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{locationError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Manual Coordinate Entry */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Office Coordinates</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm flex items-center gap-1">
                      Latitude
                      {formData.office_latitude && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="latitude"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 12.9716"
                      className={`min-h-[44px] ${formData.office_latitude ? 'border-green-500' : ''}`}
                      value={formData.office_latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, office_latitude: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm flex items-center gap-1">
                      Longitude
                      {formData.office_longitude && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="longitude"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 77.5946"
                      className={`min-h-[44px] ${formData.office_longitude ? 'border-green-500' : ''}`}
                      value={formData.office_longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, office_longitude: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius" className="text-sm">Allowed Radius</Label>
                    <div className="relative">
                      <Input
                        id="radius"
                        type="number"
                        inputMode="numeric"
                        min="10"
                        max="1000"
                        className="min-h-[44px] pr-12"
                        value={formData.geo_fence_radius_meters}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          geo_fence_radius_meters: Math.min(Math.max(parseInt(e.target.value) || 100, 10), 1000)
                        }))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        meters
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Employees within this distance can clock in
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {hasValidCoordinates && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-green-800 dark:text-green-400">
                        Office Location Configured
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Lat: {formData.office_latitude}°, Long: {formData.office_longitude}°
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Employees can clock in within a {formData.geo_fence_radius_meters}m radius of this point.
                      </p>
                      <a 
                        href={`https://www.google.com/maps?q=${formData.office_latitude},${formData.office_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 dark:text-green-300 underline hover:no-underline inline-flex items-center gap-1"
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={updateSettings.isPending} className="w-full sm:w-auto min-h-[44px]">
        <Save className="h-4 w-4 mr-2" />
        {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
};
