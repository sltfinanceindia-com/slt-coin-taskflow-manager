
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExamAttempt } from '@/types/exam';
import { useToast } from '@/hooks/use-toast';

export const useExamAttempts = () => {
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const startExam = async (examId: string) => {
    try {
      setIsStarting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Get exam details
      const { data: exam } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (!exam) throw new Error('Exam not found');

      // Create exam attempt
      const { data: attempt, error } = await supabase
        .from('ui_ux_exam_attempts')
        .insert({
          exam_id: examId,
          user_id: profile.id,
          total_questions: exam.total_questions,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentAttempt(attempt);
      setExamStartTime(new Date());
      
      console.log('Exam started, attempt ID:', attempt.id);
      return attempt;

    } catch (error) {
      console.error('Error starting exam:', error);
      toast({
        title: "Error",
        description: "Failed to start exam",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const getUserAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: attempt } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (attempt) {
        setCurrentAttempt(attempt);
      }
    } catch (error) {
      console.error('Error fetching user attempt:', error);
    }
  };

  useEffect(() => {
    getUserAttempt();
  }, []);

  return {
    currentAttempt,
    isStarting,
    examStartTime,
    startExam,
    setCurrentAttempt
  };
};
