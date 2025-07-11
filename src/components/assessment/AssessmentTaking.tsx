
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Assessment, AssessmentQuestion, AssessmentAttempt } from '@/hooks/useAssessments';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AssessmentTakingProps {
  assessment: Assessment;
  questions: AssessmentQuestion[];
  attempt: AssessmentAttempt;
  onAnswerSelect: (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
}

export function AssessmentTaking({
  assessment,
  questions,
  attempt,
  onAnswerSelect,
  onSubmit,
  isSubmitting,
  selectedAnswers,
}: AssessmentTakingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(assessment.time_limit_minutes * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmit]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    onAnswerSelect(currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answeredQuestions < totalQuestions) {
      setShowSubmitDialog(true);
    } else {
      onSubmit();
    }
  };

  const options = [
    { key: 'A' as const, text: currentQuestion?.option_a },
    { key: 'B' as const, text: currentQuestion?.option_b },
    { key: 'C' as const, text: currentQuestion?.option_c },
    { key: 'D' as const, text: currentQuestion?.option_d },
  ];

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 card-gradient">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{assessment.title}</CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </Badge>
                  <Badge variant={answeredQuestions === totalQuestions ? "default" : "outline"}>
                    {answeredQuestions}/{totalQuestions} Answered
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-primary'}`} />
                <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Question */}
        <Card className="mb-6 card-gradient">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion?.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {options.map((option) => (
                <div
                  key={option.key}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover-scale ${
                    selectedAnswers[currentQuestion?.id] === option.key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleAnswerSelect(option.key)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      selectedAnswers[currentQuestion?.id] === option.key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    }`}>
                      {option.key}
                    </div>
                    <div className="flex-1 text-sm leading-relaxed">{option.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Grid */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-10 gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestionIndex === index ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      selectedAnswers[questions[index]?.id] ? 'border-green-500' : ''
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Submit Assessment?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredQuestions} out of {totalQuestions} questions.
              {answeredQuestions < totalQuestions && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Unanswered questions will be marked as incorrect.
                </span>
              )}
              Are you sure you want to submit your assessment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
