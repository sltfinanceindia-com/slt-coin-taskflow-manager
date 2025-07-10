import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DailyEmailLog {
  id: string;
  user_id: string;
  email_type: string;
  email_date: string;
  sent_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function useDailyEmailLogs() {
  const { profile } = useAuth();

  const dailyEmailLogsQuery = useQuery({
    queryKey: ['daily-email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_email_log')
        .select(`
          *,
          user_profile:profiles(id, full_name, email)
        `)
        .order('email_date', { ascending: false });

      if (error) throw error;
      return data as DailyEmailLog[];
    },
    enabled: !!profile && profile.role === 'admin',
  });

  const getTodayEmailStats = () => {
    const logs = dailyEmailLogsQuery.data || [];
    const today = new Date().toISOString().split('T')[0];
    
    const todayLogs = logs.filter(log => log.email_date === today);
    
    const emailTypeStats = todayLogs.reduce((acc, log) => {
      acc[log.email_type] = (acc[log.email_type] || 0) + log.sent_count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmailsToday: todayLogs.reduce((sum, log) => sum + log.sent_count, 0),
      uniqueUsersToday: new Set(todayLogs.map(log => log.user_id)).size,
      emailTypeStats,
      todayLogs,
    };
  };

  const getUserEmailHistory = (userId?: string) => {
    const logs = dailyEmailLogsQuery.data || [];
    const userLogs = logs.filter(log => userId ? log.user_id === userId : log.user_id === profile?.id);
    
    return {
      totalEmails: userLogs.reduce((sum, log) => sum + log.sent_count, 0),
      emailTypes: new Set(userLogs.map(log => log.email_type)).size,
      lastEmailDate: userLogs.length > 0 ? userLogs[0].email_date : null,
      recentLogs: userLogs.slice(0, 10),
    };
  };

  return {
    dailyEmailLogs: dailyEmailLogsQuery.data || [],
    isLoading: dailyEmailLogsQuery.isLoading,
    error: dailyEmailLogsQuery.error,
    getTodayEmailStats,
    getUserEmailHistory,
  };
}