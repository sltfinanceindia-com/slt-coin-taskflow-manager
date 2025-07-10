import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UIUXExam {
  id: string;
  title: string;
  description: string;
  questions: any;
  time_limit_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UIUXExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  answers: any;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  time_taken_minutes: number | null;
}

export function useUIUXExams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active exam for current user
  const activeExamQuery = useQuery({
    queryKey: ['active-uiux-exam'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
  });

  // Fetch user's exam attempts
  const userAttemptsQuery = useQuery({
    queryKey: ['user-uiux-exam-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .select(`
          *,
          ui_ux_exams (
            title,
            description
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Start exam attempt
  const startExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      // First get the user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert([
          {
            exam_id: examId,
            user_id: profile.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-uiux-exam-attempts'] });
      toast({
        title: 'Exam Started',
        description: 'Your UI/UX exam has been started. Good luck!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start exam. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Submit exam attempt
  const submitExamMutation = useMutation({
    mutationFn: async ({
      attemptId,
      answers,
      score,
      totalQuestions,
      timeTaken,
    }: {
      attemptId: string;
      answers: any;
      score: number;
      totalQuestions: number;
      timeTaken: number;
    }) => {
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .update({
          answers,
          score,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString(),
          time_taken_minutes: Math.round(timeTaken / 60),
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-uiux-exam-attempts'] });
      const percentage = Math.round((data.score / data.total_questions) * 100);
      toast({
        title: 'Exam Completed!',
        description: `You scored ${data.score}/${data.total_questions} (${percentage}%)`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit exam. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    activeExam: activeExamQuery.data,
    isLoadingActiveExam: activeExamQuery.isLoading,
    userAttempts: userAttemptsQuery.data || [],
    isLoadingAttempts: userAttemptsQuery.isLoading,
    startExam: startExamMutation.mutate,
    isStartingExam: startExamMutation.isPending,
    submitExam: submitExamMutation.mutate,
    isSubmittingExam: submitExamMutation.isPending,
  };
}

// Admin hook for managing exams
export function useUIUXExamsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all exam attempts for admin
  const allAttemptsQuery = useQuery({
    queryKey: ['all-uiux-exam-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .select(`
          *,
          ui_ux_exams (
            title,
            description
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return {
    allAttempts: allAttemptsQuery.data || [],
    isLoadingAttempts: allAttemptsQuery.isLoading,
  };
}