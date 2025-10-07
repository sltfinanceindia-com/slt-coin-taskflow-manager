import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AssessmentAssignment {
  id: string;
  assessment_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date?: string;
  status: 'assigned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  assessments?: {
    title: string;
    description?: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function useAssessmentAssignments() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ['assessment-assignments', profile?.id],
    queryFn: async () => {
      let query = supabase
        .from('assessment_assignments')
        .select(`
          *,
          assessments!assessment_assignments_assessment_id_fkey(title, description),
          profiles!assessment_assignments_user_id_fkey(full_name, email)
        `)
        .order('assigned_at', { ascending: false });

      // If not admin, only show own assignments
      if (profile?.role !== 'admin') {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AssessmentAssignment[];
    },
    enabled: !!profile,
  });

  const assignAssessmentMutation = useMutation({
    mutationFn: async ({ assessmentId, userId, dueDate }: { assessmentId: string; userId: string; dueDate?: string }) => {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .insert({
          assessment_id: assessmentId,
          user_id: userId,
          assigned_by: profile?.id,
          due_date: dueDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-assignments'] });
      toast({
        title: 'Success',
        description: 'Assessment assigned successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign assessment',
        variant: 'destructive',
      });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('assessment_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-assignments'] });
      toast({
        title: 'Success',
        description: 'Assignment removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove assignment',
        variant: 'destructive',
      });
    },
  });

  return {
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    error: assignmentsQuery.error,
    assignAssessment: assignAssessmentMutation.mutate,
    removeAssignment: removeAssignmentMutation.mutate,
    isAssigning: assignAssessmentMutation.isPending,
    isRemoving: removeAssignmentMutation.isPending,
  };
}
