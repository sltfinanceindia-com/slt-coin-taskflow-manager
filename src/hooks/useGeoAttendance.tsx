import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AttendanceSettings {
  id: string;
  office_latitude: number | null;
  office_longitude: number | null;
  geo_fence_radius_meters: number;
  enable_geo_fencing: boolean;
  work_start_time: string;
  work_end_time: string;
  late_threshold_minutes: number;
  early_leave_threshold_minutes: number;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
  clock_out_latitude: number | null;
  clock_out_longitude: number | null;
  clock_in_within_geofence: boolean | null;
  clock_out_within_geofence: boolean | null;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'wfh';
  total_hours: number | null;
  overtime_hours: number | null;
  notes: string | null;
  employee?: { full_name: string; email: string; avatar_url: string | null };
}

// Calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useGeoAttendance = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch attendance settings
  const { data: settings } = useQuery({
    queryKey: ['attendance-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceSettings | null;
    },
  });

  // Fetch today's attendance for current user
  const { data: todayAttendance, isLoading: loadingToday } = useQuery({
    queryKey: ['today-attendance', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile.id)
        .eq('attendance_date', today)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceRecord | null;
    },
    enabled: !!profile?.id,
  });

  // Fetch user's attendance history
  const { data: myAttendance = [], isLoading: loadingMyAttendance } = useQuery({
    queryKey: ['my-attendance', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile.id)
        .order('attendance_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!profile?.id,
  });

  // Fetch all attendance (admin)
  const { data: allAttendance = [], isLoading: loadingAllAttendance } = useQuery({
    queryKey: ['all-attendance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`*, employee:profiles(full_name, email, avatar_url)`)
        .eq('attendance_date', today)
        .order('clock_in_time', { ascending: false });
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: profile?.role === 'admin',
  });

  // Get current location
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  // Check if within geofence
  const isWithinGeofence = (lat: number, lon: number): boolean => {
    if (!settings?.enable_geo_fencing || !settings.office_latitude || !settings.office_longitude) {
      return true; // No geofencing enabled
    }
    const distance = calculateDistance(lat, lon, settings.office_latitude, settings.office_longitude);
    return distance <= settings.geo_fence_radius_meters;
  };

  // Clock in
  const clockIn = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('Not authenticated');
      setLocationError(null);

      let latitude: number | null = null;
      let longitude: number | null = null;
      let withinGeofence = true;

      if (settings?.enable_geo_fencing) {
        try {
          const position = await getCurrentLocation();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          withinGeofence = isWithinGeofence(latitude, longitude);

          if (!withinGeofence) {
            throw new Error('You are outside the office area. Please clock in from the office.');
          }
        } catch (error: any) {
          if (error.code === 1) {
            throw new Error('Location permission denied. Please enable location access.');
          }
          throw error;
        }
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Determine if late
      let status: 'present' | 'late' = 'present';
      if (settings?.work_start_time) {
        const [hours, minutes] = settings.work_start_time.split(':').map(Number);
        const workStart = new Date(now);
        workStart.setHours(hours, minutes + (settings.late_threshold_minutes || 0), 0, 0);
        if (now > workStart) {
          status = 'late';
        }
      }

      const { error } = await supabase.from('attendance_records').insert({
        employee_id: profile.id,
        organization_id: profile.organization_id,
        attendance_date: today,
        clock_in_time: now.toISOString(),
        clock_in_latitude: latitude,
        clock_in_longitude: longitude,
        clock_in_within_geofence: withinGeofence,
        status,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['all-attendance'] });
      toast.success('Clocked in successfully');
    },
    onError: (error) => {
      setLocationError(error.message);
      toast.error(error.message);
    },
  });

  // Clock out
  const clockOut = useMutation({
    mutationFn: async () => {
      if (!profile?.id || !todayAttendance?.id) throw new Error('Not clocked in');
      setLocationError(null);

      let latitude: number | null = null;
      let longitude: number | null = null;
      let withinGeofence = true;

      if (settings?.enable_geo_fencing) {
        try {
          const position = await getCurrentLocation();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          withinGeofence = isWithinGeofence(latitude, longitude);
        } catch (error: any) {
          if (error.code === 1) {
            throw new Error('Location permission denied');
          }
          // Allow clock out even if location fails
        }
      }

      const now = new Date();
      const clockInTime = new Date(todayAttendance.clock_in_time!);
      const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      // Calculate overtime
      let overtimeHours = 0;
      if (settings?.work_end_time) {
        const [hours, minutes] = settings.work_end_time.split(':').map(Number);
        const workEnd = new Date(now);
        workEnd.setHours(hours, minutes, 0, 0);
        if (now > workEnd) {
          overtimeHours = (now.getTime() - workEnd.getTime()) / (1000 * 60 * 60);
        }
      }

      const { error } = await supabase
        .from('attendance_records')
        .update({
          clock_out_time: now.toISOString(),
          clock_out_latitude: latitude,
          clock_out_longitude: longitude,
          clock_out_within_geofence: withinGeofence,
          total_hours: Math.round(totalHours * 100) / 100,
          overtime_hours: Math.round(overtimeHours * 100) / 100,
        })
        .eq('id', todayAttendance.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['all-attendance'] });
      toast.success('Clocked out successfully');
    },
    onError: (error) => {
      setLocationError(error.message);
      toast.error(error.message);
    },
  });

  // Update attendance settings (admin)
  const updateSettings = useMutation({
    mutationFn: async (data: Partial<AttendanceSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('attendance_settings')
          .update(data)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance_settings')
          .insert({ ...data, organization_id: profile?.organization_id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
      toast.success('Settings updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    settings,
    todayAttendance,
    myAttendance,
    allAttendance,
    locationError,
    isLoading: loadingToday || loadingMyAttendance,
    isAdminLoading: loadingAllAttendance,
    clockIn,
    clockOut,
    updateSettings,
    isWithinGeofence,
  };
};
