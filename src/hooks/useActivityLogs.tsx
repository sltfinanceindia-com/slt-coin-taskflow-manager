import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useCallback } from 'react';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'task_start' | 'task_complete' | 'task_update' | 'idle_start' | 'idle_end' | 'focus_start' | 'focus_end';
  task_id?: string;
  metadata: Record<string, any>;
  duration_minutes?: number;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  task?: {
    id: string;
    title: string;
  };
  user_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface ProductivityMetrics {
  total_hours: number;
  active_hours: number;
  idle_hours: number;
  productivity_score: number;
  task_completion_rate: number;
  avg_task_duration: number;
}

export function useActivityLogs() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);
  const isFocusedRef = useRef<boolean>(true);

  const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  const FOCUS_THRESHOLD = 2 * 60 * 1000; // 2 minutes

  const activityLogsQuery = useQuery({
    queryKey: ['activity-logs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          task:tasks(id, title),
          user_profile:profiles!inner(id, full_name, email, organization_id)
        `)
        .eq('organization_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!profile?.organization_id,
  });

  const productivityQuery = useQuery({
    queryKey: ['productivity-metrics', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .rpc('get_user_productivity_metrics', { 
          p_user_id: profile.id 
        });

      if (error) throw error;
      return data?.[0] as ProductivityMetrics;
    },
    enabled: !!profile?.id,
  });

  const logActivityMutation = useMutation({
    mutationFn: async (activityData: {
      activity_type: ActivityLog['activity_type'];
      task_id?: string;
      duration_minutes?: number;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .rpc('track_user_activity', {
          p_user_id: profile?.id,
          p_activity_type: activityData.activity_type,
          p_task_id: activityData.task_id,
          p_duration_minutes: activityData.duration_minutes,
          p_metadata: activityData.metadata || {}
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['productivity-metrics'] });
    },
    onError: (error) => {
      console.error('Error logging activity:', error);
    },
  });

  const trackActivity = useCallback((activityType: ActivityLog['activity_type'], taskId?: string, metadata?: Record<string, any>) => {
    if (!profile?.id) return;

    const now = Date.now();
    const duration = Math.floor((now - lastActivityRef.current) / 60000); // Convert to minutes

    logActivityMutation.mutate({
      activity_type: activityType,
      task_id: taskId,
      duration_minutes: duration > 0 ? duration : undefined,
      metadata: {
        ...metadata,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: now
      }
    });

    lastActivityRef.current = now;
  }, [profile?.id, logActivityMutation]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // If user was idle, mark as active again
    if (isIdleRef.current) {
      isIdleRef.current = false;
      trackActivity('idle_end', undefined, { was_idle_for_minutes: Math.floor((Date.now() - lastActivityRef.current) / 60000) });
    }

    idleTimeoutRef.current = setTimeout(() => {
      if (!isIdleRef.current) {
        isIdleRef.current = true;
        trackActivity('idle_start', undefined, { idle_threshold_minutes: IDLE_THRESHOLD / 60000 });
      }
    }, IDLE_THRESHOLD);
  }, [trackActivity]);

  const resetFocusTimer = useCallback(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    focusTimeoutRef.current = setTimeout(() => {
      if (isFocusedRef.current) {
        isFocusedRef.current = false;
        trackActivity('focus_end', undefined, { focus_duration_minutes: FOCUS_THRESHOLD / 60000 });
      }
    }, FOCUS_THRESHOLD);
  }, [trackActivity]);

  // Set up activity monitoring
  useEffect(() => {
    if (!profile?.id) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      resetIdleTimer();
      if (!isFocusedRef.current) {
        isFocusedRef.current = true;
        trackActivity('focus_start', undefined, { focus_regained: true });
      }
      resetFocusTimer();
    };

    const visibilityHandler = () => {
      if (document.hidden) {
        trackActivity('focus_end', undefined, { reason: 'tab_hidden' });
        isFocusedRef.current = false;
      } else {
        trackActivity('focus_start', undefined, { reason: 'tab_visible' });
        isFocusedRef.current = true;
        resetFocusTimer();
      }
    };

    const beforeUnloadHandler = () => {
      trackActivity('logout', undefined, { reason: 'page_unload' });
    };

    // Add event listeners
    activities.forEach(activity => {
      document.addEventListener(activity, activityHandler, true);
    });

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('beforeunload', beforeUnloadHandler);

    // Initial activity tracking
    trackActivity('focus_start', undefined, { session_start: true });
    resetIdleTimer();
    resetFocusTimer();

    return () => {
      // Cleanup
      activities.forEach(activity => {
        document.removeEventListener(activity, activityHandler, true);
      });
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [profile?.id, resetIdleTimer, resetFocusTimer, trackActivity]);

  const getActivityStats = useCallback((userId?: string) => {
    const logs = activityLogsQuery.data || [];
    const userLogs = logs.filter(log => userId ? log.user_id === userId : log.user_id === profile?.id);
    
    const today = new Date().toDateString();
    const todayLogs = userLogs.filter(log => 
      new Date(log.timestamp).toDateString() === today
    );

    const focusLogs = todayLogs.filter(log => log.activity_type === 'focus_start');
    const idleLogs = todayLogs.filter(log => log.activity_type === 'idle_start');
    const taskLogs = todayLogs.filter(log => log.activity_type.includes('task_'));

    const totalFocusTime = focusLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    const totalIdleTime = idleLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

    return {
      totalActivities: todayLogs.length,
      focusTime: totalFocusTime,
      idleTime: totalIdleTime,
      taskActivities: taskLogs.length,
      productivityScore: totalFocusTime > 0 ? Math.round((totalFocusTime / (totalFocusTime + totalIdleTime)) * 100) : 0,
      lastActivity: todayLogs[0]?.timestamp || null
    };
  }, [activityLogsQuery.data, profile?.id]);

  return {
    activityLogs: activityLogsQuery.data || [],
    productivityMetrics: productivityQuery.data || null,
    isLoading: activityLogsQuery.isLoading || productivityQuery.isLoading,
    error: activityLogsQuery.error || productivityQuery.error,
    trackActivity,
    getActivityStats,
    isTracking: logActivityMutation.isPending,
  };
}