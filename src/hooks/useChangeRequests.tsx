import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ChangeRequest {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  reason: string;
  requested_by: string;
  status: 'draft' | 'submitted' | 'analyzing' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact_analysis: {
    schedule?: string;
    budget?: string;
    resources?: string;
    risks?: string;
    benefits?: string;
  };
  schedule_impact_days: number | null;
  budget_impact: number | null;
  resource_impact: string | null;
  approved_by: string | null;
  approved_at: string | null;
  implemented_at: string | null;
  implementation_notes: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  requester_profile?: { id: string; full_name: string; email: string };
  approver_profile?: { id: string; full_name: string; email: string } | null;
  project?: { id: string; name: string };
}

export interface ChangeRequestApproval {
  id: string;
  change_request_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  decided_at: string | null;
  step_order: number;
  organization_id: string | null;
  created_at: string;
  approver_profile?: { id: string; full_name: string; email: string };
}

export interface CreateChangeRequestData {
  project_id: string;
  title: string;
  description?: string;
  reason: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'submitted';
}

export interface UpdateChangeRequestData {
  title?: string;
  description?: string;
  reason?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'submitted' | 'analyzing' | 'approved' | 'rejected' | 'implemented';
  impact_analysis?: ChangeRequest['impact_analysis'];
  schedule_impact_days?: number;
  budget_impact?: number;
  resource_impact?: string;
  implementation_notes?: string;
}

export function useChangeRequests(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const changeRequestsQuery = useQuery({
    queryKey: ['change-requests', profile?.organization_id, projectId],
    queryFn: async () => {
      let query = supabase
        .from('change_requests')
        .select(`
          *,
          requester_profile:profiles!change_requests_requested_by_fkey(id, full_name, email),
          approver_profile:profiles!change_requests_approved_by_fkey(id, full_name, email),
          project:projects(id, name)
        `)
        .eq('organization_id', profile!.organization_id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ChangeRequest[];
    },
    enabled: !!profile?.organization_id,
  });

  const approvalsQuery = useQuery({
    queryKey: ['change-request-approvals', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('change_request_approvals')
        .select(`
          *,
          approver_profile:profiles!change_request_approvals_approver_id_fkey(id, full_name, email)
        `)
        .eq('organization_id', profile!.organization_id)
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data as ChangeRequestApproval[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateChangeRequestData) => {
      const { data: result, error } = await supabase
        .from('change_requests')
        .insert({
          ...data,
          requested_by: profile!.id,
          organization_id: profile!.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      toast({ title: 'Change request created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create change request', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChangeRequestData }) => {
      const updateData: Record<string, unknown> = { ...data };
      
      if (data.status === 'approved') {
        updateData.approved_by = profile!.id;
        updateData.approved_at = new Date().toISOString();
      } else if (data.status === 'implemented') {
        updateData.implemented_at = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from('change_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      toast({ title: 'Change request updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update change request', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('change_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      toast({ title: 'Change request deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete change request', description: error.message, variant: 'destructive' });
    },
  });

  const submitApprovalMutation = useMutation({
    mutationFn: async ({ 
      changeRequestId, 
      status, 
      comments 
    }: { 
      changeRequestId: string; 
      status: 'approved' | 'rejected'; 
      comments?: string;
    }) => {
      // Update or create approval record
      const { data: existing } = await supabase
        .from('change_request_approvals')
        .select('id')
        .eq('change_request_id', changeRequestId)
        .eq('approver_id', profile!.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('change_request_approvals')
          .update({
            status,
            comments,
            decided_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('change_request_approvals')
          .insert({
            change_request_id: changeRequestId,
            approver_id: profile!.id,
            status,
            comments,
            decided_at: new Date().toISOString(),
            organization_id: profile!.organization_id,
          });
        if (error) throw error;
      }

      // Update change request status if approved/rejected
      const { error: updateError } = await supabase
        .from('change_requests')
        .update({ 
          status,
          approved_by: status === 'approved' ? profile!.id : null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', changeRequestId);

      if (updateError) throw updateError;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['change-request-approvals'] });
      toast({ title: `Change request ${status}` });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to submit approval', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate stats
  const stats = {
    total: changeRequestsQuery.data?.length || 0,
    draft: changeRequestsQuery.data?.filter(r => r.status === 'draft').length || 0,
    submitted: changeRequestsQuery.data?.filter(r => r.status === 'submitted').length || 0,
    analyzing: changeRequestsQuery.data?.filter(r => r.status === 'analyzing').length || 0,
    approved: changeRequestsQuery.data?.filter(r => r.status === 'approved').length || 0,
    rejected: changeRequestsQuery.data?.filter(r => r.status === 'rejected').length || 0,
    implemented: changeRequestsQuery.data?.filter(r => r.status === 'implemented').length || 0,
  };

  return {
    changeRequests: changeRequestsQuery.data || [],
    approvals: approvalsQuery.data || [],
    stats,
    isLoading: changeRequestsQuery.isLoading,
    error: changeRequestsQuery.error,
    createChangeRequest: createMutation.mutate,
    updateChangeRequest: updateMutation.mutate,
    deleteChangeRequest: deleteMutation.mutate,
    submitApproval: submitApprovalMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
