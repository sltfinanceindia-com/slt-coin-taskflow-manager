
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UIUXExam, ExamQuestion } from '@/types/exam';
import { useToast } from '@/hooks/use-toast';

export const useExamQuestions = () => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [examWithQuestions, setExamWithQuestions] = useState<UIUXExam | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      
      // Get active exam
      const { data: exam, error: examError } = await supabase
        .from('ui_ux_exams')
        .select('*')
        .eq('is_active', true)
        .single();

      if (examError || !exam) {
        throw new Error('No active exam found');
      }

      // Get questions with options
      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select(`
          id,
          question_number,
          question_text,
          question_options (
            id,
            option_number,
            option_text,
            is_correct
          )
        `)
        .eq('exam_id', exam.id)
        .order('question_number');

      if (questionsError) {
        throw new Error('Failed to fetch questions');
      }

      // Transform the data
      const formattedQuestions: ExamQuestion[] = questionsData.map(q => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        options: (q.question_options || [])
          .sort((a, b) => a.option_number - b.option_number)
          .map(opt => ({
            id: opt.id,
            option_number: opt.option_number,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          }))
      }));

      setQuestions(formattedQuestions);
      
      // Set exam with questions for the popup
      setExamWithQuestions({
        ...exam,
        questions: formattedQuestions
      });
      
      console.log('Loaded questions:', formattedQuestions.length);
      
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      toast({
        title: "Error",
        description: "Failed to load exam questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamQuestions();
  }, []);

  return {
    questions,
    examWithQuestions,
    loading,
    fetchExamQuestions
  };
};
