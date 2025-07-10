
import { useState, useEffect } from 'react';
import { UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';

export function useExamTimer(
  exam: UIUXExam | null,
  attempt: UIUXExamAttempt | null,
  isOpen: boolean,
  onTimeExpired: () => void
) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize timer when exam starts
  useEffect(() => {
    if (isOpen && exam && attempt && !attempt.completed_at) {
      const startTime = new Date(attempt.started_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const totalTime = exam.time_limit_minutes * 60;
      const remaining = Math.max(0, totalTime - elapsed);
      
      setTimeLeft(remaining);
    }
  }, [isOpen, exam, attempt]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return { timeLeft, formatTime };
}
