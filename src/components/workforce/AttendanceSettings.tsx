import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { MapPin, Clock, Save } from 'lucide-react';

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

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            office_latitude: position.coords.latitude.toFixed(7),
            office_longitude: position.coords.longitude.toFixed(7),
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm">Office Latitude</Label>
                  <Input
                    id="latitude"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g., 37.7749"
                    className="min-h-[44px]"
                    value={formData.office_latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, office_latitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm">Office Longitude</Label>
                  <Input
                    id="longitude"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g., -122.4194"
                    className="min-h-[44px]"
                    value={formData.office_longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, office_longitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius" className="text-sm">Radius (meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    inputMode="numeric"
                    min="10"
                    max="1000"
                    className="min-h-[44px]"
                    value={formData.geo_fence_radius_meters}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      geo_fence_radius_meters: Math.min(Math.max(parseInt(e.target.value) || 100, 10), 1000)
                    }))}
                  />
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleGetCurrentLocation} className="w-full sm:w-auto min-h-[44px]">
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
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
