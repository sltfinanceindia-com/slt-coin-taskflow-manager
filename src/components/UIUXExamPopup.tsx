
import { UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';
import { useExamTimer } from '@/hooks/useExamTimer';
import { useExamAnswers } from '@/hooks/useExamAnswers';
import { ExamStartScreen } from '@/components/exam/ExamStartScreen';
import { ExamResultsScreen } from '@/components/exam/ExamResultsScreen';
import { ExamTakingScreen } from '@/components/exam/ExamTakingScreen';

interface UIUXExamPopupProps {
  exam: UIUXExam | null;
  attempt: UIUXExamAttempt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartExam: (examId: string) => void;
  onSubmitExam: (data: { attemptId: string; answers: { [key: number]: number } }) => void;
  isStarting: boolean;
  isSubmitting: boolean;
}

export function UIUXExamPopup({
  exam,
  attempt,
  open,
  onOpenChange,
  onStartExam,
  onSubmitExam,
  isStarting,
  isSubmitting,
}: UIUXExamPopupProps) {
  const { answers, handleAnswerSelect } = useExamAnswers(attempt, open);
  
  const handleTimeExpired = () => {
    if (attempt && exam) {
      // Auto-submit when time expires
      console.log('Time expired, auto-submitting exam');
      onSubmitExam({
        attemptId: attempt.id,
        answers
      });
    }
  };

  const { timeLeft, formatTime } = useExamTimer(exam, attempt, open, handleTimeExpired);

  // If no attempt, show exam start screen
  if (!attempt) {
    return (
      <ExamStartScreen
        exam={exam}
        attempt={attempt}
        open={open}
        onOpenChange={onOpenChange}
        onStartExam={onStartExam}
        isStarting={isStarting}
      />
    );
  }

  // If exam is completed, show results
  if (attempt.completed_at) {
    return (
      <ExamResultsScreen
        attempt={attempt}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  // Show exam taking interface
  if (exam) {
    return (
      <ExamTakingScreen
        exam={exam}
        attempt={attempt}
        open={open}
        onOpenChange={onOpenChange}
        onSubmitExam={onSubmitExam}
        isSubmitting={isSubmitting}
        answers={answers}
        onAnswerSelect={handleAnswerSelect}
        timeLeft={timeLeft}
        formatTime={formatTime}
      />
    );
  }

  return null;
}
