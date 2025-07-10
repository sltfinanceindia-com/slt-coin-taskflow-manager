import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TrainingAssessment {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  passing_score: number | null;
  questions: any[];
  section_id: string;
  is_published: boolean;
  order_index: number | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  score: number;
  max_score: number;
  started_at: string | null;
  completed_at: string | null;
  is_passed: boolean | null;
  attempt_number: number | null;
  answers: any;
}

export function useTrainingAssessments(sectionId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch assessments for a specific section
  const assessmentsQuery = useQuery({
    queryKey: ['training-assessments', sectionId],
    queryFn: async () => {
      let query = supabase
        .from('training_assessments')
        .select('*')
        .eq('is_published', true)
        .order('order_index');
      
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TrainingAssessment[];
    },
    enabled: !!sectionId
  });

  // Fetch user's attempts for assessments
  const attemptsQuery = useQuery({
    queryKey: ['assessment-attempts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('training_assessment_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AssessmentAttempt[];
    },
    enabled: !!profile?.id
  });

  // Start an assessment attempt
  const startAttemptMutation = useMutation({
    mutationFn: async ({ assessmentId }: { assessmentId: string }) => {
      if (!profile?.id) throw new Error('User not found');
      
      // Check existing attempts
      const { data: existingAttempts } = await supabase
        .from('training_assessment_attempts')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('user_id', profile.id);
      
      const assessment = assessmentsQuery.data?.find(a => a.id === assessmentId);
      const attemptNumber = (existingAttempts?.length || 0) + 1;
      
      if (assessment?.max_attempts && attemptNumber > assessment.max_attempts) {
        throw new Error('Maximum attempts exceeded');
      }
      
      const { data, error } = await supabase
        .from('training_assessment_attempts')
        .insert({
          assessment_id: assessmentId,
          user_id: profile.id,
          attempt_number: attemptNumber,
          max_score: assessment?.questions?.length || 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AssessmentAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
      toast.success('Assessment started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start assessment');
    }
  });

  // Submit assessment attempt
  const submitAttemptMutation = useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      score 
    }: { 
      attemptId: string; 
      answers: any; 
      score: number; 
    }) => {
      const { data, error } = await supabase
        .from('training_assessment_attempts')
        .update({
          answers,
          score,
          completed_at: new Date().toISOString(),
          is_passed: score >= 70 // Default passing score, could be dynamic
        })
        .eq('id', attemptId)
        .select()
        .single();
      
      if (error) throw error;
      return data as AssessmentAttempt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
      const passed = data.is_passed ? 'passed' : 'failed';
      toast.success(`Assessment completed! You ${passed} with ${data.score}/${data.max_score}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit assessment');
    }
  });

  return {
    assessments: assessmentsQuery.data || [],
    attempts: attemptsQuery.data || [],
    isLoading: assessmentsQuery.isLoading || attemptsQuery.isLoading,
    isError: assessmentsQuery.isError || attemptsQuery.isError,
    startAttempt: startAttemptMutation.mutateAsync,
    submitAttempt: submitAttemptMutation.mutateAsync,
    isStarting: startAttemptMutation.isPending,
    isSubmitting: submitAttemptMutation.isPending
  };
}