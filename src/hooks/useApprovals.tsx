import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string | null;
  entity_type: string;
  steps: WorkflowStep[];
  is_active: boolean;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  step_number: number;
  approver_role?: string;
  approver_id?: string;
  approval_type: 'any' | 'all';
}

export interface ApprovalInstance {
  id: string;
  workflow_id: string;
  entity_id: string;
  entity_type: string;
  current_step: number;
  status: string;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  workflow?: ApprovalWorkflow;
  steps?: ApprovalStepRecord[];
}

export interface ApprovalStepRecord {
  id: string;
  instance_id: string;
  step_number: number;
  approver_id: string;
  status: string;
  comments: string | null;
  decided_at: string | null;
  created_at: string;
  approver?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export const useApprovals = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const workflowsQuery = useQuery({
    queryKey: ['approval-workflows', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', profile?.organization_id)
        .order('name');
      
      if (error) throw error;
      return (data || []).map(w => ({
        ...w,
        steps: (w.steps as any) || [],
      })) as ApprovalWorkflow[];
    },
    enabled: !!profile?.organization_id,
  });

  const myPendingApprovalsQuery = useQuery({
    queryKey: ['my-pending-approvals', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_steps')
        .select(`
          *,
          instance:approval_instances(
            *,
            workflow:approval_workflows(*)
          )
        `)
        .eq('approver_id', profile!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const instancesQuery = useQuery({
    queryKey: ['approval-instances', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_instances')
        .select(`
          *,
          workflow:approval_workflows(*),
          steps:approval_steps(
            *,
            approver:profiles(id, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(i => ({
        ...i,
        workflow: i.workflow ? { ...i.workflow, steps: (i.workflow as any).steps || [] } : undefined,
      })) as unknown as ApprovalInstance[];
    },
    enabled: !!profile?.organization_id,
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflow: Partial<ApprovalWorkflow>) => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .insert({
          name: workflow.name!,
          description: workflow.description,
          entity_type: workflow.entity_type!,
          steps: JSON.parse(JSON.stringify(workflow.steps || [])),
          created_by: profile!.id,
          organization_id: profile!.organization_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast.success('Workflow created');
    },
    onError: (error) => {
      toast.error('Failed to create workflow: ' + error.message);
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, steps, ...updates }: Partial<ApprovalWorkflow> & { id: string }) => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .update({ 
          ...updates, 
          steps: steps ? JSON.parse(JSON.stringify(steps)) : undefined,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast.success('Workflow updated');
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('approval_workflows')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast.success('Workflow deleted');
    },
  });

  const startApproval = useMutation({
    mutationFn: async ({ workflowId, entityId, entityType }: { 
      workflowId: string; 
      entityId: string; 
      entityType: string;
    }) => {
      const workflow = workflowsQuery.data?.find(w => w.id === workflowId);
      if (!workflow) throw new Error('Workflow not found');

      // Create approval instance
      const { data: instance, error: instanceError } = await supabase
        .from('approval_instances')
        .insert({
          workflow_id: workflowId,
          entity_id: entityId,
          entity_type: entityType,
          current_step: 1,
          status: 'pending',
          created_by: profile!.id,
          organization_id: profile!.organization_id,
        })
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Create first step
      const firstStep = workflow.steps[0];
      if (firstStep?.approver_id) {
        const { error: stepError } = await supabase
          .from('approval_steps')
          .insert({
            instance_id: instance.id,
            step_number: 1,
            approver_id: firstStep.approver_id,
            status: 'pending',
            organization_id: profile!.organization_id,
          });

        if (stepError) throw stepError;
      }

      return instance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-instances'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
      toast.success('Approval process started');
    },
  });

  const approveStep = useMutation({
    mutationFn: async ({ stepId, comments }: { stepId: string; comments?: string }) => {
      // Get the step and instance
      const { data: step, error: stepFetchError } = await supabase
        .from('approval_steps')
        .select('*, instance:approval_instances(*, workflow:approval_workflows(*))')
        .eq('id', stepId)
        .single();

      if (stepFetchError) throw stepFetchError;

      // Update step
      const { error: updateError } = await supabase
        .from('approval_steps')
        .update({
          status: 'approved',
          comments,
          decided_at: new Date().toISOString(),
        })
        .eq('id', stepId);

      if (updateError) throw updateError;

      const instance = step.instance as any;
      const workflow = instance.workflow;
      const currentStepNum = instance.current_step;
      const nextStepNum = currentStepNum + 1;

      // Check if there are more steps
      if (nextStepNum <= workflow.steps.length) {
        const nextStep = workflow.steps[nextStepNum - 1];
        
        // Update instance to next step
        await supabase
          .from('approval_instances')
          .update({ current_step: nextStepNum, updated_at: new Date().toISOString() })
          .eq('id', instance.id);

        // Create next step record
        if (nextStep?.approver_id) {
          await supabase
            .from('approval_steps')
            .insert({
              instance_id: instance.id,
              step_number: nextStepNum,
              approver_id: nextStep.approver_id,
              status: 'pending',
              organization_id: profile!.organization_id,
            });
        }
      } else {
        // All steps complete - mark as approved
        await supabase
          .from('approval_instances')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', instance.id);
      }

      return step;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-instances'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
      toast.success('Approved');
    },
  });

  const rejectStep = useMutation({
    mutationFn: async ({ stepId, comments }: { stepId: string; comments?: string }) => {
      const { data: step, error: stepFetchError } = await supabase
        .from('approval_steps')
        .select('instance_id')
        .eq('id', stepId)
        .single();

      if (stepFetchError) throw stepFetchError;

      // Update step
      const { error: updateError } = await supabase
        .from('approval_steps')
        .update({
          status: 'rejected',
          comments,
          decided_at: new Date().toISOString(),
        })
        .eq('id', stepId);

      if (updateError) throw updateError;

      // Mark instance as rejected
      await supabase
        .from('approval_instances')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', step.instance_id);

      return step;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-instances'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
      toast.success('Rejected');
    },
  });

  return {
    workflows: workflowsQuery.data || [],
    instances: instancesQuery.data || [],
    myPendingApprovals: myPendingApprovalsQuery.data || [],
    isLoading: workflowsQuery.isLoading || instancesQuery.isLoading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startApproval,
    approveStep,
    rejectStep,
  };
};
