/**
 * Compliance Hook
 * Manages GRC compliance checkpoints and project compliance status
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ComplianceStage = 'initiation' | 'planning' | 'design' | 'build' | 'test' | 'deploy' | 'closure';
export type ComplianceStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'waived' | 'not_applicable';

export interface ComplianceCheckpoint {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  regulation?: string;
  required_stage?: ComplianceStage;
  is_mandatory: boolean;
  checklist_items?: Array<{ id: string; label: string; required: boolean }>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectComplianceStatus {
  id: string;
  project_id: string;
  checkpoint_id: string;
  status: ComplianceStatus;
  completed_by?: string;
  completed_at?: string;
  waiver_approved_by?: string;
  waiver_reason?: string;
  notes?: string;
  evidence_urls?: string[];
  created_at: string;
  updated_at: string;
  checkpoint?: ComplianceCheckpoint;
  completer?: {
    id: string;
    full_name: string;
  };
  waiver_approver?: {
    id: string;
    full_name: string;
  };
}

export interface CreateCheckpointData {
  name: string;
  description?: string;
  regulation?: string;
  required_stage?: ComplianceStage;
  is_mandatory?: boolean;
  checklist_items?: Array<{ id: string; label: string; required: boolean }>;
}

export function useComplianceCheckpoints() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const checkpointsQuery = useQuery({
    queryKey: ['compliance-checkpoints', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('compliance_checkpoints')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('required_stage', { ascending: true });

      if (error) throw error;
      return data as ComplianceCheckpoint[];
    },
    enabled: !!profile?.organization_id,
  });

  const createCheckpointMutation = useMutation({
    mutationFn: async (data: CreateCheckpointData) => {
      const { data: result, error } = await supabase
        .from('compliance_checkpoints')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checkpoints'] });
      toast.success('Checkpoint created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create checkpoint: ' + error.message);
    },
  });

  const updateCheckpointMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateCheckpointData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('compliance_checkpoints')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checkpoints'] });
      toast.success('Checkpoint updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update checkpoint: ' + error.message);
    },
  });

  const deleteCheckpointMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('compliance_checkpoints')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checkpoints'] });
      toast.success('Checkpoint deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete checkpoint: ' + error.message);
    },
  });

  return {
    checkpoints: checkpointsQuery.data || [],
    isLoading: checkpointsQuery.isLoading,
    error: checkpointsQuery.error,
    createCheckpoint: createCheckpointMutation.mutate,
    updateCheckpoint: updateCheckpointMutation.mutate,
    deleteCheckpoint: deleteCheckpointMutation.mutate,
    isCreating: createCheckpointMutation.isPending,
    isUpdating: updateCheckpointMutation.isPending,
    isDeleting: deleteCheckpointMutation.isPending,
  };
}

export function useProjectCompliance(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Get all checkpoints
  const { checkpoints } = useComplianceCheckpoints();

  // Get project compliance statuses
  const complianceQuery = useQuery({
    queryKey: ['project-compliance', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_compliance_status')
        .select(`
          *,
          checkpoint:compliance_checkpoints(*),
          completer:profiles!project_compliance_status_completed_by_fkey(id, full_name),
          waiver_approver:profiles!project_compliance_status_waiver_approved_by_fkey(id, full_name)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      return data as unknown as ProjectComplianceStatus[];
    },
    enabled: !!projectId,
  });

  // Initialize project compliance with all checkpoints
  const initializeComplianceMutation = useMutation({
    mutationFn: async () => {
      if (!projectId || !profile?.organization_id) throw new Error('Missing required data');

      const existingCheckpointIds = complianceQuery.data?.map(c => c.checkpoint_id) || [];
      const newCheckpoints = checkpoints.filter(cp => !existingCheckpointIds.includes(cp.id));

      if (newCheckpoints.length === 0) return;

      const { error } = await supabase
        .from('project_compliance_status')
        .insert(
          newCheckpoints.map(cp => ({
            project_id: projectId,
            checkpoint_id: cp.id,
            status: 'pending',
            organization_id: profile.organization_id,
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-compliance', projectId] });
      toast.success('Compliance checkpoints initialized');
    },
    onError: (error) => {
      toast.error('Failed to initialize compliance: ' + error.message);
    },
  });

  // Update compliance status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes, 
      evidence_urls,
      waiver_reason,
    }: { 
      id: string; 
      status: ComplianceStatus; 
      notes?: string;
      evidence_urls?: string[];
      waiver_reason?: string;
    }) => {
      const updateData: Record<string, unknown> = { status, notes, evidence_urls };

      if (status === 'passed' || status === 'failed') {
        updateData.completed_by = profile?.id;
        updateData.completed_at = new Date().toISOString();
      }

      if (status === 'waived' && waiver_reason) {
        updateData.waiver_approved_by = profile?.id;
        updateData.waiver_reason = waiver_reason;
      }

      const { data: result, error } = await supabase
        .from('project_compliance_status')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-compliance', projectId] });
      toast.success('Compliance status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  // Calculate compliance summary
  const statuses = complianceQuery.data || [];
  const summary = {
    total: statuses.length,
    pending: statuses.filter(s => s.status === 'pending').length,
    inProgress: statuses.filter(s => s.status === 'in_progress').length,
    passed: statuses.filter(s => s.status === 'passed').length,
    failed: statuses.filter(s => s.status === 'failed').length,
    waived: statuses.filter(s => s.status === 'waived').length,
    notApplicable: statuses.filter(s => s.status === 'not_applicable').length,
    completionRate: statuses.length > 0 
      ? ((statuses.filter(s => ['passed', 'waived', 'not_applicable'].includes(s.status)).length / statuses.length) * 100)
      : 0,
    mandatoryCompleted: statuses
      .filter(s => s.checkpoint?.is_mandatory)
      .every(s => ['passed', 'waived', 'not_applicable'].includes(s.status)),
  };

  return {
    statuses: complianceQuery.data || [],
    summary,
    isLoading: complianceQuery.isLoading,
    error: complianceQuery.error,
    initializeCompliance: initializeComplianceMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isInitializing: initializeComplianceMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
}
