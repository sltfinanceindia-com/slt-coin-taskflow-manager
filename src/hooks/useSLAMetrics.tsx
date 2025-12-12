import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface SLAMetrics {
  total_requests: number;
  response_sla_met: number;
  resolution_sla_met: number;
  response_sla_breached: number;
  resolution_sla_breached: number;
  avg_response_hours: number;
  avg_resolution_hours: number;
  avg_csat_rating: number;
}

export interface TicketFeedback {
  id: string;
  request_id: string;
  rating: number;
  feedback_text: string | null;
  submitted_by: string;
  submitted_at: string;
  organization_id: string | null;
}

export interface RoutingRule {
  id: string;
  request_type_id: string;
  name: string;
  condition_field: string;
  condition_operator: string;
  condition_value: string;
  assign_to_user_id: string | null;
  assign_to_team: string | null;
  priority_override: string | null;
  is_active: boolean;
  sort_order: number;
  organization_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useSLAMetrics(startDate?: Date, endDate?: Date) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ['sla-metrics', profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase.rpc('get_sla_metrics', {
        p_org_id: profile.organization_id,
        p_start_date: startDate?.toISOString().split('T')[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      return data?.[0] as SLAMetrics | null;
    },
    enabled: !!profile?.organization_id,
  });

  const feedbackQuery = useQuery({
    queryKey: ['ticket-feedback', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('ticket_feedback')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TicketFeedback[];
    },
    enabled: !!profile?.organization_id,
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ requestId, rating, feedbackText }: { requestId: string; rating: number; feedbackText?: string }) => {
      if (!profile) throw new Error('Not authenticated');

      // Insert feedback record
      const { error: feedbackError } = await supabase
        .from('ticket_feedback')
        .insert({
          request_id: requestId,
          rating,
          feedback_text: feedbackText || null,
          submitted_by: profile.id,
          organization_id: profile.organization_id,
        });

      if (feedbackError) throw feedbackError;

      // Update work request with CSAT
      const { error: updateError } = await supabase
        .from('work_requests')
        .update({
          csat_rating: rating,
          csat_submitted_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['sla-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['work-requests'] });
      toast({ title: 'Feedback submitted', description: 'Thank you for your feedback!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
      console.error('Feedback error:', error);
    },
  });

  return {
    metrics: metricsQuery.data,
    feedback: feedbackQuery.data || [],
    isLoading: metricsQuery.isLoading || feedbackQuery.isLoading,
    submitFeedback: submitFeedbackMutation.mutate,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
  };
}

export function useRoutingRules() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['routing-rules', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('request_routing_rules')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as RoutingRule[];
    },
    enabled: !!profile?.organization_id,
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: Omit<RoutingRule, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'organization_id'>) => {
      if (!profile) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('request_routing_rules')
        .insert({
          ...rule,
          created_by: profile.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      toast({ title: 'Rule created', description: 'Routing rule has been created' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to create routing rule', variant: 'destructive' });
      console.error('Create rule error:', error);
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RoutingRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('request_routing_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      toast({ title: 'Rule updated', description: 'Routing rule has been updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update routing rule', variant: 'destructive' });
      console.error('Update rule error:', error);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('request_routing_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      toast({ title: 'Rule deleted', description: 'Routing rule has been deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete routing rule', variant: 'destructive' });
      console.error('Delete rule error:', error);
    },
  });

  return {
    rules: rulesQuery.data || [],
    isLoading: rulesQuery.isLoading,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
  };
}
