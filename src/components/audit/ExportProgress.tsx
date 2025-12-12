import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileDown, CheckCircle } from 'lucide-react';

interface ExportProgressProps {
  progress: number;
  currentStep: string;
}

export function ExportProgress({ progress, currentStep }: ExportProgressProps) {
  const isComplete = progress >= 100;

  return (
    <Card className={isComplete ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900' : ''}>
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isComplete ? 'bg-green-100 dark:bg-green-900' : 'bg-primary/10'}`}>
            {isComplete ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {isComplete ? 'Export Complete' : 'Generating Audit Pack...'}
              </p>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {currentStep && !isComplete && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileDown className="h-3 w-3" />
                {currentStep}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
