import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  question_order: number;
  created_at: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  started_at: string;
  submitted_at?: string;
  time_remaining_seconds?: number;
  status: 'in_progress' | 'submitted' | 'expired';
  score?: number;
  total_questions?: number;
  correct_answers?: number;
  is_passed?: boolean;
  created_at: string;
}

export interface AssessmentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer?: 'A' | 'B' | 'C' | 'D';
  is_correct?: boolean;
  answered_at: string;
}

export function useAssessments() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  
  // Get assigned assessments for non-admin users
  const { data: assignedAssessmentsData = [] } = useQuery({
    queryKey: ['assigned-assessments-for-filter', profile?.id],
    queryFn: async () => {
      if (isAdmin) return [];
      
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select('assessment_id')
        .eq('user_id', profile?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile && !isAdmin,
  });

  const assessmentsQuery = useQuery({
    queryKey: ['assessments', profile?.organization_id, isAdmin],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('assessments')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      // If user is not admin, only show assigned assessments
      if (!isAdmin) {
        const assignedIds = assignedAssessmentsData.map((a: any) => a.assessment_id);
        if (assignedIds.length === 0) {
          return []; // No assigned assessments
        }
        query = query.in('id', assignedIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Assessment[];
    },
    enabled: !!profile?.organization_id,
  });

  const getAssessmentQuestions = async (assessmentId: string) => {
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('question_order');

    if (error) throw error;
    return data as AssessmentQuestion[];
  };

  const startAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .insert({
          assessment_id: assessmentId,
          user_id: profile!.id,
          organization_id: profile!.organization_id,
          status: 'in_progress',
          time_remaining_seconds: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AssessmentAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
      toast({
        title: "Assessment Started",
        description: "Your assessment has begun. Good luck!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Starting Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ attemptId, questionId, selectedAnswer }: {
      attemptId: string;
      questionId: string;
      selectedAnswer: 'A' | 'B' | 'C' | 'D';
    }) => {
      const { data, error } = await supabase
        .from('assessment_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_answer: selectedAnswer,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AssessmentAnswer;
    },
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (attemptId: string) => {
      // First, calculate the score
      const { data: answers, error: answersError } = await supabase
        .from('assessment_answers')
        .select(`
          *,
          assessment_questions!inner(correct_answer)
        `)
        .eq('attempt_id', attemptId);

      if (answersError) throw answersError;

      const totalQuestions = answers.length;
      const correctAnswers = answers.filter(answer => 
        answer.selected_answer === answer.assessment_questions.correct_answer
      ).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Get the assessment to check passing score
      const { data: attempt, error: attemptError } = await supabase
        .from('assessment_attempts')
        .select(`
          *,
          assessments!inner(passing_score)
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      const isPassed = score >= attempt.assessments.passing_score;

      // Update the attempt with results
      const { data, error } = await supabase
        .from('assessment_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          score,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          is_passed: isPassed,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;

      // Update correct/incorrect status for all answers
      await Promise.all(answers.map(answer => 
        supabase
          .from('assessment_answers')
          .update({
            is_correct: answer.selected_answer === answer.assessment_questions.correct_answer
          })
          .eq('id', answer.id)
      ));

      return data as AssessmentAttempt;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
      toast({
        title: result.is_passed ? "Assessment Passed!" : "Assessment Completed",
        description: result.is_passed 
          ? `Congratulations! You scored ${result.score}%`
          : `You scored ${result.score}%. You need 70% to pass.`,
        variant: result.is_passed ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Submitting Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    assessments: assessmentsQuery.data || [],
    isLoading: assessmentsQuery.isLoading,
    error: assessmentsQuery.error,
    getAssessmentQuestions,
    startAssessment: startAssessmentMutation.mutate,
    submitAnswer: submitAnswerMutation.mutate,
    submitAssessment: submitAssessmentMutation.mutate,
    isStarting: startAssessmentMutation.isPending,
    isSubmitting: submitAssessmentMutation.isPending,
  };
}
