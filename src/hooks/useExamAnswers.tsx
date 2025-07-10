
import { useState, useEffect } from 'react';
import { UIUXExamAttempt } from '@/hooks/useUIUXExams';
import { supabase } from '@/integrations/supabase/client';

export function useExamAnswers(attempt: UIUXExamAttempt | null, isOpen: boolean) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  // Load existing answers from user_answers table if resuming
  useEffect(() => {
    const loadExistingAnswers = async () => {
      if (isOpen && attempt?.id && !attempt.completed_at) {
        console.log('Loading existing answers for attempt:', attempt.id);
        
        const { data: userAnswers, error } = await supabase
          .from('user_answers')
          .select(`
            question_id,
            selected_option_id,
            exam_questions!inner(question_number),
            question_options!inner(option_number)
          `)
          .eq('attempt_id', attempt.id);

        if (error) {
          console.error('Error loading existing answers:', error);
          setAnswers({});
          return;
        }

        if (userAnswers && userAnswers.length > 0) {
          const answersMap: { [key: number]: number } = {};
          userAnswers.forEach((answer: any) => {
            if (answer.exam_questions && answer.question_options) {
              const questionIndex = answer.exam_questions.question_number - 1; // Convert to 0-based index
              const selectedOption = answer.question_options.option_number - 1; // Convert to 0-based index for consistency
              answersMap[questionIndex] = selectedOption;
            }
          });
          console.log('Loaded existing answers:', answersMap);
          setAnswers(answersMap);
        } else {
          setAnswers({});
        }
      } else {
        setAnswers({});
      }
    };

    loadExistingAnswers();
  }, [isOpen, attempt]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    console.log(`Answer selected for question ${questionIndex}: option ${optionIndex}`);
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionIndex]: optionIndex
      };
      console.log('Updated answers state:', newAnswers);
      return newAnswers;
    });
  };

  return { answers, handleAnswerSelect };
}
