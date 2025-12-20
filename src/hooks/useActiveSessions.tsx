import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ActiveSession {
  id: string;
  user_id: string;
  profile_id: string | null;
  organization_id: string | null;
  device_info: {
    browser?: string;
    os?: string;
    device_type?: string;
  };
  ip_address: string | null;
  geo_location: {
    city?: string;
    country?: string;
    region?: string;
  };
  login_at: string;
  last_activity_at: string;
  expires_at: string | null;
  is_active: boolean;
  work_mode: string;
  created_at: string;
}

function parseUserAgent(): { browser: string; os: string; device_type: string } {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect device type
  let device_type = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device_type = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device_type = 'Tablet';

  return { browser, os, device_type };
}

export function useActiveSessions() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch active sessions for the current user
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['active-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('login_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return data as ActiveSession[];
    },
    enabled: !!user?.id,
  });

  // Create a new session on login
  const createSessionMutation = useMutation({
    mutationFn: async (workMode: string = 'office') => {
      if (!user?.id) throw new Error('User not authenticated');

      const deviceInfo = parseUserAgent();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (workMode === 'wfh' ? 2 : 8));

      const { data, error } = await supabase
        .from('active_sessions')
        .insert({
          user_id: user.id,
          profile_id: profile?.id,
          organization_id: profile?.organization_id,
          device_info: deviceInfo,
          work_mode: workMode,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });

  // Update session activity timestamp
  const updateActivityMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('active_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
    },
  });

  // Logout a specific session
  const logoutSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('active_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      toast.success('Session logged out successfully');
    },
    onError: (error) => {
      toast.error('Failed to logout session');
      console.error('Session logout error:', error);
    },
  });

  // Logout all sessions except current
  const logoutAllSessionsMutation = useMutation({
    mutationFn: async (exceptSessionId?: string) => {
      let query = supabase
        .from('active_sessions')
        .update({ is_active: false })
        .eq('user_id', user?.id || '')
        .eq('is_active', true);

      if (exceptSessionId) {
        query = query.neq('id', exceptSessionId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      toast.success('All other sessions logged out');
    },
    onError: (error) => {
      toast.error('Failed to logout sessions');
      console.error('Logout all sessions error:', error);
    },
  });

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutateAsync,
    updateActivity: updateActivityMutation.mutate,
    logoutSession: logoutSessionMutation.mutate,
    logoutAllSessions: logoutAllSessionsMutation.mutate,
    isLoggingOut: logoutSessionMutation.isPending || logoutAllSessionsMutation.isPending,
  };
}
