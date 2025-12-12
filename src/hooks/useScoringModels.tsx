import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface ScoringCriterion {
  name: string;
  label: string;
  weight: number;
  scale_min: number;
  scale_max: number;
  description?: string;
}

export interface ScoringModel {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  criteria: ScoringCriterion[];
  organization_id: string;
  created_by: string | null;
  created_at: string;
}

export interface ProjectScore {
  id: string;
  project_id: string;
  scoring_model_id: string;
  criteria_scores: Record<string, number>;
  total_score: number;
  calculated_at: string;
  calculated_by: string | null;
  notes: string | null;
  organization_id: string;
  project?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface PortfolioRanking {
  project_id: string;
  project_name: string;
  project_status: string;
  total_score: number;
  criteria_scores: Record<string, number>;
  rank: number;
}

export function useScoringModels() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch scoring models
  const modelsQuery = useQuery({
    queryKey: ['scoring-models', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scoring_models')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        criteria: (d.criteria as unknown as ScoringCriterion[]) || [],
      })) as ScoringModel[];
    },
    enabled: !!profile?.organization_id,
  });

  // Create scoring model
  const createModelMutation = useMutation({
    mutationFn: async (model: {
      name: string;
      description?: string;
      criteria: ScoringCriterion[];
      is_default?: boolean;
    }) => {
      // If setting as default, unset other defaults first
      if (model.is_default) {
        await supabase
          .from('scoring_models')
          .update({ is_default: false })
          .eq('organization_id', profile?.organization_id);
      }

      const { data, error } = await supabase
        .from('scoring_models')
        .insert({
          name: model.name,
          description: model.description || null,
          criteria: model.criteria as unknown as Json,
          is_default: model.is_default || false,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-models'] });
      toast({
        title: "Model Created",
        description: "Scoring model has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update scoring model
  const updateModelMutation = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<ScoringModel>;
    }) => {
      if (updates.is_default) {
        await supabase
          .from('scoring_models')
          .update({ is_default: false })
          .eq('organization_id', profile?.organization_id);
      }

      const dbUpdates = {
        ...updates,
        criteria: updates.criteria ? (updates.criteria as unknown as Json) : undefined,
      };

      const { error } = await supabase
        .from('scoring_models')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-models'] });
      toast({
        title: "Model Updated",
        description: "Scoring model has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete scoring model
  const deleteModelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scoring_models')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-models'] });
      toast({
        title: "Model Deleted",
        description: "Scoring model has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    models: modelsQuery.data || [],
    isLoading: modelsQuery.isLoading,
    createModel: createModelMutation.mutateAsync,
    isCreating: createModelMutation.isPending,
    updateModel: (id: string, updates: Partial<ScoringModel>) => 
      updateModelMutation.mutate({ id, updates }),
    deleteModel: (id: string) => deleteModelMutation.mutate(id),
  };
}

export function useProjectScores(modelId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch project scores
  const scoresQuery = useQuery({
    queryKey: ['project-scores', modelId],
    queryFn: async () => {
      let query = supabase
        .from('project_scores')
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .eq('organization_id', profile?.organization_id);

      if (modelId) {
        query = query.eq('scoring_model_id', modelId);
      }

      const { data, error } = await query.order('total_score', { ascending: false });

      if (error) throw error;
      return data as ProjectScore[];
    },
    enabled: !!profile?.organization_id,
  });

  // Save/update project score
  const saveScoreMutation = useMutation({
    mutationFn: async ({
      projectId,
      modelId,
      criteriaScores,
      notes,
    }: {
      projectId: string;
      modelId: string;
      criteriaScores: Record<string, number>;
      notes?: string;
    }) => {
      // Calculate total score using RPC
      const { data: totalScore } = await supabase.rpc('calculate_project_score', {
        p_criteria_scores: criteriaScores,
        p_model_id: modelId,
      });

      const { data, error } = await supabase
        .from('project_scores')
        .upsert({
          project_id: projectId,
          scoring_model_id: modelId,
          criteria_scores: criteriaScores,
          total_score: totalScore || 0,
          calculated_at: new Date().toISOString(),
          calculated_by: profile?.id,
          notes: notes || null,
          organization_id: profile?.organization_id,
        }, {
          onConflict: 'project_id,scoring_model_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-scores'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-ranking'] });
      toast({
        title: "Score Saved",
        description: "Project score has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get portfolio ranking
  const getPortfolioRanking = async (modelId?: string): Promise<PortfolioRanking[]> => {
    const { data, error } = await supabase.rpc('get_portfolio_ranking', {
      p_model_id: modelId || null,
    });

    if (error) {
      console.error('Error getting ranking:', error);
      return [];
    }

    return (data || []).map(d => ({
      ...d,
      criteria_scores: (d.criteria_scores as unknown as Record<string, number>) || {},
    })) as PortfolioRanking[];
  };

  return {
    scores: scoresQuery.data || [],
    isLoading: scoresQuery.isLoading,
    saveScore: saveScoreMutation.mutateAsync,
    isSaving: saveScoreMutation.isPending,
    getPortfolioRanking,
  };
}
