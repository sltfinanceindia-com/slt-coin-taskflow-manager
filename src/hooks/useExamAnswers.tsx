import { useState, useEffect } from 'react';
import { UIUXExamAttempt } from '@/hooks/useUIUXExams';

export function useExamAnswers(attempt: UIUXExamAttempt | null, isOpen: boolean) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  // Load existing answers if resuming
  useEffect(() => {
    if (isOpen) {
      if (attempt?.answers && Object.keys(attempt.answers).length > 0) {
        console.log('Loading existing answers:', attempt.answers);
        setAnswers(attempt.answers);
      } else {
        setAnswers({});
      }
    }
  }, [isOpen, attempt]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  return { answers, handleAnswerSelect };
}