import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2 } from 'lucide-react';
import { UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';

interface ExamTakingScreenProps {
  exam: UIUXExam;
  attempt: UIUXExamAttempt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitExam: (data: { attemptId: string; answers: any; score: number; totalQuestions: number }) => void;
  isSubmitting: boolean;
  answers: { [key: number]: number };
  onAnswerSelect: (questionIndex: number, optionIndex: number) => void;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
}

export function ExamTakingScreen({
  exam,
  attempt,
  open,
  onOpenChange,
  onSubmitExam,
  isSubmitting,
  answers,
  onAnswerSelect,
  timeLeft,
  formatTime,
}: ExamTakingScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitExam();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    // Calculate score
    let correctAnswers = 0;
    console.log('Starting score calculation...');
    console.log('Total questions:', questions.length);
    console.log('User answers:', answers);
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correct_answer;
      
      console.log(`Question ${index + 1}:`, {
        question: question.question,
        userSelected: userAnswer,
        userSelectedText: question.options?.[userAnswer],
        correctAnswer: correctAnswer,
        correctAnswerText: question.options?.[correctAnswer],
        isCorrect: userAnswer === correctAnswer
      });
      
      if (userAnswer !== undefined && userAnswer === correctAnswer) {
        correctAnswers++;
        console.log(`✓ Question ${index + 1} correct!`);
      } else {
        console.log(`✗ Question ${index + 1} incorrect`);
      }
    });

    console.log(`Final calculated score: ${correctAnswers}/${questions.length}`);

    onSubmitExam({
      attemptId: attempt.id,
      answers,
      score: correctAnswers,
      totalQuestions: questions.length,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby="exam-progress">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{exam.title}</span>
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
            <div id="exam-progress" className="flex justify-between text-sm">
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
                    onClick={() => onAnswerSelect(currentQuestionIndex, index)}
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
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting || answeredQuestions < questions.length}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
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