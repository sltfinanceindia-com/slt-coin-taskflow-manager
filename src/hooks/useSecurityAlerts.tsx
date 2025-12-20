import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { toast } from 'sonner';

export interface SecurityAlert {
  id: string;
  user_id: string;
  profile_id: string | null;
  organization_id: string | null;
  alert_type: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export function useSecurityAlerts() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  // Fetch security alerts for the organization (admin only)
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['security-alerts', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !isAdmin) return [];

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching security alerts:', error);
        return [];
      }

      return data as SecurityAlert[];
    },
    enabled: !!profile?.organization_id && isAdmin,
  });

  // Create a security alert
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: {
      alert_type: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      user_id?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('security_alerts')
        .insert({
          ...alertData,
          user_id: alertData.user_id,
          profile_id: profile?.id,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
    },
  });

  // Acknowledge an alert
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: profile?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error) => {
      toast.error('Failed to acknowledge alert');
      console.error('Acknowledge alert error:', error);
    },
  });

  // Get unacknowledged alerts count
  const unacknowledgedCount = alerts.filter(a => !a.is_acknowledged).length;

  // Get critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_acknowledged);

  return {
    alerts,
    isLoading,
    unacknowledgedCount,
    criticalAlerts,
    createAlert: createAlertMutation.mutateAsync,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    isCreating: createAlertMutation.isPending,
    isAcknowledging: acknowledgeAlertMutation.isPending,
  };
}
