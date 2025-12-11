import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWFH } from '@/hooks/useWFH';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Home, Info } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const WFHRequestForm: React.FC = () => {
  const { policy, monthlyCount, createRequest } = useWFH();
  const [date, setDate] = useState<Date>();
  const [reason, setReason] = useState('');

  const minDate = policy?.advance_notice_days 
    ? addDays(new Date(), policy.advance_notice_days)
    : new Date();

  const remainingDays = policy ? policy.max_wfh_days_per_month - monthlyCount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    await createRequest.mutateAsync({
      request_date: format(date, 'yyyy-MM-dd'),
      reason: reason || undefined,
    });

    setDate(undefined);
    setReason('');
  };

  const isBlackoutDay = (date: Date): boolean => {
    if (!policy?.blackout_days?.length) return false;
    const dayName = format(date, 'EEEE');
    return policy.blackout_days.includes(dayName);
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {/* Request Form */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            Request WFH Day
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Submit a work from home request</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal min-h-[44px]",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => 
                      date < minDate || 
                      date.getDay() === 0 || 
                      date.getDay() === 6 ||
                      isBlackoutDay(date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for WFH..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="min-h-[80px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full min-h-[44px]"
              disabled={!date || remainingDays <= 0 || createRequest.isPending}
            >
              <Home className="mr-2 h-4 w-4" />
              {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Policy Info */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            WFH Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg bg-muted">
              <p className="text-xs sm:text-sm text-muted-foreground">Monthly Limit</p>
              <p className="text-xl sm:text-2xl font-bold">{policy?.max_wfh_days_per_month || 8} <span className="text-sm font-normal">days</span></p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-muted">
              <p className="text-xs sm:text-sm text-muted-foreground">Used This Month</p>
              <p className="text-xl sm:text-2xl font-bold">{monthlyCount} <span className="text-sm font-normal">days</span></p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-lg border">
            <p className="text-xs sm:text-sm font-medium">Remaining Days</p>
            <p className={cn(
              "text-2xl sm:text-3xl font-bold",
              remainingDays <= 2 ? "text-amber-600" : "text-green-600"
            )}>
              {remainingDays}
            </p>
          </div>

          {policy?.require_approval && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                WFH requests require manager approval
              </AlertDescription>
            </Alert>
          )}

          {policy?.advance_notice_days && policy.advance_notice_days > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                Requests require {policy.advance_notice_days} day(s) advance notice
              </AlertDescription>
            </Alert>
          )}

          {policy?.blackout_days && policy.blackout_days.length > 0 && (
            <div className="text-xs sm:text-sm">
              <p className="font-medium text-muted-foreground">Blackout Days:</p>
              <p>{policy.blackout_days.join(', ')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
