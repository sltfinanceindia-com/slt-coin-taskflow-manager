import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Repeat, X } from 'lucide-react';

interface RecurrenceSelectorProps {
  value?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval_value: number;
    days_of_week?: number[];
    day_of_month?: number;
    end_date?: string;
    occurrences_count?: number;
  } | null;
  onChange: (value: RecurrenceSelectorProps['value']) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const [showRecurrence, setShowRecurrence] = useState(!!value);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>(value?.frequency || 'daily');
  const [intervalValue, setIntervalValue] = useState(value?.interval_value || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.days_of_week || [1, 2, 3, 4, 5]);
  const [dayOfMonth, setDayOfMonth] = useState(value?.day_of_month || 1);
  const [endDate, setEndDate] = useState(value?.end_date || '');
  const [occurrencesCount, setOccurrencesCount] = useState(value?.occurrences_count || 0);

  const handleToggleRecurrence = () => {
    if (showRecurrence) {
      setShowRecurrence(false);
      onChange(null);
    } else {
      setShowRecurrence(true);
      onChange({
        frequency,
        interval_value: intervalValue,
        days_of_week: frequency === 'weekly' ? daysOfWeek : undefined,
        day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
        end_date: endDate || undefined,
        occurrences_count: occurrencesCount || undefined,
      });
    }
  };

  const updateRecurrence = () => {
    if (!showRecurrence) return;
    
    onChange({
      frequency,
      interval_value: intervalValue,
      days_of_week: frequency === 'weekly' ? daysOfWeek : undefined,
      day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
      end_date: endDate || undefined,
      occurrences_count: occurrencesCount || undefined,
    });
  };

  const handleFrequencyChange = (newFrequency: typeof frequency) => {
    setFrequency(newFrequency);
    setTimeout(updateRecurrence, 0);
  };

  const handleDayToggle = (day: number) => {
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter(d => d !== day)
      : [...daysOfWeek, day].sort((a, b) => a - b);
    setDaysOfWeek(newDays);
    setTimeout(updateRecurrence, 0);
  };

  const getFrequencyLabel = () => {
    switch (frequency) {
      case 'daily':
        return intervalValue === 1 ? 'Every day' : `Every ${intervalValue} days`;
      case 'weekly':
        return intervalValue === 1 ? 'Every week' : `Every ${intervalValue} weeks`;
      case 'monthly':
        return intervalValue === 1 ? 'Every month' : `Every ${intervalValue} months`;
      case 'custom':
        return 'Custom';
      default:
        return 'Repeats';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          Recurring Task
        </Label>
        <Button
          type="button"
          variant={showRecurrence ? 'secondary' : 'outline'}
          size="sm"
          onClick={handleToggleRecurrence}
        >
          {showRecurrence ? (
            <>
              <X className="h-3.5 w-3.5 mr-1" />
              Remove
            </>
          ) : (
            <>
              <Repeat className="h-3.5 w-3.5 mr-1" />
              Add Recurrence
            </>
          )}
        </Button>
      </div>

      {showRecurrence && (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Frequency</Label>
              <Select value={frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Every</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={intervalValue}
                onChange={(e) => {
                  setIntervalValue(parseInt(e.target.value) || 1);
                  setTimeout(updateRecurrence, 0);
                }}
                className="h-8"
              />
            </div>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-1.5">
              <Label className="text-xs">On days</Label>
              <div className="flex gap-1 flex-wrap">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={daysOfWeek.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-10 text-xs"
                    onClick={() => handleDayToggle(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Day of month</Label>
              <Select 
                value={dayOfMonth.toString()} 
                onValueChange={(v) => {
                  setDayOfMonth(parseInt(v));
                  setTimeout(updateRecurrence, 0);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">End date (optional)</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setTimeout(updateRecurrence, 0);
              }}
              className="h-8"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {getFrequencyLabel()}
            {endDate && ` until ${new Date(endDate).toLocaleDateString()}`}
          </p>
        </div>
      )}
    </div>
  );
}
