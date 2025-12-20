import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface WFHModeState {
  isWFH: boolean;
  canExport: boolean;
  canViewAllTasks: boolean;
  canAccessDirectory: boolean;
  sessionTimeoutMinutes: number;
  requiresOTP: boolean;
  isLoading: boolean;
}

export function useWFHMode(): WFHModeState {
  const { profile, user } = useAuth();

  // Check if user has approved WFH for today
  const { data: todayWFH, isLoading } = useQuery({
    queryKey: ['wfh-today', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('wfh_requests')
        .select('*')
        .eq('employee_id', profile.id)
        .eq('request_date', today)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) {
        console.error('Error fetching WFH status:', error);
        return null;
      }

      return data;
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Check today's attendance for WFH mode
  const { data: todayAttendance } = useQuery({
    queryKey: ['attendance-today-wfh', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile.id)
        .eq('attendance_date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching attendance:', error);
        return null;
      }

      return data;
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  const wfhState = useMemo((): WFHModeState => {
    // Default state when not WFH
    const defaultState: WFHModeState = {
      isWFH: false,
      canExport: true,
      canViewAllTasks: true,
      canAccessDirectory: true,
      sessionTimeoutMinutes: 480, // 8 hours for office
      requiresOTP: false,
      isLoading,
    };

    // Check if user has approved WFH request for today OR clocked in with WFH status
    const isWorkingFromHome = !!todayWFH || todayAttendance?.status === 'wfh';

    if (!isWorkingFromHome) {
      return defaultState;
    }

    // WFH restrictions
    return {
      isWFH: true,
      canExport: false, // Cannot export bulk data when WFH
      canViewAllTasks: false, // Can only see assigned tasks
      canAccessDirectory: false, // Cannot access employee directory
      sessionTimeoutMinutes: 120, // 2 hours for WFH
      requiresOTP: true, // Requires OTP verification
      isLoading,
    };
  }, [todayWFH, todayAttendance, isLoading]);

  return wfhState;
}
