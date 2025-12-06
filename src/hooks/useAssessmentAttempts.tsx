import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface AssessmentAttemptWithDetails {
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
  assessments: {
    title: string;
    passing_score: number;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export function useAssessmentAttempts(assessmentId?: string) {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();

  const attemptsQuery = useQuery({
    queryKey: ['assessment-attempts', assessmentId, profile?.organization_id, isAdmin],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('assessment_attempts')
        .select(`
          *,
          assessments!assessment_attempts_assessment_id_fkey(title, passing_score),
          profiles!assessment_attempts_user_id_fkey(full_name, email)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      }

      // If not admin, only show own attempts
      if (!isAdmin) {
        query = query.eq('user_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AssessmentAttemptWithDetails[];
    },
    enabled: !!profile?.organization_id,
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
