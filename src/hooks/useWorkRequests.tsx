import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface RequestType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  form_fields: any[];
  default_assignee_id: string | null;
  default_priority: 'low' | 'medium' | 'high' | 'urgent';
  sla_response_hours: number;
  sla_resolution_hours: number;
  requires_approval: boolean;
  is_active: boolean;
  organization_id: string | null;
  created_at: string;
}

export interface WorkRequest {
  id: string;
  request_number: string;
  request_type_id: string;
  title: string;
  description: string | null;
  requester_id: string;
  status: 'submitted' | 'triaging' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  form_data: Record<string, any>;
  assigned_to: string | null;
  assigned_team: string | null;
  converted_to_task_id: string | null;
  converted_to_project_id: string | null;
  sla_response_due: string | null;
  sla_resolution_due: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  triage_notes: string | null;
  triaged_by: string | null;
  triaged_at: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  request_type?: RequestType;
  requester?: { id: string; full_name: string; email: string; avatar_url: string | null };
  assignee?: { id: string; full_name: string; email: string; avatar_url: string | null };
}

export interface SLABreach {
  id: string;
  request_id: string;
  breach_type: 'response' | 'resolution';
  expected_at: string;
  breached_at: string;
  breach_duration_minutes: number | null;
  notified: boolean;
  work_request?: WorkRequest;
}

export interface CreateWorkRequestData {
  request_type_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  form_data?: Record<string, any>;
}

export function useWorkRequests(statusFilter?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const requestTypesQuery = useQuery({
    queryKey: ['request-types', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('request_types')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as RequestType[];
    },
    enabled: !!profile?.organization_id,
  });

  const requestsQuery = useQuery({
    queryKey: ['work-requests', profile?.organization_id, statusFilter],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      let query = supabase
        .from('work_requests')
        .select(`
          *,
          request_type:request_types(*),
          requester:profiles!work_requests_requester_id_fkey(id, full_name, email, avatar_url),
          assignee:profiles!work_requests_assigned_to_fkey(id, full_name, email, avatar_url)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkRequest[];
    },
    enabled: !!profile?.organization_id,
  });

  const breachesQuery = useQuery({
    queryKey: ['sla-breaches', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('sla_breaches')
        .select(`
          *,
          work_request:work_requests(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('breached_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as SLABreach[];
    },
    enabled: !!profile?.organization_id,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: CreateWorkRequestData) => {
      if (!profile?.organization_id || !profile?.id) throw new Error('Not authenticated');

      const requestType = requestTypesQuery.data?.find(rt => rt.id === data.request_type_id);

      const insertData: any = {
        request_type_id: data.request_type_id,
        title: data.title,
        description: data.description || null,
        priority: data.priority || requestType?.default_priority || 'medium',
        form_data: data.form_data || {},
        requester_id: profile.id,
        assigned_to: requestType?.default_assignee_id || null,
        organization_id: profile.organization_id,
      };

      const { data: result, error } = await supabase
        .from('work_requests')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-requests'] });
      toast({ title: 'Request Submitted', description: 'Your request has been submitted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkRequest> }) => {
      const { data, error } = await supabase
        .from('work_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-requests'] });
      toast({ title: 'Request Updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const triageRequestMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes, 
      assignedTo 
    }: { 
      id: string; 
      status: WorkRequest['status']; 
      notes?: string;
      assignedTo?: string;
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const updates: Partial<WorkRequest> = {
        status,
        triage_notes: notes,
        triaged_by: profile.id,
        triaged_at: new Date().toISOString(),
        first_response_at: new Date().toISOString(),
      };

      if (assignedTo) {
        updates.assigned_to = assignedTo;
      }

      if (status === 'completed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('work_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-requests'] });
      toast({ 
        title: 'Request Triaged', 
        description: `Request has been ${variables.status === 'approved' ? 'approved' : variables.status === 'rejected' ? 'rejected' : 'updated'}.` 
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const convertToTaskMutation = useMutation({
    mutationFn: async ({ requestId, taskData }: { requestId: string; taskData: any }) => {
      if (!profile?.organization_id || !profile?.id) throw new Error('Not authenticated');

      // Create task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: profile.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Update request with task reference
      const { error: updateError } = await supabase
        .from('work_requests')
        .update({ 
          converted_to_task_id: task.id,
          status: 'in_progress',
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-requests'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task Created', description: 'Request has been converted to a task.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate stats
  const stats = {
    total: requestsQuery.data?.length || 0,
    submitted: requestsQuery.data?.filter(r => r.status === 'submitted').length || 0,
    inProgress: requestsQuery.data?.filter(r => r.status === 'in_progress').length || 0,
    completed: requestsQuery.data?.filter(r => r.status === 'completed').length || 0,
    breaches: breachesQuery.data?.length || 0,
  };

  return {
    requestTypes: requestTypesQuery.data || [],
    requests: requestsQuery.data || [],
    breaches: breachesQuery.data || [],
    stats,
    isLoading: requestTypesQuery.isLoading || requestsQuery.isLoading,
    error: requestTypesQuery.error || requestsQuery.error,
    createRequest: createRequestMutation.mutate,
    updateRequest: (id: string, updates: Partial<WorkRequest>) => updateRequestMutation.mutate({ id, updates }),
    triageRequest: triageRequestMutation.mutate,
    convertToTask: convertToTaskMutation.mutate,
    isCreating: createRequestMutation.isPending,
    isUpdating: updateRequestMutation.isPending,
    isTriaging: triageRequestMutation.isPending,
  };
}
