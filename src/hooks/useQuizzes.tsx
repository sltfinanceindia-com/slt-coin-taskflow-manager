import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

export interface QuizTemplate {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  questions: QuizQuestion[];
  time_per_question_seconds: number;
  total_questions: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  creator_profile?: {
    id: string;
    full_name: string;
  };
}

export interface QuizAttempt {
  id: string;
  quiz_template_id: string;
  user_id: string;
  task_id?: string;
  answers: Record<string, number>;
  score: number;
  max_score: number;
  completed_at?: string;
  started_at: string;
  time_taken_seconds?: number;
  created_at: string;
  quiz_template?: QuizTemplate;
  user_profile?: {
    id: string;
    full_name: string;
  };
}

export function useQuizzes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const quizTemplatesQuery = useQuery({
    queryKey: ['quiz-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_templates')
        .select(`
          *,
          creator_profile:profiles!quiz_templates_created_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(template => ({
        ...template,
        questions: Array.isArray(template.questions) ? template.questions as unknown as QuizQuestion[] : []
      })) as QuizTemplate[];
    },
    enabled: !!profile,
  });

  const quizAttemptsQuery = useQuery({
    queryKey: ['quiz-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz_template:quiz_templates(*),
          user_profile:profiles!quiz_attempts_user_id_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(attempt => ({
        ...attempt,
        quiz_template: attempt.quiz_template ? {
          ...attempt.quiz_template,
          questions: Array.isArray(attempt.quiz_template.questions) ? attempt.quiz_template.questions as unknown as QuizQuestion[] : []
        } : undefined,
        answers: typeof attempt.answers === 'object' ? attempt.answers as Record<string, number> : {}
      })) as QuizAttempt[];
    },
    enabled: !!profile,
  });

  const createQuizTemplateMutation = useMutation({
    mutationFn: async (templateData: {
      title: string;
      description?: string;
      questions: QuizQuestion[];
      time_per_question_seconds: number;
      total_questions: number;
    }) => {
      const { data, error } = await supabase
        .from('quiz_templates')
        .insert([{
          ...templateData,
          questions: templateData.questions as any,
          created_by: profile?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-templates'] });
      toast({
        title: "Quiz Template Created",
        description: "Quiz template has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Quiz Template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishQuizTemplateMutation = useMutation({
    mutationFn: async ({ templateId, published }: { templateId: string; published: boolean }) => {
      const { data, error } = await supabase
        .from('quiz_templates')
        .update({ is_published: published })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-templates'] });
      toast({
        title: "Quiz Template Updated",
        description: "Quiz template publication status updated.",
      });
    },
  });

  const startQuizAttemptMutation = useMutation({
    mutationFn: async ({ quizTemplateId, taskId }: { quizTemplateId: string; taskId?: string }) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([{
          quiz_template_id: quizTemplateId,
          user_id: profile?.id,
          task_id: taskId,
          started_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });

  const submitQuizAttemptMutation = useMutation({
    mutationFn: async ({ attemptId, answers, score, maxScore, timeTaken }: {
      attemptId: string;
      answers: Record<string, number>;
      score: number;
      maxScore: number;
      timeTaken: number;
    }) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score,
          max_score: maxScore,
          completed_at: new Date().toISOString(),
          time_taken_seconds: timeTaken,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      toast({
        title: "Quiz Submitted",
        description: "Your quiz has been submitted successfully.",
      });
    },
  });

  return {
    quizTemplates: quizTemplatesQuery.data || [],
    quizAttempts: quizAttemptsQuery.data || [],
    isLoading: quizTemplatesQuery.isLoading || quizAttemptsQuery.isLoading,
    error: quizTemplatesQuery.error || quizAttemptsQuery.error,
    createQuizTemplate: createQuizTemplateMutation.mutate,
    publishQuizTemplate: publishQuizTemplateMutation.mutate,
    startQuizAttempt: startQuizAttemptMutation.mutate,
    submitQuizAttempt: submitQuizAttemptMutation.mutate,
    isCreating: createQuizTemplateMutation.isPending,
    isPublishing: publishQuizTemplateMutation.isPending,
    isStarting: startQuizAttemptMutation.isPending,
    isSubmitting: submitQuizAttemptMutation.isPending,
  };
}