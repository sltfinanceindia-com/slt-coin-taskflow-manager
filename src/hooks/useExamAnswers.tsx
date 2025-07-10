
import { useState, useEffect } from 'react';
import { UIUXExamAttempt } from '@/hooks/useUIUXExams';
import { supabase } from '@/integrations/supabase/client';

export function useExamAnswers(attempt: UIUXExamAttempt | null, isOpen: boolean) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing answers from user_answers table if resuming
  useEffect(() => {
    const loadExistingAnswers = async () => {
      if (isOpen && attempt?.id && !attempt.completed_at) {
        console.log('Loading existing answers for attempt:', attempt.id);
        setIsLoading(true);
        
        try {
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
                const questionIndex = answer.exam_questions.question_number - 1;
                const selectedOption = answer.question_options.option_number - 1;
                answersMap[questionIndex] = selectedOption;
              }
            });
            console.log('Loaded existing answers:', answersMap);
            setAnswers(answersMap);
          } else {
            console.log('No existing answers found, starting fresh');
            setAnswers({});
          }
        } catch (error) {
          console.error('Failed to load existing answers:', error);
          setAnswers({});
        } finally {
          setIsLoading(false);
        }
      } else {
        setAnswers({});
      }
    };

    loadExistingAnswers();
  }, [isOpen, attempt]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    console.log(`Answer selected - Question ${questionIndex + 1}: Option ${String.fromCharCode(65 + optionIndex)} (index: ${optionIndex})`);
    
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionIndex]: optionIndex
      };
      console.log('Updated answers state:', newAnswers);
      console.log('Total answered questions:', Object.keys(newAnswers).length);
      return newAnswers;
    });
  };

  const clearAnswers = () => {
    console.log('Clearing all answers');
    setAnswers({});
  };

  return { 
    answers, 
    handleAnswerSelect, 
    clearAnswers,
    isLoading,
    totalAnswered: Object.keys(answers).length 
  };
}
