
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { Assessment, AssessmentAttempt } from '@/hooks/useAssessments';

interface AssessmentResultsProps {
  assessment: Assessment;
  attempt: AssessmentAttempt;
  onReturnToTraining: () => void;
}

export function AssessmentResults({ assessment, attempt, onReturnToTraining }: AssessmentResultsProps) {
  const percentage = attempt.score || 0;
  const isPassed = attempt.is_passed;
  const correctAnswers = attempt.correct_answers || 0;
  const totalQuestions = attempt.total_questions || 0;

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl card-gradient">
        <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <img 
              src="/slt-hub-icon.png" 
              alt="SLT work HuB"
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center justify-center">
            {isPassed ? (
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mb-2 sm:mb-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="h-12 w-12 sm:h-16 sm:w-16 text-orange-500 mb-2 sm:mb-4" aria-hidden="true" />
            )}
          </div>
          
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent px-2">
            Assessment {isPassed ? 'Completed Successfully!' : 'Completed'}
          </CardTitle>
          
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" aria-label={`Your score: ${percentage} percent`}>
              {percentage}%
            </div>
            <Badge 
              variant={isPassed ? "default" : "destructive"} 
              className="text-xs sm:text-sm px-3 sm:px-4 py-1"
            >
              {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
          {/* Score cards - responsive grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-background/50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">Correct</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">{correctAnswers}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">Incorrect</div>
                  <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-500">{totalQuestions - correctAnswers}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary section */}
          <div className="bg-background/50 rounded-lg p-4 sm:p-6">
            <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Assessment Summary</h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Assessment:</span>
                <span className="font-medium text-right truncate max-w-[60%]">{assessment.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passing Score:</span>
                <span className="font-medium">{assessment.passing_score}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Score:</span>
                <span className={`font-medium ${isPassed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {new Date(attempt.submitted_at!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status message */}
          {!isPassed && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4" role="alert">
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1 sm:mb-2">
                  Don't worry! You can retake this assessment.
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Review the course content and try again when you're ready.
                </p>
              </div>
            </div>
          )}

          {isPassed && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4" role="alert">
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-green-800 dark:text-green-200 mb-1 sm:mb-2">
                  Congratulations! You passed this assessment.
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Your progress has been saved. Continue with other training modules.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={onReturnToTraining}
            className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-lg"
            size="lg"
          >
            Return to Training
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
