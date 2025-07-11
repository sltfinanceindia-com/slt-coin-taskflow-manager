
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Assessment } from '@/hooks/useAssessments';

interface AssessmentInstructionsProps {
  assessment: Assessment;
  onStart: () => void;
  isStarting: boolean;
}

export function AssessmentInstructions({ assessment, onStart, isStarting }: AssessmentInstructionsProps) {
  const [agreed, setAgreed] = useState(false);

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
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {assessment.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {assessment.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-background/50 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">{assessment.time_limit_minutes} minutes</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-background/50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Questions</div>
                <div className="text-sm text-muted-foreground">{assessment.total_questions} questions</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-background/50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Passing Score</div>
                <div className="text-sm text-muted-foreground">{assessment.passing_score}%</div>
              </div>
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-lg">Instructions</h3>
            <div className="space-y-2 text-sm text-muted-foreground whitespace-pre-line">
              {assessment.instructions}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important Notes:</p>
                <ul className="text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>Once started, the timer cannot be paused</li>
                  <li>Your answers are automatically saved</li>
                  <li>You can navigate between questions freely</li>
                  <li>Submit your assessment before time runs out</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="agree" className="text-sm">
              I have read and understood the instructions
            </label>
          </div>

          <Button
            onClick={onStart}
            disabled={!agreed || isStarting}
            className="w-full min-h-[48px] text-lg"
            size="lg"
          >
            {isStarting ? "Starting Assessment..." : "Start Assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
