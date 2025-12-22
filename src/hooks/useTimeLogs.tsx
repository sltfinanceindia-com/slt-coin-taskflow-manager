import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface TimeLog {
  id: string;
  user_id: string;
  task_id: string;
  hours_worked: number;
  date_logged: string;
  description?: string;
  created_at: string;
  organization_id?: string;
  task?: {
    id: string;
    title: string;
  };
  user_profile?: {
    id: string;
    full_name: string;
  };
}

export function useTimeLogs(userId?: string, dateRange?: { start: string; end: string }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const timeLogsQuery = useQuery({
    queryKey: ['time-logs', profile?.organization_id, userId, dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }

      let query = supabase
        .from('time_logs')
        .select(`
          *,
          task:tasks(id, title),
          user_profile:profiles(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('date_logged', { ascending: false });

      // If a specific userId is provided, filter by that user
      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Apply date range filter if provided
      if (dateRange?.start) {
        query = query.gte('date_logged', dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte('date_logged', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TimeLog[];
    },
    enabled: !!profile?.organization_id,
  });

  const logTimeMutation = useMutation({
    mutationFn: async (logData: {
      task_id: string;
      hours_worked: number;
      date_logged: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('time_logs')
        .insert([{
          ...logData,
          user_id: profile?.id,
          organization_id: profile?.organization_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast({
        title: "Time Logged",
        description: "Your working hours have been successfully logged.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Logging Time",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getWeeklyHours = (userId?: string) => {
    const logs = timeLogsQuery.data || [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return logs
      .filter(log => {
        const logDate = new Date(log.date_logged);
        const userMatch = userId ? log.user_id === userId : log.user_id === profile?.id;
        return userMatch && logDate >= oneWeekAgo;
      })
      .reduce((total, log) => total + log.hours_worked, 0);
  };

  const getMonthlyHours = (userId?: string) => {
    const logs = timeLogsQuery.data || [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return logs
      .filter(log => {
        const logDate = new Date(log.date_logged);
        const userMatch = userId ? log.user_id === userId : log.user_id === profile?.id;
        return userMatch && logDate >= oneMonthAgo;
      })
      .reduce((total, log) => total + log.hours_worked, 0);
  };

  return {
    timeLogs: timeLogsQuery.data || [],
    isLoading: timeLogsQuery.isLoading,
    error: timeLogsQuery.error,
    logTime: logTimeMutation.mutate,
    isLogging: logTimeMutation.isPending,
    getWeeklyHours,
    getMonthlyHours,
  };
}
