
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

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
  answers: any;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  time_taken_minutes: number | null;
}

export function useUIUXExams() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available exams
  const { data: exams = [], isLoading: examsLoading } = useQuery({
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
  });

  // Fetch user's exam attempts
  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
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

  // Start exam mutation
  const startExam = useMutation({
    mutationFn: async (examId: string) => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert({
          exam_id: examId,
          user_id: profile.id,
          answers: {},
          score: 0,
          total_questions: 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as UIUXExamAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-ux-exam-attempts'] });
      toast({
        title: "Exam Started",
        description: "Your exam has been started. Good luck!",
      });
    },
    onError: (error) => {
      console.error('Failed to start exam:', error);
      toast({
        title: "Error",
        description: "Failed to start exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit exam mutation
  const submitExam = useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      score, 
      totalQuestions 
    }: { 
      attemptId: string; 
      answers: any; 
      score: number; 
      totalQuestions: number;
    }) => {
      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .update({
          answers,
          score,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString(),
          time_taken_minutes: null, // Will be calculated on frontend
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data as UIUXExamAttempt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ui-ux-exam-attempts'] });
      toast({
        title: "Exam Submitted",
        description: `Your exam has been submitted. Score: ${data.score}/${data.total_questions}`,
      });
    },
    onError: (error) => {
      console.error('Failed to submit exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    exams,
    attempts,
    isLoading: examsLoading || attemptsLoading,
    startExam: startExam.mutate,
    isStarting: startExam.isPending,
    submitExam: submitExam.mutate,
    isSubmitting: submitExam.isPending,
  };
}
