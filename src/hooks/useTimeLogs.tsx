import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
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
  const { logTimeLogged } = useAutoUpdate();

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

      if (userId) {
        query = query.eq('user_id', userId);
      }

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
        .select(`
          *,
          task:tasks(id, title)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast({
        title: "Time Logged",
        description: "Your working hours have been successfully logged.",
      });
      
      // Log to activity feed
      if (data.task?.title) {
        await logTimeLogged(data.task.title, data.task_id, data.hours_worked);
      }
    },
    onError: (error) => {
      toast({
        title: "Error Logging Time",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeLog> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast({
        title: "Time Log Updated",
        description: "Your time entry has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Time Log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTimeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast({
        title: "Time Log Deleted",
        description: "The time entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Time Log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getWeeklyHours = (targetUserId?: string) => {
    const logs = timeLogsQuery.data || [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return logs
      .filter(log => {
        const logDate = new Date(log.date_logged);
        const userMatch = targetUserId ? log.user_id === targetUserId : log.user_id === profile?.id;
        return userMatch && logDate >= oneWeekAgo;
      })
      .reduce((total, log) => total + log.hours_worked, 0);
  };

  const getMonthlyHours = (targetUserId?: string) => {
    const logs = timeLogsQuery.data || [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return logs
      .filter(log => {
        const logDate = new Date(log.date_logged);
        const userMatch = targetUserId ? log.user_id === targetUserId : log.user_id === profile?.id;
        return userMatch && logDate >= oneMonthAgo;
      })
      .reduce((total, log) => total + log.hours_worked, 0);
  };

  const getTotalHours = () => {
    const logs = timeLogsQuery.data || [];
    return logs.reduce((total, log) => total + log.hours_worked, 0);
  };

  return {
    timeLogs: timeLogsQuery.data || [],
    isLoading: timeLogsQuery.isLoading,
    error: timeLogsQuery.error,
    logTime: logTimeMutation.mutate,
    updateTimeLog: updateTimeMutation.mutate,
    deleteTimeLog: deleteTimeMutation.mutate,
    isLogging: logTimeMutation.isPending,
    isUpdating: updateTimeMutation.isPending,
    isDeleting: deleteTimeMutation.isPending,
    getWeeklyHours,
    getMonthlyHours,
    getTotalHours,
    refetch: timeLogsQuery.refetch,
  };
}
