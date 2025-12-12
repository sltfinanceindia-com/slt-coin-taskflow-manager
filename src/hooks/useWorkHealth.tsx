import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface RiskAssessment {
  id: string;
  project_id: string;
  assessment_date: string;
  assessor_id: string;
  schedule_risk: number;
  budget_risk: number;
  scope_risk: number;
  resource_risk: number;
  quality_risk: number;
  overall_risk_score: number;
  risk_trend: string;
  mitigation_notes: string | null;
  organization_id: string | null;
  created_at: string;
  project?: {
    name: string;
  };
  assessor?: {
    full_name: string;
  };
}

export interface EarlyWarning {
  id: string;
  project_id: string | null;
  task_id: string | null;
  warning_type: string;
  severity: string;
  description: string;
  suggested_action: string | null;
  prediction_confidence: number;
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  is_resolved: boolean;
  resolution_notes: string | null;
  resolved_at: string | null;
  organization_id: string | null;
  created_at: string;
  project?: {
    name: string;
  };
  task?: {
    title: string;
  };
}

export interface ProjectRiskScore {
  overall_score: number;
  schedule_score: number;
  resource_score: number;
  task_health_score: number;
  risk_level: string;
}

export const useWorkHealth = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all risk assessments
  const { data: riskAssessments = [], isLoading: loadingAssessments } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select(`
          *,
          project:projects(name),
          assessor:profiles!risk_assessments_assessor_id_fkey(full_name)
        `)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data as RiskAssessment[];
    },
    enabled: !!profile,
  });

  // Fetch early warnings
  const { data: earlyWarnings = [], isLoading: loadingWarnings, refetch: refetchWarnings } = useQuery({
    queryKey: ['early-warnings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('early_warnings')
        .select(`
          *,
          project:projects(name),
          task:tasks(title)
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EarlyWarning[];
    },
    enabled: !!profile,
  });

  // Create risk assessment
  const createAssessment = useMutation({
    mutationFn: async (assessment: {
      project_id: string;
      schedule_risk: number;
      budget_risk: number;
      scope_risk: number;
      resource_risk: number;
      quality_risk: number;
      risk_trend?: string;
      mitigation_notes?: string;
    }) => {
      if (!profile) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('risk_assessments')
        .insert({
          ...assessment,
          assessor_id: profile.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast({ title: 'Risk assessment created' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create risk assessment',
        variant: 'destructive',
      });
    },
  });

  // Acknowledge warning
  const acknowledgeWarning = useMutation({
    mutationFn: async (warningId: string) => {
      if (!profile) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('early_warnings')
        .update({
          is_acknowledged: true,
          acknowledged_by: profile.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', warningId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['early-warnings'] });
      toast({ title: 'Warning acknowledged' });
    },
  });

  // Resolve warning
  const resolveWarning = useMutation({
    mutationFn: async ({ id, resolution_notes }: { id: string; resolution_notes?: string }) => {
      const { error } = await supabase
        .from('early_warnings')
        .update({
          is_resolved: true,
          resolution_notes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['early-warnings'] });
      toast({ title: 'Warning resolved' });
    },
  });

  // Detect new warnings
  const detectWarnings = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data, error } = await supabase
        .rpc('detect_early_warnings', { p_org_id: profile.organization_id });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['early-warnings'] });
      if (count > 0) {
        toast({ title: `${count} new warning(s) detected` });
      }
    },
  });

  // Get project risk score
  const getProjectRiskScore = async (projectId: string): Promise<ProjectRiskScore | null> => {
    const { data, error } = await supabase
      .rpc('calculate_project_risk_score', { p_project_id: projectId });

    if (error) {
      console.error('Error calculating risk score:', error);
      return null;
    }

    return data?.[0] || null;
  };

  // Calculate summary stats
  const summaryStats = {
    totalWarnings: earlyWarnings.length,
    criticalWarnings: earlyWarnings.filter(w => w.severity === 'critical').length,
    highWarnings: earlyWarnings.filter(w => w.severity === 'high').length,
    unacknowledged: earlyWarnings.filter(w => !w.is_acknowledged).length,
    avgRiskScore: riskAssessments.length > 0
      ? riskAssessments.reduce((sum, a) => sum + Number(a.overall_risk_score), 0) / riskAssessments.length
      : 0,
  };

  return {
    riskAssessments,
    earlyWarnings,
    summaryStats,
    isLoading: loadingAssessments || loadingWarnings,
    createAssessment,
    acknowledgeWarning,
    resolveWarning,
    detectWarnings,
    getProjectRiskScore,
    refetchWarnings,
  };
};
