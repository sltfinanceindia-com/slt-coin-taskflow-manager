import { cn } from '@/lib/utils';
import { Check, Circle, Loader2 } from 'lucide-react';

export type PayrollStep = 'select' | 'calculate' | 'review' | 'finalize' | 'pay';

interface PayrollStepsIndicatorProps {
  currentStep: PayrollStep;
  completedSteps: PayrollStep[];
}

const STEPS: { id: PayrollStep; label: string }[] = [
  { id: 'select', label: 'Select Period' },
  { id: 'calculate', label: 'Calculate' },
  { id: 'review', label: 'Review' },
  { id: 'finalize', label: 'Finalize' },
  { id: 'pay', label: 'Pay' },
];

export function PayrollStepsIndicator({ currentStep, completedSteps }: PayrollStepsIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = index > currentIndex && !isCompleted;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && !isCompleted && "bg-primary border-primary text-primary-foreground animate-pulse",
                    isUpcoming && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs sm:text-sm font-medium text-center max-w-[60px] sm:max-w-none",
                    isCurrent && "text-primary",
                    isCompleted && "text-green-600",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all",
                    index < currentIndex || isCompleted
                      ? "bg-green-500"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
