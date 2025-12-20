import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WFHRequest {
  id: string;
  employee_id: string;
  request_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  employee?: { full_name: string; email: string; avatar_url: string | null };
  reviewer?: { full_name: string };
}

export interface WFHPolicy {
  id: string;
  max_wfh_days_per_month: number;
  require_approval: boolean;
  advance_notice_days: number;
  blackout_days: string[];
  is_active: boolean;
}

export const useWFH = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch WFH policy
  const { data: policy } = useQuery({
    queryKey: ['wfh-policy', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data, error } = await supabase
        .from('wfh_policies')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as WFHPolicy | null;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch user's WFH requests
  const { data: myRequests = [], isLoading: loadingMyRequests } = useQuery({
    queryKey: ['my-wfh-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('wfh_requests')
        .select(`*, reviewer:profiles!wfh_requests_reviewed_by_fkey(full_name)`)
        .eq('employee_id', profile.id)
        .order('request_date', { ascending: false });
      if (error) throw error;
      return data as WFHRequest[];
    },
    enabled: !!profile?.id,
  });

  // Fetch all WFH requests (admin)
  const { data: allRequests = [], isLoading: loadingAllRequests } = useQuery({
    queryKey: ['all-wfh-requests', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('wfh_requests')
        .select(`*, employee:profiles!wfh_requests_employee_id_fkey(full_name, email, avatar_url), reviewer:profiles!wfh_requests_reviewed_by_fkey(full_name)`)
        .eq('organization_id', profile.organization_id)
        .order('request_date', { ascending: false });
      if (error) throw error;
      return data as WFHRequest[];
    },
    enabled: ['admin', 'org_admin', 'super_admin'].includes(profile?.role || '') && !!profile?.organization_id,
  });

  // Get user's WFH count for current month
  const { data: monthlyCount = 0 } = useQuery({
    queryKey: ['my-wfh-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { count, error } = await supabase
        .from('wfh_requests')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', profile.id)
        .eq('status', 'approved')
        .gte('request_date', startOfMonth)
        .lte('request_date', endOfMonth);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  // Create WFH request
  const createRequest = useMutation({
    mutationFn: async (data: { request_date: string; reason?: string }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      // Check monthly limit
      if (policy && monthlyCount >= policy.max_wfh_days_per_month) {
        throw new Error(`You have reached your monthly WFH limit of ${policy.max_wfh_days_per_month} days`);
      }

      // Check advance notice
      if (policy?.advance_notice_days) {
        const requestDate = new Date(data.request_date);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + policy.advance_notice_days);
        if (requestDate < minDate) {
          throw new Error(`WFH requests require ${policy.advance_notice_days} day(s) advance notice`);
        }
      }

      // Check blackout days
      if (policy?.blackout_days?.length) {
        const dayOfWeek = new Date(data.request_date).toLocaleDateString('en-US', { weekday: 'long' });
        if (policy.blackout_days.includes(dayOfWeek)) {
          throw new Error(`WFH is not allowed on ${dayOfWeek}s`);
        }
      }

      const status = policy?.require_approval ? 'pending' : 'approved';

      const { error } = await supabase.from('wfh_requests').insert({
        employee_id: profile.id,
        organization_id: profile.organization_id,
        request_date: data.request_date,
        reason: data.reason,
        status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wfh-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-wfh-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-wfh-count'] });
      toast.success(policy?.require_approval ? 'WFH request submitted' : 'WFH day approved');
    },
    onError: (error) => toast.error(error.message),
  });

  // Review WFH request (admin)
  const reviewRequest = useMutation({
    mutationFn: async (data: {
      id: string;
      status: 'approved' | 'rejected';
      review_notes?: string;
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('wfh_requests')
        .update({
          status: data.status,
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          review_notes: data.review_notes,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-wfh-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-wfh-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-wfh-count'] });
      toast.success(`WFH request ${variables.status}`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Cancel WFH request
  const cancelRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wfh_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wfh-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-wfh-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-wfh-count'] });
      toast.success('WFH request cancelled');
    },
    onError: (error) => toast.error(error.message),
  });

  // Update WFH policy (admin)
  const updatePolicy = useMutation({
    mutationFn: async (data: Partial<WFHPolicy>) => {
      if (policy?.id) {
        const { error } = await supabase
          .from('wfh_policies')
          .update(data)
          .eq('id', policy.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wfh_policies')
          .insert({ ...data, organization_id: profile?.organization_id, is_active: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wfh-policy'] });
      toast.success('WFH policy updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    policy,
    myRequests,
    allRequests,
    monthlyCount,
    isLoading: loadingMyRequests,
    isAdminLoading: loadingAllRequests,
    createRequest,
    reviewRequest,
    cancelRequest,
    updatePolicy,
  };
};
