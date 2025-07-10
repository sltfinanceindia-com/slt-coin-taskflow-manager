import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UIUXExam } from '@/hooks/useUIUXExams';

interface ExamStartScreenProps {
  exam: UIUXExam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartExam: (examId: string) => void;
  isStarting: boolean;
}

export function ExamStartScreen({
  exam,
  open,
  onOpenChange,
  onStartExam,
  isStarting,
}: ExamStartScreenProps) {
  const questions = exam?.questions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="exam-description">
        <DialogHeader>
          <DialogTitle>{exam?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p id="exam-description" className="text-muted-foreground">{exam?.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Questions:</span> {questions.length}
            </div>
            <div>
              <span className="font-medium">Time Limit:</span> {exam?.time_limit_minutes} minutes
            </div>
          </div>
          <Button 
            onClick={() => exam && onStartExam(exam.id)} 
            className="w-full"
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Start Exam'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}