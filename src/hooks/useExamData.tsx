
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UIUXExam, UIUXExamAttempt } from '@/types/exam';

export const useExamData = () => {
  const [exams, setExams] = useState<UIUXExam[]>([]);
  const [attempts, setAttempts] = useState<UIUXExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      
      const { data: examsData, error } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exams:', error);
        return;
      }

      setExams(examsData || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: attemptsData, error } = await supabase
        .from('ui_ux_exam_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempts:', error);
        return;
      }

      setAttempts(attemptsData || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchUserAttempts();
  }, []);

  return {
    exams,
    attempts,
    isLoading,
    fetchExams,
    fetchUserAttempts
  };
};
