import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  user_id: string;
  session_date: string;
  first_login: string;
  last_logout: string | null;
  total_minutes: number;
  session_count: number;
  attendance_status: 'on-time' | 'late' | 'very-late' | 'absent';
  full_name: string;
  email: string;
}

export function useAttendance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getAttendanceByDateRange = useCallback(async (
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AttendanceRecord[]> => {
    setLoading(true);
    try {
      // Fetch from session_logs and calculate attendance
      const startDateStr = startDate?.toISOString().split('T')[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDateStr = endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('session_logs')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .gte('login_time', startDateStr)
        .lte('login_time', endDateStr)
        .not('logout_time', 'is', null);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: sessions, error } = await query;

      if (error) throw error;

      // Group by date and calculate attendance
      const attendanceMap = new Map<string, any>();
      
      sessions?.forEach((session: any) => {
        const date = new Date(session.login_time).toISOString().split('T')[0];
        const key = `${session.user_id}-${date}`;
        
        if (!attendanceMap.has(key)) {
          attendanceMap.set(key, {
            user_id: session.user_id,
            session_date: date,
            first_login: session.login_time,
            last_logout: session.logout_time,
            total_minutes: session.session_duration_minutes || 0,
            session_count: 1,
            full_name: session.profiles?.full_name || '',
            email: session.profiles?.email || ''
          });
        } else {
          const existing = attendanceMap.get(key);
          existing.first_login = new Date(existing.first_login) < new Date(session.login_time) 
            ? existing.first_login 
            : session.login_time;
          existing.last_logout = new Date(existing.last_logout || 0) > new Date(session.logout_time || 0)
            ? existing.last_logout
            : session.logout_time;
          existing.total_minutes += session.session_duration_minutes || 0;
          existing.session_count += 1;
        }
      });

      // Calculate attendance status for each record
      const records = Array.from(attendanceMap.values()).map(record => {
        const loginTime = new Date(record.first_login);
        const hours = loginTime.getHours();
        const minutes = loginTime.getMinutes();
        const timeInMinutes = hours * 60 + minutes;
        
        let attendance_status: 'on-time' | 'late' | 'very-late' | 'absent';
        if (timeInMinutes < 570) { // Before 9:30 AM
          attendance_status = 'on-time';
        } else if (timeInMinutes < 600) { // Before 10:00 AM
          attendance_status = 'late';
        } else {
          attendance_status = 'very-late';
        }

        return {
          ...record,
          attendance_status
        };
      });

      return records.sort((a, b) => 
        new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
      );
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getDailyAttendance = useCallback(async (userId: string, date: Date): Promise<AttendanceRecord | null> => {
    const records = await getAttendanceByDateRange(userId, date, date);
    return records[0] || null;
  }, [getAttendanceByDateRange]);

  const getWeeklyAttendance = useCallback(async (userId?: string) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    return getAttendanceByDateRange(userId, startDate, endDate);
  }, [getAttendanceByDateRange]);

  const getMonthlyAttendance = useCallback(async (userId?: string) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return getAttendanceByDateRange(userId, startDate, endDate);
  }, [getAttendanceByDateRange]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-500';
      case 'late':
        return 'bg-yellow-500';
      case 'very-late':
        return 'bg-orange-500';
      case 'absent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAttendanceStatusText = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'On Time';
      case 'late':
        return 'Late';
      case 'very-late':
        return 'Very Late';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  };

  return {
    loading,
    getAttendanceByDateRange,
    getDailyAttendance,
    getWeeklyAttendance,
    getMonthlyAttendance,
    formatDuration,
    getAttendanceStatusColor,
    getAttendanceStatusText
  };
}
