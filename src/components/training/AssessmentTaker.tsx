import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2 } from 'lucide-react';
import { TrainingAssessment, AssessmentAttempt } from '@/hooks/useTrainingAssessments';

interface AssessmentTakerProps {
  assessment: TrainingAssessment;
  attempt: AssessmentAttempt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (answers: any, score: number) => Promise<void>;
}

export function AssessmentTaker({ 
  assessment, 
  attempt, 
  open, 
  onOpenChange,
  onSubmit 
}: AssessmentTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = assessment.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize timer
  useEffect(() => {
    if (open && assessment.time_limit_minutes && attempt) {
      const totalTimeInSeconds = assessment.time_limit_minutes * 60;
      const startTime = new Date(attempt.started_at || Date.now()).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalTimeInSeconds - elapsed);
      
      setTimeLeft(remaining);
    }
  }, [open, assessment, attempt]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsSubmitting(false);
    }
  }, [open]);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!attempt || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const correctAnswer = question.correct_answer;
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      });

      const score = correctAnswers;
      await onSubmit(answers, score);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (!attempt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{assessment.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">{assessment.description}</p>
            {assessment.instructions && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <p className="text-sm">{assessment.instructions}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Questions:</span> {questions.length}
              </div>
              <div>
                <span className="font-medium">Time Limit:</span>{' '}
                {assessment.time_limit_minutes ? `${assessment.time_limit_minutes} minutes` : 'No limit'}
              </div>
              <div>
                <span className="font-medium">Passing Score:</span> {assessment.passing_score || 70}%
              </div>
              <div>
                <span className="font-medium">Max Attempts:</span> {assessment.max_attempts || 'Unlimited'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{assessment.title}</span>
            {timeLeft !== null && (
              <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{answeredQuestions}/{questions.length} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          {currentQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options?.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      answers[currentQuestionIndex] === index
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        answers[currentQuestionIndex] === index
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {answers[currentQuestionIndex] === index && (
                          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting || answeredQuestions < questions.length}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={answers[currentQuestionIndex] === undefined}
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Warning for unanswered questions */}
          {answeredQuestions < questions.length && currentQuestionIndex === questions.length - 1 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You have {questions.length - answeredQuestions} unanswered question(s). 
                Please answer all questions before submitting.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}