
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface UIUXExam {
  id: string;
  title: string;
  description: string | null;
  questions: UIUXQuestion[];
  time_limit_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_questions: number;
}

export interface UIUXQuestion {
  id: string;
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer?: number; // Only available for admins
}

export interface UIUXExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  time_taken_minutes: number | null;
  is_passed: boolean | null;
}

export function useUIUXExams() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available exams with questions (without correct answers for users)
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['ui-ux-exams'],
    queryFn: async () => {
      const { data: examData, error: examError } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (examError) throw examError;

      // Fetch questions and options for each exam
      const examsWithQuestions = await Promise.all(
        examData.map(async (exam) => {
          const { data: questions, error: questionsError } = await supabase
            .from('exam_questions')
            .select(`
              id,
              question_number,
              question_text,
              question_options (
                option_number,
                option_text,
                is_correct
              )
            `)
            .eq('exam_id', exam.id)
            .order('question_number');

          if (questionsError) throw questionsError;

          const formattedQuestions = questions.map((q: any) => {
            const options = q.question_options
              .sort((a: any, b: any) => a.option_number - b.option_number)
              .map((opt: any) => opt.option_text);

            const question: UIUXQuestion = {
              id: q.id,
              question_number: q.question_number,
              question_text: q.question_text,
              options
            };

            // Only include correct answer for admins
            if (profile?.role === 'admin') {
              const correctOption = q.question_options.find((opt: any) => opt.is_correct);
              if (correctOption) {
                question.correct_answer = correctOption.option_number;
              }
            }

            return question;
          });

          return {
            ...exam,
            questions: formattedQuestions
          } as UIUXExam;
        })
      );

      return examsWithQuestions;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  // Start exam mutation - prevents duplicates
  const startExam = useMutation({
    mutationFn: async (examId: string) => {
      if (!profile?.id) throw new Error('User not authenticated');

      // Check for existing incomplete attempt
      const { data: existingAttempt } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', profile.id)
        .is('completed_at', null)
        .maybeSingle();

      if (existingAttempt) {
        return existingAttempt as UIUXExamAttempt;
      }

      // Check if user has already completed this exam
      const { data: completedAttempt } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', profile.id)
        .not('completed_at', 'is', null)
        .maybeSingle();

      if (completedAttempt) {
        throw new Error('You have already completed this exam');
      }

      const { data, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert({
          exam_id: examId,
          user_id: profile.id,
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
    onError: (error: any) => {
      console.error('Failed to start exam:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit exam mutation with server-side auto-evaluation
  const submitExam = useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers 
    }: { 
      attemptId: string; 
      answers: { [key: number]: number };
    }) => {
      console.log('Submitting exam with data:', { attemptId, answers });
      
      // Get the attempt to find the exam
      const { data: attempt, error: attemptError } = await supabase
        .from('ui_ux_exam_attempts')
        .select('exam_id')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      // Get exam questions with correct answers for scoring
      const { data: questions, error: questionsError } = await supabase
        .from('exam_questions')
        .select(`
          id,
          question_number,
          question_options (
            option_number,
            is_correct
          )
        `)
        .eq('exam_id', attempt.exam_id)
        .order('question_number');

      if (questionsError) throw questionsError;

      // Calculate score and store individual answers
      let correctCount = 0;
      const userAnswerPromises = [];

      for (const question of questions) {
        const questionIndex = question.question_number - 1; // Convert to 0-based index
        const userSelectedOption = answers[questionIndex];
        
        let isCorrect = false;
        let selectedOptionId = null;

        if (userSelectedOption !== undefined) {
          const correctOption = question.question_options.find((opt: any) => opt.is_correct);
          const selectedOption = question.question_options.find((opt: any) => opt.option_number === userSelectedOption);
          
          if (selectedOption) {
            selectedOptionId = selectedOption.id;
            isCorrect = selectedOption.is_correct;
            if (isCorrect) correctCount++;
          }
        }

        // Store individual answer
        userAnswerPromises.push(
          supabase
            .from('user_answers')
            .insert({
              attempt_id: attemptId,
              question_id: question.id,
              selected_option_id: selectedOptionId,
              is_correct: isCorrect
            })
        );
      }

      // Save all user answers
      await Promise.all(userAnswerPromises);

      // Calculate final score and update attempt
      const totalQuestions = questions.length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
      const isPassed = scorePercentage >= 70; // Assuming 70% is passing

      const { data: updatedAttempt, error: updateError } = await supabase
        .from('ui_ux_exam_attempts')
        .update({
          score: correctCount,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString(),
          is_passed: isPassed
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      console.log('Exam submitted successfully:', updatedAttempt);
      return updatedAttempt as UIUXExamAttempt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ui-ux-exam-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
      const percentage = Math.round((data.score / data.total_questions) * 100);
      toast({
        title: data.is_passed ? "Exam Passed!" : "Exam Completed",
        description: `Your score: ${data.score}/${data.total_questions} (${percentage}%)`,
        variant: data.is_passed ? "default" : "destructive",
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
