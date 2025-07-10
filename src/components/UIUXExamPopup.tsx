
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle } from 'lucide-react';
import { useUIUXExams, UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';

interface UIUXExamPopupProps {
  exam: UIUXExam | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export function UIUXExamPopup({ exam, isOpen, onClose }: UIUXExamPopupProps) {
  const { startExam, submitExam, isStarting, isSubmitting } = useUIUXExams();
  const [currentAttempt, setCurrentAttempt] = useState<UIUXExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  const questions: Question[] = exam?.questions as Question[] || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (!examStarted || examCompleted || timeLeft <= 0) return;

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
  }, [examStarted, examCompleted, timeLeft]);

  const handleStartExam = async () => {
    if (!exam) return;

    try {
      console.log('Starting exam:', exam.id);
      const attempt = await startExam({ examId: exam.id });
      setCurrentAttempt(attempt);
      setExamStarted(true);
      setTimeLeft(exam.time_limit_minutes * 60); // Convert to seconds
      setCurrentQuestionIndex(0);
      setAnswers({});
      console.log('Exam started successfully');
    } catch (error) {
      console.error('Error starting exam:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    console.log('Answer selected:', questionId, answerIndex);
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        score++;
      }
    });
    console.log('Calculated score:', score, 'out of', questions.length);
    return score;
  };

  const handleSubmitExam = async () => {
    if (!currentAttempt || !exam) return;

    try {
      console.log('Submitting exam...');
      const score = calculateScore();
      const timeTaken = Math.ceil((exam.time_limit_minutes * 60 - timeLeft) / 60);

      await submitExam({
        attemptId: currentAttempt.id,
        answers,
        score,
        totalQuestions: questions.length,
        timeTaken
      });

      setExamCompleted(true);
      console.log('Exam submitted successfully');
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  const handleClose = () => {
    setExamStarted(false);
    setExamCompleted(false);
    setCurrentAttempt(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!exam) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {exam.title}
            {examStarted && !examCompleted && (
              <div className="flex items-center gap-2 text-sm font-normal">
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {!examStarted ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">{exam.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Questions:</strong> {questions.length}
              </div>
              <div>
                <strong>Time Limit:</strong> {exam.time_limit_minutes} minutes
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleStartExam} 
                disabled={isStarting}
                className="bg-primary hover:bg-primary/90"
              >
                {isStarting ? 'Starting...' : 'Start Exam'}
              </Button>
            </div>
          </div>
        ) : examCompleted ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold">Exam Completed!</h3>
            <p className="text-muted-foreground">
              Your exam has been submitted successfully. You can view your results in the exam history.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>Time: {formatTime(timeLeft)}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            {currentQuestion && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {currentQuestion.question}
                  </h3>
                  
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ''}
                    onValueChange={(value) => 
                      handleAnswerSelect(currentQuestion.id, parseInt(value))
                    }
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="space-x-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitExam}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
