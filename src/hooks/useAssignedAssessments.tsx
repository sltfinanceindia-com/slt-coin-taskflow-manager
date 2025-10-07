import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useAssignedAssessments() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['assigned-assessments', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          *,
          assessments!assessment_assignments_assessment_id_fkey(
            id,
            title,
            description,
            time_limit_minutes,
            total_questions,
            passing_score,
            is_published
          )
        `)
        .eq('user_id', profile?.id)
        .eq('status', 'assigned')
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Filter out assessments that are published
      return data?.filter(assignment => assignment.assessments?.is_published) || [];
    },
    enabled: !!profile && profile.role !== 'admin',
  });
}
