import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useShiftSchedules, useShiftTypes, useShiftSwapRequests } from '@/hooks/useShifts';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Users, CalendarDays, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ShiftOverview() {
  const { schedules, isLoading: schedulesLoading } = useShiftSchedules();
  const { shiftTypes, isLoading: typesLoading } = useShiftTypes();
  const { swapRequests, isLoading: swapsLoading } = useShiftSwapRequests();

  const todaySchedules = schedules.filter(s => isToday(new Date(s.schedule_date)));
  const tomorrowSchedules = schedules.filter(s => isTomorrow(new Date(s.schedule_date)));
  const pendingSwaps = swapRequests.filter(s => s.status === 'pending');

  if (schedulesLoading || typesLoading || swapsLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySchedules.length}</div>
            <p className="text-xs text-muted-foreground">employees scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tomorrowSchedules.length}</div>
            <p className="text-xs text-muted-foreground">shifts scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shift Types</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shiftTypes.length}</div>
            <p className="text-xs text-muted-foreground">active types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Swaps</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSwaps.length}</div>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          {todaySchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No shifts scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={schedule.employee?.avatar_url || ''} />
                      <AvatarFallback>
                        {schedule.employee?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{schedule.employee?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.employee?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      style={{ backgroundColor: schedule.shift_type?.color }}
                      className="text-white"
                    >
                      {schedule.shift_type?.name}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {schedule.shift_type?.start_time} - {schedule.shift_type?.end_time}
                    </div>
                    <Badge variant={schedule.status === 'scheduled' ? 'outline' : 'default'}>
                      {schedule.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Week Preview */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Coverage</CardTitle>
          <CardDescription>Shift distribution for the current week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => {
              const date = addDays(new Date(), i);
              const daySchedules = schedules.filter(
                s => format(new Date(s.schedule_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              );
              
              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-center ${
                    isToday(date) ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {format(date, 'EEE')}
                  </p>
                  <p className="text-lg font-bold">{format(date, 'd')}</p>
                  <p className="text-xs text-muted-foreground">
                    {daySchedules.length} shifts
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Swap Requests Alert */}
      {pendingSwaps.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              Pending Swap Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingSwaps.slice(0, 3).map((swap) => (
                <div key={swap.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">
                      {swap.requester?.full_name} → {swap.target_employee?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {swap.requester_reason || 'No reason provided'}
                    </p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
