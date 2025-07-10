import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizTemplate, QuizQuestion, useQuizzes } from '@/hooks/useQuizzes';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuizTakerProps {
  quizTemplate: QuizTemplate;
  taskId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizTaker({ quizTemplate, taskId, open, onOpenChange }: QuizTakerProps) {
  const { startQuizAttempt, submitQuizAttempt, isStarting, isSubmitting } = useQuizzes();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quizTemplate.time_per_question_seconds);
  const [quizStarted, setQuizStarted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);

  const currentQuestion = quizTemplate.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizTemplate.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quizTemplate.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !open) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-advance to next question when time runs out
          handleNextQuestion();
          return quizTemplate.time_per_question_seconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, currentQuestionIndex, open]);

  // Reset when quiz opens
  useEffect(() => {
    if (open) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(quizTemplate.time_per_question_seconds);
      setQuizStarted(false);
      setAttemptId(null);
      setQuizStartTime(null);
    }
  }, [open, quizTemplate.time_per_question_seconds]);

  const startQuiz = async () => {
    try {
      const attempt = await new Promise<any>((resolve, reject) => {
        startQuizAttempt(
          { quizTemplateId: quizTemplate.id, taskId },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
      
      setAttemptId(attempt.id);
      setQuizStarted(true);
      setQuizStartTime(new Date());
    } catch (error) {
      toast({
        title: "Error Starting Quiz",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(quizTemplate.time_per_question_seconds);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId || !quizStartTime) return;

    // Calculate score
    let score = 0;
    quizTemplate.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score++;
      }
    });

    const timeTaken = Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000);

    try {
      await new Promise<void>((resolve, reject) => {
        submitQuizAttempt(
          {
            attemptId,
            answers,
            score,
            maxScore: quizTemplate.questions.length,
            timeTaken,
          },
          {
            onSuccess: () => resolve(),
            onError: reject,
          }
        );
      });

      toast({
        title: "Quiz Completed!",
        description: `You scored ${score}/${quizTemplate.questions.length} (${Math.round((score / quizTemplate.questions.length) * 100)}%)`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error Submitting Quiz",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!quizStarted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{quizTemplate.title}</DialogTitle>
            <DialogDescription>{quizTemplate.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Time per question: {quizTemplate.time_per_question_seconds} seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Total questions: {quizTemplate.total_questions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Choose the best answer for each question</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={startQuiz} disabled={isStarting}>
                {isStarting ? 'Starting...' : 'Start Quiz'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[700px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Question {currentQuestionIndex + 1} of {quizTemplate.questions.length}</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </DialogTitle>
          <Progress value={progress} className="h-2" />
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={answers[currentQuestion.id] === index ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="mr-3 font-mono">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleNextQuestion}
                disabled={answers[currentQuestion.id] === undefined}
              >
                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}