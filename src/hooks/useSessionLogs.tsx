import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useEffect, useCallback } from 'react';

export interface SessionLog {
  id: string;
  user_id: string;
  login_time: string;
  logout_time?: string;
  session_duration_minutes?: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function useSessionLogs() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Enhanced session tracking with real-time updates
  const getCurrentSession = useCallback(async () => {
    if (!profile?.id) return null;
    
    const { data, error } = await supabase
      .from('session_logs')
      .select('*')
      .eq('user_id', profile.id)
      .is('logout_time', null)
      .order('login_time', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching current session:', error);
      return null;
    }
    
    return data?.[0] || null;
  }, [profile?.id]);
  
  // Heartbeat system to keep sessions alive
  useEffect(() => {
    if (!profile?.id) return;

    let heartbeatInterval: NodeJS.Timeout;

    const updateHeartbeat = async () => {
      const currentSession = await getCurrentSession();
      if (!currentSession) return;

      try {
        await supabase
          .from('session_logs')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('id', currentSession.id);
        
        console.log('💓 Heartbeat updated');
      } catch (error) {
        console.error('Failed to update heartbeat:', error);
      }
    };

    // Update heartbeat every 5 minutes
    heartbeatInterval = setInterval(updateHeartbeat, 5 * 60 * 1000);

    // Initial heartbeat
    updateHeartbeat();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [profile?.id, getCurrentSession]);

  const sessionLogsQuery = useQuery({
    queryKey: ['session-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_logs')
        .select(`
          *,
          user_profile:profiles(id, full_name, email)
        `)
        .order('login_time', { ascending: false });

      if (error) throw error;
      return data as SessionLog[];
    },
    enabled: !!profile,
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) {
        console.log('⏭️ Skipping session start - no profile loaded yet');
        return null;
      }
      
      const { data, error } = await supabase
        .from('session_logs')
        .insert([{
          user_id: profile.id,
          login_time: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Session start error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['session-logs'] });
      }
    },
    onError: (error) => {
      // Silent fail - don't block app loading
      console.warn('Session logging disabled:', error);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('session_logs')
        .update({
          logout_time: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', profile?.id)
        .is('logout_time', null)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-logs'] });
    },
    onError: (error) => {
      console.error('Error ending session:', error);
    },
  });

  const getUserSessionStats = (userId?: string) => {
    const logs = sessionLogsQuery.data || [];
    const userLogs = logs.filter(log => userId ? log.user_id === userId : log.user_id === profile?.id);
    
    const totalSessions = userLogs.length;
    const completedSessions = userLogs.filter(log => log.logout_time).length;
    const totalMinutes = userLogs.reduce((sum, log) => sum + (log.session_duration_minutes || 0), 0);
    
    // Today's session time
    const today = new Date().toDateString();
    const todaySessions = userLogs.filter(log => 
      new Date(log.login_time).toDateString() === today
    );
    const todayMinutes = todaySessions.reduce((sum, log) => sum + (log.session_duration_minutes || 0), 0);

    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 100) / 100,
      todayMinutes,
      todayHours: Math.round(todayMinutes / 60 * 100) / 100,
    };
  };

  return {
    sessionLogs: sessionLogsQuery.data || [],
    isLoading: sessionLogsQuery.isLoading,
    error: sessionLogsQuery.error,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    getUserSessionStats,
  };
}