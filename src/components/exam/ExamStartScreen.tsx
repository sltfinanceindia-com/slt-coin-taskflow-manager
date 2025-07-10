
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, FileText, Target } from 'lucide-react';
import { UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';

interface ExamStartScreenProps {
  exam: UIUXExam | null;
  attempt: UIUXExamAttempt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartExam: (examId: string) => void;
  isStarting: boolean;
}

export function ExamStartScreen({ 
  exam, 
  attempt,
  open,
  onOpenChange,
  onStartExam, 
  isStarting 
}: ExamStartScreenProps) {
  if (!exam) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="exam-start-description">
        <DialogHeader>
          <DialogTitle>{exam.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6" id="exam-start-description">
          {exam.description && (
            <p className="text-muted-foreground">{exam.description}</p>
          )}

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{exam.total_questions}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{exam.time_limit_minutes} mins</p>
                <p className="text-sm text-muted-foreground">Time Limit</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">{exam.passing_score}%</p>
                <p className="text-sm text-muted-foreground">Passing Score</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Instructions:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You have {exam.time_limit_minutes} minutes to complete all {exam.total_questions} questions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Each question has multiple choice options</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You can navigate between questions using the navigation panel</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Your answers are automatically saved as you progress</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You need to score at least {exam.passing_score}% to pass</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>The exam will auto-submit when time runs out</span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <Button
            onClick={() => onStartExam(exam.id)}
            disabled={isStarting}
            className="w-full"
            size="lg"
          >
            {isStarting ? 'Starting Exam...' : 'Start Exam'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
