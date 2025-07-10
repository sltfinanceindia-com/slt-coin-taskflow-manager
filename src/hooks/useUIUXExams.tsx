
import { useState, useEffect } from 'react';
import { useExamData } from './useExamData';
import { useExamQuestions } from './useExamQuestions';
import { useExamAttempts } from './useExamAttempts';
import { useExamSubmission } from './useExamSubmission';

export const useUIUXExams = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const { 
    exams, 
    attempts, 
    isLoading, 
    fetchUserAttempts 
  } = useExamData();

  const { 
    questions, 
    examWithQuestions, 
    loading,
    fetchExamQuestions 
  } = useExamQuestions();

  const { 
    currentAttempt, 
    isStarting, 
    startExam: startExamAttempt,
    setCurrentAttempt 
  } = useExamAttempts();

  const { submitExam: submitExamData, isSubmitting } = useExamSubmission(questions);

  const submitAnswer = (questionId: string, optionNumber: number) => {
    console.log('Submitting answer:', { questionId, optionNumber });
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionNumber
    }));
  };

  const startExam = async (examId: string) => {
    const attempt = await startExamAttempt(examId);
    if (attempt) {
      await fetchUserAttempts();
    }
  };

  const submitExam = async (data: { attemptId: string; answers: { [key: number]: number } }) => {
    const result = await submitExamData(data);
    if (result) {
      setCurrentAttempt(prev => prev ? {
        ...prev,
        ...result
      } : null);
      await fetchUserAttempts();
    }
  };

  // Timer effect
  useEffect(() => {
    if (currentAttempt && !currentAttempt.completed_at && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitExam({ 
              attemptId: currentAttempt.id, 
              answers: Object.keys(answers).reduce((acc, key) => {
                acc[parseInt(key)] = answers[key];
                return acc;
              }, {} as { [key: number]: number })
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAttempt, timeRemaining]);

  // Initialize timer when exam questions are loaded
  useEffect(() => {
    if (examWithQuestions) {
      setTimeRemaining(examWithQuestions.time_limit_minutes * 60);
    }
  }, [examWithQuestions]);

  return {
    exams,
    attempts,
    questions,
    examWithQuestions,
    currentAttempt,
    answers,
    loading,
    isLoading,
    isStarting,
    isSubmitting,
    timeRemaining,
    startExam,
    submitAnswer,
    submitExam,
    fetchExamQuestions,
  };
};

// Re-export types for backward compatibility
export type { UIUXExam, UIUXExamAttempt } from '@/types/exam';
