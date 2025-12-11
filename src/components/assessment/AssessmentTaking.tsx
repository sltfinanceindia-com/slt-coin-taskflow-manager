
import { useState, useEffect, useCallback } from 'react';
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
  const [isTimerActive, setIsTimerActive] = useState(true);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Memoized submit handler to prevent dependency issues
  const handleAutoSubmit = useCallback(() => {
    console.log('Auto-submitting assessment due to time limit');
    setIsTimerActive(false);
    onSubmit();
  }, [onSubmit]);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive) return;
    
    console.log('Timer started, initial time:', timeRemaining);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        console.log('Timer tick, time remaining:', newTime);
        
        if (newTime <= 0) {
          console.log('Time expired, auto-submitting');
          setIsTimerActive(false);
          handleAutoSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('Cleaning up timer');
      clearInterval(timer);
    };
  }, [isTimerActive, handleAutoSubmit]);

  // Stop timer when submitting
  useEffect(() => {
    if (isSubmitting) {
      setIsTimerActive(false);
    }
  }, [isSubmitting]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    console.log('Answer selected:', answer, 'for question:', currentQuestion.id);
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
      setIsTimerActive(false);
      onSubmit();
    }
  };

  const handleConfirmSubmit = () => {
    setIsTimerActive(false);
    setShowSubmitDialog(false);
    onSubmit();
  };

  const options = [
    { key: 'A' as const, text: currentQuestion?.option_a },
    { key: 'B' as const, text: currentQuestion?.option_b },
    { key: 'C' as const, text: currentQuestion?.option_c },
    { key: 'D' as const, text: currentQuestion?.option_d },
  ];

  // Show warning when time is running low
  const isTimeRunningLow = timeRemaining <= 300; // 5 minutes

  return (
    <div className="min-h-screen bg-gradient-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-4 sm:mb-6 card-gradient">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-xl truncate">{assessment.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Q {currentQuestionIndex + 1}/{totalQuestions}
                  </Badge>
                  <Badge variant={answeredQuestions === totalQuestions ? "default" : "outline"} className="text-xs sm:text-sm">
                    {answeredQuestions}/{totalQuestions} Done
                  </Badge>
                </div>
              </div>
              {/* Timer with accessibility */}
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50"
                role="timer"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
              >
                <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${isTimeRunningLow ? 'text-red-500' : 'text-primary'}`} />
                <span className={`font-mono text-base sm:text-lg font-bold ${isTimeRunningLow ? 'text-red-500 animate-pulse' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="mt-3 sm:mt-4" aria-label={`Progress: ${Math.round(progress)}% complete`} />
            {isTimeRunningLow && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert">
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
                  ⚠️ Time is running low! Your assessment will auto-submit when time expires.
                </p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Question */}
        <Card className="mb-4 sm:mb-6 card-gradient">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg leading-relaxed font-medium">
              {currentQuestion?.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`w-full p-3 sm:p-4 rounded-lg border cursor-pointer transition-all text-left min-h-[44px] ${
                    selectedAnswers[currentQuestion?.id] === option.key
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                  onClick={() => handleAnswerSelect(option.key)}
                  aria-pressed={selectedAnswers[currentQuestion?.id] === option.key}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                      selectedAnswers[currentQuestion?.id] === option.key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    }`}>
                      {option.key}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed pt-0.5">{option.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="card-gradient">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                size="sm"
                className="min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm px-3 sm:px-4"
                  >
                    {isSubmitting ? "..." : "Submit"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    size="sm"
                    className="min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Grid - Responsive */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              <p className="text-xs text-muted-foreground mb-2 sm:mb-3">Jump to question:</p>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestionIndex === index ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm ${
                      selectedAnswers[questions[index]?.id] 
                        ? 'border-green-500 bg-green-500/10' 
                        : ''
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                    aria-label={`Go to question ${index + 1}${selectedAnswers[questions[index]?.id] ? ', answered' : ', unanswered'}`}
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
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
