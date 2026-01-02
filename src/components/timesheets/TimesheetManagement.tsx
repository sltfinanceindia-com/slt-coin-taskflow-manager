import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, addDays, parseISO, differenceInHours } from 'date-fns';
import { 
  Clock, 
  Plus, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Timer,
  Play,
  Square,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TimesheetEntry {
  id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  overtime_hours: number;
  notes: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export function TimesheetManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  
  const [newEntry, setNewEntry] = useState({
    period_start: format(currentWeekStart, 'yyyy-MM-dd'),
    period_end: format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    total_hours: '40',
    overtime_hours: '0',
    notes: '',
  });

  // Fetch timesheet entries
  const { data: timesheetEntries, isLoading } = useQuery({
    queryKey: ['timesheet-entries', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('employee_id', profile?.id)
        .order('period_start', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(entry => ({
        id: entry.id,
        period_start: entry.period_start,
        period_end: entry.period_end,
        total_hours: Number(entry.total_hours) || 0,
        overtime_hours: Number(entry.overtime_hours) || 0,
        notes: entry.notes || '',
        status: entry.status as 'draft' | 'submitted' | 'approved' | 'rejected',
      })) as TimesheetEntry[];
    },
    enabled: !!profile?.id,
  });

  // Create timesheet entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: profile?.id,
          period_start: entry.period_start,
          period_end: entry.period_end,
          total_hours: parseFloat(entry.total_hours) || 0,
          overtime_hours: parseFloat(entry.overtime_hours) || 0,
          notes: entry.notes,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-entries'] });
      setIsCreateOpen(false);
      setNewEntry({
        period_start: format(currentWeekStart, 'yyyy-MM-dd'),
        period_end: format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        total_hours: '40',
        overtime_hours: '0',
        notes: '',
      });
      toast({ title: 'Timesheet entry created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating entry', description: error.message, variant: 'destructive' });
    },
  });

  // Submit timesheet for approval
  const submitTimesheetMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('timesheets')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-entries'] });
      toast({ title: 'Timesheet submitted for approval' });
    },
  });

  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true);
    setTimerStart(new Date());
  };

  const stopTimer = () => {
    if (timerStart) {
      const elapsed = Math.floor((new Date().getTime() - timerStart.getTime()) / 60000);
      setElapsedMinutes(prev => prev + elapsed);
    }
    setIsTimerRunning(false);
    setTimerStart(null);
  };

  // Navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Calculate totals
  const totalHours = timesheetEntries?.reduce((sum, e) => sum + e.total_hours, 0) || 0;
  const approvedCount = timesheetEntries?.filter(e => e.status === 'approved').length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentElapsed = () => {
    if (isTimerRunning && timerStart) {
      return elapsedMinutes + Math.floor((new Date().getTime() - timerStart.getTime()) / 60000);
    }
    return elapsedMinutes;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Timesheet Management</h1>
          <p className="text-muted-foreground">Track your work hours and submit timesheets</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Timesheet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Timesheet Entry</DialogTitle>
                <DialogDescription>Record your work hours for a pay period</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Period Start</Label>
                    <Input 
                      type="date" 
                      value={newEntry.period_start}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, period_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Period End</Label>
                    <Input 
                      type="date" 
                      value={newEntry.period_end}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, period_end: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Hours</Label>
                    <Input 
                      type="number" 
                      value={newEntry.total_hours}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, total_hours: e.target.value }))}
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <Label>Overtime Hours</Label>
                    <Input 
                      type="number" 
                      value={newEntry.overtime_hours}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, overtime_hours: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this period"
                    rows={3}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createEntryMutation.mutate(newEntry)}
                  disabled={createEntryMutation.isPending}
                >
                  {createEntryMutation.isPending ? 'Adding...' : 'Add Timesheet'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList>
          <TabsTrigger value="entries">Timesheet Entries</TabsTrigger>
          <TabsTrigger value="timer">Time Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">All time logged</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Entries</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timesheetEntries?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total timesheets</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Entries approved</p>
              </CardContent>
            </Card>
          </div>

          {/* Timesheet Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Entries</CardTitle>
              <CardDescription>Your logged work hours</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : timesheetEntries && timesheetEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Regular</TableHead>
                        <TableHead className="text-right">Overtime</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheetEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {format(parseISO(entry.period_start), 'MMM dd')} - {format(parseISO(entry.period_end), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">{entry.total_hours}h</TableCell>
                          <TableCell className="text-right text-orange-600">{entry.overtime_hours}h</TableCell>
                          <TableCell className="text-right font-bold">{entry.total_hours + entry.overtime_hours}h</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {entry.notes || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                          <TableCell>
                            {entry.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => submitTimesheetMutation.mutate(entry.id)}
                                disabled={submitTimesheetMutation.isPending}
                              >
                                Submit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No timesheet entries found</p>
                  <p className="text-sm">Click "Add Timesheet" to log your hours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Time Tracker
              </CardTitle>
              <CardDescription>
                Use the timer to track your work in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl font-mono font-bold mb-6">
                  {formatTime(getCurrentElapsed())}
                </div>
                <div className="flex justify-center gap-4">
                  {!isTimerRunning ? (
                    <Button size="lg" onClick={startTimer}>
                      <Play className="h-5 w-5 mr-2" />
                      Start Timer
                    </Button>
                  ) : (
                    <Button size="lg" variant="destructive" onClick={stopTimer}>
                      <Square className="h-5 w-5 mr-2" />
                      Stop Timer
                    </Button>
                  )}
                </div>
                {elapsedMinutes > 0 && !isTimerRunning && (
                  <div className="mt-6">
                    <p className="text-muted-foreground mb-4">
                      You've tracked {formatTime(elapsedMinutes)}. Add this to your timesheet when you're ready.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const hours = Math.round(elapsedMinutes / 60 * 10) / 10;
                        setNewEntry(prev => ({
                          ...prev,
                          total_hours: String(hours),
                        }));
                        setIsCreateOpen(true);
                        setElapsedMinutes(0);
                      }}
                    >
                      Save as Timesheet Entry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
