
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
      
      // Remove duplicates based on ID (in case there are any)
      const uniqueExams = data?.filter((exam, index, self) => 
        index === self.findIndex(e => e.id === exam.id)
      ) || [];
      
      return uniqueExams as UIUXExam[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      
      // Get only the most recent attempt per exam
      const latestAttempts = data?.reduce((acc, attempt) => {
        const existing = acc.find(a => a.exam_id === attempt.exam_id);
        if (!existing || new Date(attempt.started_at) > new Date(existing.started_at)) {
          return [...acc.filter(a => a.exam_id !== attempt.exam_id), attempt];
        }
        return acc;
      }, [] as any[]) || [];
      
      return latestAttempts as UIUXExamAttempt[];
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
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
