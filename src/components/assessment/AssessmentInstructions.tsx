
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
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl card-gradient">
        <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <img 
              src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
              alt="SLT Finance India"
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent px-2">
            {assessment.title}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg">
            {assessment.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
          {/* Assessment details - responsive grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col items-center p-2 sm:p-4 bg-background/50 rounded-lg text-center">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-1 sm:mb-2" aria-hidden="true" />
              <div className="text-xs sm:text-sm font-medium">Duration</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{assessment.time_limit_minutes} min</div>
            </div>
            
            <div className="flex flex-col items-center p-2 sm:p-4 bg-background/50 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-1 sm:mb-2" aria-hidden="true" />
              <div className="text-xs sm:text-sm font-medium">Questions</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{assessment.total_questions}</div>
            </div>
            
            <div className="flex flex-col items-center p-2 sm:p-4 bg-background/50 rounded-lg text-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-1 sm:mb-2" aria-hidden="true" />
              <div className="text-xs sm:text-sm font-medium">Pass</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{assessment.passing_score}%</div>
            </div>
          </div>

          {/* Instructions */}
          {assessment.instructions && (
            <div className="bg-background/50 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Instructions</h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground whitespace-pre-line">
                {assessment.instructions}
              </div>
            </div>
          )}

          {/* Important notes */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important Notes:</p>
                <ul className="text-amber-700 dark:text-amber-300 space-y-0.5 sm:space-y-1 list-disc list-inside">
                  <li>Timer cannot be paused once started</li>
                  <li>Answers are auto-saved</li>
                  <li>Navigate between questions freely</li>
                  <li>Submit before time runs out</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agreement checkbox with better touch target */}
          <label 
            htmlFor="agree" 
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors min-h-[44px]"
          >
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-5 w-5 rounded border-border cursor-pointer"
            />
            <span className="text-xs sm:text-sm select-none">
              I have read and understood the instructions
            </span>
          </label>

          <Button
            onClick={onStart}
            disabled={!agreed || isStarting}
            className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-lg"
            size="lg"
          >
            {isStarting ? "Starting..." : "Start Assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
