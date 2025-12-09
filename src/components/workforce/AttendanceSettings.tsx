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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Work Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Work Hours
          </CardTitle>
          <CardDescription>Configure standard working hours and thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="work-start">Work Start Time</Label>
              <Input
                id="work-start"
                type="time"
                value={formData.work_start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, work_start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-end">Work End Time</Label>
              <Input
                id="work-end"
                type="time"
                value={formData.work_end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, work_end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="late-threshold">Late Threshold (minutes)</Label>
              <Input
                id="late-threshold"
                type="number"
                min="0"
                value={formData.late_threshold_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, late_threshold_minutes: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                Grace period before marking as late
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="early-leave">Early Leave Threshold (minutes)</Label>
              <Input
                id="early-leave"
                type="number"
                min="0"
                value={formData.early_leave_threshold_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, early_leave_threshold_minutes: parseInt(e.target.value) || 0 }))}
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geo-Fencing
          </CardTitle>
          <CardDescription>Restrict clock in/out to office location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-geo">Enable Geo-Fencing</Label>
              <p className="text-sm text-muted-foreground">
                Require employees to be within office area to clock in
              </p>
            </div>
            <Switch
              id="enable-geo"
              checked={formData.enable_geo_fencing}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_geo_fencing: checked }))}
            />
          </div>

          {formData.enable_geo_fencing && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Office Latitude</Label>
                  <Input
                    id="latitude"
                    type="text"
                    placeholder="e.g., 37.7749"
                    value={formData.office_latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, office_latitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Office Longitude</Label>
                  <Input
                    id="longitude"
                    type="text"
                    placeholder="e.g., -122.4194"
                    value={formData.office_longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, office_longitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.geo_fence_radius_meters}
                    onChange={(e) => setFormData(prev => ({ ...prev, geo_fence_radius_meters: parseInt(e.target.value) || 100 }))}
                  />
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleGetCurrentLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={updateSettings.isPending}>
        <Save className="h-4 w-4 mr-2" />
        {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
};
