import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UIUXExamAttempt } from '@/hooks/useUIUXExams';

interface ExamResultsScreenProps {
  attempt: UIUXExamAttempt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamResultsScreen({
  attempt,
  open,
  onOpenChange,
}: ExamResultsScreenProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="exam-results">
        <DialogHeader>
          <DialogTitle>Exam Completed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <div className="text-4xl font-bold text-primary">
            {attempt.score}/{attempt.total_questions}
          </div>
          <p id="exam-results" className="text-lg">
            You scored {Math.round((attempt.score / attempt.total_questions) * 100)}%
          </p>
          <p className="text-muted-foreground">
            Completed on {new Date(attempt.completed_at).toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}