import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';
import { useUIUXExams, UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';

interface UIUXExamPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: UIUXExam;
}

export function UIUXExamPopup({ open, onOpenChange, exam }: UIUXExamPopupProps) {
  const { startExam, submitExam, isStartingExam, isSubmittingExam } = useUIUXExams();
  const [examStarted, setExamStarted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<UIUXExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.time_limit_minutes * 60); // in seconds
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

  // Timer effect
  useEffect(() => {
    if (!examStarted || !open) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, open]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setExamStarted(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(exam.time_limit_minutes * 60);
      setCurrentAttempt(null);
      setExamStartTime(null);
    }
  }, [open, exam.time_limit_minutes]);

  const handleStartExam = async () => {
    try {
      const attempt = await new Promise<UIUXExamAttempt>((resolve, reject) => {
        startExam(exam.id, {
          onSuccess: (data: UIUXExamAttempt) => resolve(data),
          onError: (error: any) => reject(error),
        });
      });
      
      setCurrentAttempt(attempt);
      setExamStarted(true);
      setExamStartTime(new Date());
    } catch (error) {
      console.error('Failed to start exam:', error);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex.toString(),
    }));
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleSubmitExam();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!currentAttempt || !examStartTime) return;

    // Calculate score
    let score = 0;
    exam.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correct_answer) {
        score++;
      }
    });

    const timeTaken = Math.floor((new Date().getTime() - examStartTime.getTime()) / 1000);

    try {
      await new Promise<void>((resolve, reject) => {
        submitExam({
          attemptId: currentAttempt.id,
          answers,
          score,
          totalQuestions: exam.questions.length,
          timeTaken,
        }, {
          onSuccess: () => resolve(),
          onError: (error: any) => reject(error),
        });
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit exam:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!examStarted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {exam.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exam Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{exam.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time limit: {exam.time_limit_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Total questions: {exam.questions.length}</span>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Important:</strong> Once you start the exam, the timer will begin and you cannot pause it. 
                    Make sure you have a stable internet connection and won't be interrupted.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleStartExam} disabled={isStartingExam}>
                {isStartingExam ? 'Starting...' : 'Start Exam'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle>{exam.title}</DialogTitle>
            <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'}>
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestionIndex + 1}. {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentQuestionIndex] === index.toString()
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={answers[currentQuestionIndex] === index.toString()}
                    onChange={() => handleAnswerSelect(index)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestionIndex] === index.toString()
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {answers[currentQuestionIndex] === index.toString() && (
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestionIndex] || isSubmittingExam}
            >
              {isSubmittingExam ? 'Submitting...' : isLastQuestion ? 'Submit Exam' : 'Next Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}