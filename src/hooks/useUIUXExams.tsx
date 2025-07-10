
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UIUXExam {
  id: string;
  title: string;
  description: string | null;
  questions: any[];
  time_limit_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UIUXExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  answers: Record<string, any>;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  time_taken_minutes: number | null;
}

export function useUIUXExams() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ['ui-ux-exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UIUXExam[];
    },
    enabled: !!profile,
  });

  const attemptsQuery = useQuery({
    queryKey: ['ui-ux-exam-attempts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as UIUXExamAttempt[];
    },
    enabled: !!profile?.id,
  });

  const startExamMutation = useMutation({
    mutationFn: async ({ examId }: { examId: string }) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert([{
          exam_id: examId,
          user_id: profile.id,
          started_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data as UIUXExamAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-ux-exam-attempts'] });
      toast.success('Exam started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start exam');
    },
  });

  const submitExamMutation = useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      score, 
      totalQuestions,
      timeTaken 
    }: { 
      attemptId: string; 
      answers: Record<string, any>; 
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
          time_taken_minutes: timeTaken,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data as UIUXExamAttempt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ui-ux-exam-attempts'] });
      const percentage = Math.round((data.score / data.total_questions) * 100);
      toast.success(`Exam submitted! Your score: ${data.score}/${data.total_questions} (${percentage}%)`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit exam');
    },
  });

  // Calculate user's best score for each exam
  const getBestScore = (examId: string) => {
    const examAttempts = attemptsQuery.data?.filter(attempt => 
      attempt.exam_id === examId && attempt.completed_at
    ) || [];
    
    if (examAttempts.length === 0) return null;
    
    return Math.max(...examAttempts.map(attempt => 
      Math.round((attempt.score / attempt.total_questions) * 100)
    ));
  };

  // Get latest attempt for an exam
  const getLatestAttempt = (examId: string) => {
    return attemptsQuery.data?.find(attempt => 
      attempt.exam_id === examId
    ) || null;
  };

  return {
    exams: examsQuery.data || [],
    attempts: attemptsQuery.data || [],
    isLoading: examsQuery.isLoading || attemptsQuery.isLoading,
    isError: examsQuery.isError || attemptsQuery.isError,
    startExam: startExamMutation.mutateAsync,
    submitExam: submitExamMutation.mutateAsync,
    isStarting: startExamMutation.isPending,
    isSubmitting: submitExamMutation.isPending,
    getBestScore,
    getLatestAttempt,
  };
}
