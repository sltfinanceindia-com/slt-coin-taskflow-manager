import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send } from 'lucide-react';
import { format, differenceInBusinessDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

export const LeaveRequestForm: React.FC = () => {
  const { leaveTypes, myBalances, createRequest } = useLeaveManagement();
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState<'first_half' | 'second_half'>('first_half');

  const selectedBalance = myBalances.find(b => b.leave_type_id === leaveTypeId);
  const available = selectedBalance 
    ? Number(selectedBalance.total_days) - Number(selectedBalance.used_days) - Number(selectedBalance.pending_days)
    : 0;

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    if (isHalfDay) return 0.5;
    return differenceInBusinessDays(endDate, startDate) + 1;
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate) return;

    await createRequest.mutateAsync({
      leave_type_id: leaveTypeId,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      total_days: totalDays,
      reason: reason || undefined,
      is_half_day: isHalfDay,
      half_day_type: isHalfDay ? halfDayType : undefined,
    });

    // Reset form
    setLeaveTypeId('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setIsHalfDay(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Leave</CardTitle>
        <CardDescription>Submit a new leave request for approval</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type</Label>
              <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBalance && (
                <p className="text-sm text-muted-foreground">
                  Available: {available.toFixed(1)} days
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox 
                id="half-day" 
                checked={isHalfDay} 
                onCheckedChange={(checked) => setIsHalfDay(checked as boolean)}
              />
              <Label htmlFor="half-day">Half Day</Label>
              {isHalfDay && (
                <Select value={halfDayType} onValueChange={(v) => setHalfDayType(v as 'first_half' | 'second_half')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_half">First Half</SelectItem>
                    <SelectItem value="second_half">Second Half</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (isHalfDay && date) {
                        setEndDate(date);
                      } else if (date && (!endDate || date > endDate)) {
                        setEndDate(date);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={isHalfDay}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {totalDays > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">
                Total Leave: <span className="text-primary">{totalDays} day(s)</span>
              </p>
              {totalDays > available && (
                <p className="text-sm text-destructive mt-1">
                  ⚠️ Requested days exceed available balance
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={!leaveTypeId || !startDate || !endDate || totalDays > available || createRequest.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
