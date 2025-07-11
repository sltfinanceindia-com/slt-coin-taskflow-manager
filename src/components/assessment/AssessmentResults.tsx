
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
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl card-gradient">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
              alt="SLT Finance India"
              className="h-16 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center justify-center">
            {isPassed ? (
              <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
            ) : (
              <RotateCcw className="h-16 w-16 text-orange-500 mb-4" />
            )}
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Assessment {isPassed ? 'Completed Successfully!' : 'Completed'}
          </CardTitle>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {percentage}%
            </div>
            <Badge variant={isPassed ? "default" : "destructive"} className="text-sm px-4 py-1">
              {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <div className="font-medium">Correct Answers</div>
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <div className="font-medium">Incorrect Answers</div>
                  <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-lg">Assessment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assessment:</span>
                <span className="font-medium">{assessment.title}</span>
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
                <span className={`font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
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

          {!isPassed && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Don't worry! You can retake this assessment after reviewing the training materials.
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Review the course content and try again when you're ready.
                </p>
              </div>
            </div>
          )}

          {isPassed && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200 mb-2">
                  Congratulations! You have successfully completed this assessment.
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Your progress has been saved and you can now continue with other training modules.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={onReturnToTraining}
            className="w-full min-h-[48px] text-lg"
            size="lg"
          >
            Return to Training
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
