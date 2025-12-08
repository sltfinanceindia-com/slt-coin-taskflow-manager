import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useShiftSchedules, useShiftTypes, ShiftSchedule } from '@/hooks/useShifts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShiftScheduler() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');

  const { schedules, isLoading, createSchedule, deleteSchedule, weekStart, weekEnd } = useShiftSchedules(currentWeek);
  const { shiftTypes } = useShiftTypes();
  const { profile } = useAuth();

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const days = [...Array(7)].map((_, i) => addDays(currentWeek, i));

  const getSchedulesForDay = (date: Date): ShiftSchedule[] => {
    return schedules.filter(
      s => format(new Date(s.schedule_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const handleCreateSchedule = async () => {
    if (!selectedDate || !selectedEmployee || !selectedShiftType) return;

    try {
      await createSchedule.mutateAsync({
        schedule_date: format(selectedDate, 'yyyy-MM-dd'),
        employee_id: selectedEmployee,
        shift_type_id: selectedShiftType,
      });
      setDialogOpen(false);
      setSelectedDate(undefined);
      setSelectedEmployee('');
      setSelectedShiftType('');
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteSchedule.mutateAsync(id);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule a Shift</DialogTitle>
                  <DialogDescription>
                    Assign an employee to a shift on a specific date
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label>Employee</Label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={emp.avatar_url || ''} />
                                <AvatarFallback>{emp.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {emp.full_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Shift Type</Label>
                    <Select value={selectedShiftType} onValueChange={setSelectedShiftType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        {shiftTypes
                          .filter((s) => s.is_active)
                          .map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: shift.color }}
                                />
                                {shift.name} ({shift.start_time} - {shift.end_time})
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSchedule}
                    disabled={!selectedDate || !selectedEmployee || !selectedShiftType || createSchedule.isPending}
                  >
                    {createSchedule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Schedule Shift
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {days.map((day) => {
                const daySchedules = getSchedulesForDay(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-[200px] rounded-lg border p-3',
                      isToday && 'bg-primary/5 border-primary'
                    )}
                  >
                    <div className="text-center mb-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        {format(day, 'EEE')}
                      </p>
                      <p
                        className={cn(
                          'text-2xl font-bold',
                          isToday && 'text-primary'
                        )}
                      >
                        {format(day, 'd')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="group relative p-2 rounded-md border bg-card text-xs"
                          style={{
                            borderLeftColor: schedule.shift_type?.color,
                            borderLeftWidth: '3px',
                          }}
                        >
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-destructive text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <div className="flex items-center gap-1 mb-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={schedule.employee?.avatar_url || ''} />
                              <AvatarFallback className="text-[10px]">
                                {schedule.employee?.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate">
                              {schedule.employee?.full_name?.split(' ')[0]}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                            style={{
                              backgroundColor: `${schedule.shift_type?.color}20`,
                              color: schedule.shift_type?.color,
                            }}
                          >
                            {schedule.shift_type?.name}
                          </Badge>
                        </div>
                      ))}

                      {daySchedules.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground py-4">
                          No shifts
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
