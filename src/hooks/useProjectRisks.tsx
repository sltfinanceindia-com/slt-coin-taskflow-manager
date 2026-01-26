import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ProjectRisk {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  category: 'technical' | 'resource' | 'schedule' | 'budget' | 'external' | 'other';
  probability: 'low' | 'medium' | 'high' | 'very_high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
  mitigation_plan: string | null;
  contingency_plan: string | null;
  owner_id: string | null;
  identified_date: string;
  review_date: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
  owner?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useProjectRisks(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const risksQuery = useQuery({
    queryKey: ['project-risks', profile?.organization_id, projectId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = (supabase as any)
        .from('project_risks')
        .select(`
          *,
          project:projects(id, name),
          owner:profiles!project_risks_owner_id_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ProjectRisk[];
    },
    enabled: !!profile?.organization_id,
  });

  const createRisk = useMutation({
    mutationFn: async (risk: Omit<ProjectRisk, 'id' | 'created_at' | 'updated_at' | 'project' | 'owner' | 'organization_id'>) => {
      const { data, error } = await (supabase as any)
        .from('project_risks')
        .insert({
          ...risk,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-risks'] });
      toast.success('Risk identified successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateRisk = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectRisk> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('project_risks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-risks'] });
      toast.success('Risk updated successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteRisk = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('project_risks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-risks'] });
      toast.success('Risk deleted successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Calculate risk score (probability x impact)
  const getRiskScore = (risk: ProjectRisk) => {
    const probScore = { low: 1, medium: 2, high: 3, very_high: 4 };
    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 };
    return probScore[risk.probability] * impactScore[risk.impact];
  };

  return {
    risks: risksQuery.data || [],
    isLoading: risksQuery.isLoading,
    error: risksQuery.error,
    createRisk,
    updateRisk,
    deleteRisk,
    getRiskScore,
  };
}