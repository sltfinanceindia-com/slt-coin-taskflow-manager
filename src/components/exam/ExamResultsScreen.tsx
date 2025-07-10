
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UIUXExamAttempt } from '@/hooks/useUIUXExams';
import { Badge } from '@/components/ui/badge';
import { Award, Clock, CheckCircle } from 'lucide-react';

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
  const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
  const isPassed = attempt.is_passed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="exam-results">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Exam Results
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-center" id="exam-results">
          <div className="space-y-2">
            <div className="text-6xl font-bold text-primary">
              {percentage}%
            </div>
            <Badge variant={isPassed ? "default" : "destructive"} className="text-lg px-4 py-1">
              {isPassed ? "PASSED" : "FAILED"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Questions Correct</span>
              </div>
              <span className="font-semibold">{attempt.score} / {attempt.total_questions}</span>
            </div>

            {attempt.time_taken_minutes && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Time Taken</span>
                </div>
                <span className="font-semibold">{attempt.time_taken_minutes} minutes</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span>Completed On</span>
              <span className="font-semibold">
                {new Date(attempt.completed_at || '').toLocaleDateString()}
              </span>
            </div>
          </div>

          {!isPassed && (
            <p className="text-muted-foreground text-sm">
              You can retake the exam to improve your score.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
