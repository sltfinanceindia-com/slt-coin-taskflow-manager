import { Repeat } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useRecurringTasks } from '@/hooks/useRecurringTasks';

interface RecurrenceIndicatorProps {
  taskId: string;
  compact?: boolean;
}

export function RecurrenceIndicator({ taskId, compact = false }: RecurrenceIndicatorProps) {
  const { recurrence, isLoading } = useRecurringTasks(taskId);

  if (isLoading || !recurrence) return null;

  const getFrequencyLabel = () => {
    switch (recurrence.frequency) {
      case 'daily':
        return recurrence.interval_value === 1 ? 'Daily' : `Every ${recurrence.interval_value} days`;
      case 'weekly':
        return recurrence.interval_value === 1 ? 'Weekly' : `Every ${recurrence.interval_value} weeks`;
      case 'monthly':
        return recurrence.interval_value === 1 ? 'Monthly' : `Every ${recurrence.interval_value} months`;
      default:
        return 'Recurring';
    }
  };

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{getFrequencyLabel()}</p>
          {recurrence.next_occurrence && (
            <p className="text-xs text-muted-foreground">
              Next: {new Date(recurrence.next_occurrence).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-xs">
      <Repeat className="h-3 w-3" />
      {getFrequencyLabel()}
    </Badge>
  );
}
