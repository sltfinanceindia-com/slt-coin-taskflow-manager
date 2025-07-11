
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useAssessmentAttempts(assessmentId?: string) {
  const { profile } = useAuth();

  const attemptsQuery = useQuery({
    queryKey: ['assessment-attempts', assessmentId],
    queryFn: async () => {
      let query = supabase
        .from('assessment_attempts')
        .select(`
          *,
          assessments!inner(title, passing_score),
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      }

      // If not admin, only show own attempts
      if (profile?.role !== 'admin') {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const getAttemptAnswers = async (attemptId: string) => {
    const { data, error } = await supabase
      .from('assessment_answers')
      .select(`
        *,
        assessment_questions!inner(
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          question_order
        )
      `)
      .eq('attempt_id', attemptId)
      .order('assessment_questions(question_order)');

    if (error) throw error;
    return data;
  };

  return {
    attempts: attemptsQuery.data || [],
    isLoading: attemptsQuery.isLoading,
    error: attemptsQuery.error,
    getAttemptAnswers,
  };
}
