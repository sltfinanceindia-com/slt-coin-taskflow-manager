import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, addDays, parseISO, isWithinInterval, startOfMonth, subMonths } from 'date-fns';
import { TimesheetSummaryCards } from './TimesheetSummaryCards';
import { EnhancedTimesheetEntry } from './EnhancedTimesheetEntry';
import { WeeklyCalendarGrid } from './WeeklyCalendarGrid';
import { exportToCSV } from '@/lib/export';
import { 
  Clock, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Timer,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Filter,
  CalendarIcon,
  X
} from 'lucide-react';

interface TimesheetEntry {
  id: string;
  timesheet_id: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  description: string;
  project_id: string | null;
  task_id: string | null;
  is_billable: boolean;
  billing_rate: number | null;
  hours_type: string;
  client_name: string | null;
  cost_center: string | null;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string; task_number: string | null } | null;
}

interface Timesheet {
  id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_hours: number;
  overtime_hours: number;
  notes: string;
  submitted_at: string | null;
  approved_at: string | null;
  entries?: TimesheetEntry[];
}

export function TimesheetManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: new Date()
  });
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  // Fetch timesheets with entries
  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['timesheets-with-entries', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data: timesheetData, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('employee_id', profile.id)
        .order('period_start', { ascending: false });

      if (error) throw error;

      // Fetch entries for each timesheet
      const timesheetsWithEntries = await Promise.all(
        (timesheetData || []).map(async (ts) => {
          const { data: entries } = await supabase
            .from('timesheet_entries')
            .select(`
              *,
              project:projects(id, name),
              task:tasks(id, title, task_number)
            `)
            .eq('timesheet_id', ts.id)
            .order('work_date', { ascending: false });

          return {
            ...ts,
            entries: entries || [],
          } as Timesheet;
        })
      );

      return timesheetsWithEntries;
    },
    enabled: !!profile?.id,
  });

  // Fetch employees for filter (admin only)
  const { data: employees = [] } = useQuery({
    queryKey: ['org-employees-filter', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && isAdmin,
  });

  // Fetch projects for filter
  const { data: projects = [] } = useQuery({
    queryKey: ['org-projects-filter', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Create timesheet mutation
  const createTimesheetMutation = useMutation({
    mutationFn: async () => {
      const periodStart = format(currentWeekStart, 'yyyy-MM-dd');
      const periodEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: profile?.id,
          period_start: periodStart,
          period_end: periodEnd,
          total_hours: 0,
          overtime_hours: 0,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets-with-entries'] });
      setSelectedTimesheetId(data.id);
      setIsEntryOpen(true);
      toast({ title: 'Timesheet created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating timesheet', description: error.message, variant: 'destructive' });
    },
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entry: any) => {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .insert({
          timesheet_id: selectedTimesheetId,
          organization_id: profile?.organization_id,
          ...entry,
        })
        .select()
        .single();

      if (error) throw error;

      // Update timesheet totals
      await updateTimesheetTotals(selectedTimesheetId!);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets-with-entries'] });
      setIsEntryOpen(false);
      toast({ title: 'Entry added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding entry', description: error.message, variant: 'destructive' });
    },
  });

  const updateTimesheetTotals = async (timesheetId: string) => {
    const { data: entries } = await supabase
      .from('timesheet_entries')
      .select('regular_hours, overtime_hours')
      .eq('timesheet_id', timesheetId);

    if (entries) {
      const totalRegular = entries.reduce((sum, e) => sum + (e.regular_hours || 0), 0);
      const totalOvertime = entries.reduce((sum, e) => sum + (e.overtime_hours || 0), 0);
      
      await supabase
        .from('timesheets')
        .update({
          total_hours: totalRegular,
          overtime_hours: totalOvertime,
        })
        .eq('id', timesheetId);
    }
  };

  // Submit timesheet mutation
  const submitTimesheetMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      const { error } = await supabase
        .from('timesheets')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', timesheetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets-with-entries'] });
      toast({ title: 'Timesheet submitted for approval' });
    },
  });

  // Sync LMS hours mutation
  const syncLMSHoursMutation = useMutation({
    mutationFn: async () => {
      const periodStart = format(currentWeekStart, 'yyyy-MM-dd');
      const periodEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      const { data, error } = await supabase.rpc('sync_lms_hours_to_timesheet', {
        p_user_id: profile?.id,
        p_start_date: periodStart,
        p_end_date: periodEnd,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets-with-entries'] });
      toast({ title: `Synced ${count || 0} LMS training hours` });
    },
    onError: (error) => {
      toast({ title: 'Error syncing LMS hours', description: error.message, variant: 'destructive' });
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
  const goToPreviousWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const goToNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  const goToCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Filter all entries based on filter criteria
  const filteredEntries = useMemo(() => {
    const allEntries = timesheets?.flatMap(ts => ts.entries || []) || [];
    return allEntries.filter(entry => {
      // Date range filter
      if (filterDateRange.from && filterDateRange.to) {
        const entryDate = parseISO(entry.work_date);
        if (!isWithinInterval(entryDate, { start: filterDateRange.from, end: filterDateRange.to })) {
          return false;
        }
      }
      // Project filter
      if (filterProject !== 'all' && entry.project_id !== filterProject) {
        return false;
      }
      return true;
    });
  }, [timesheets, filterDateRange, filterProject]);

  // Calculate summary from filtered entries
  const summary = useMemo(() => {
    return {
      totalHours: filteredEntries.reduce((sum, e) => sum + (e.regular_hours || 0) + (e.overtime_hours || 0), 0),
      billableHours: filteredEntries.filter(e => e.is_billable).reduce((sum, e) => sum + (e.regular_hours || 0) + (e.overtime_hours || 0), 0),
      nonBillableHours: filteredEntries.filter(e => !e.is_billable).reduce((sum, e) => sum + (e.regular_hours || 0) + (e.overtime_hours || 0), 0),
      regularHours: filteredEntries.reduce((sum, e) => sum + (e.regular_hours || 0), 0),
      overtimeHours: filteredEntries.reduce((sum, e) => sum + (e.overtime_hours || 0), 0),
      trainingHours: filteredEntries.filter(e => e.hours_type === 'training').reduce((sum, e) => sum + (e.regular_hours || 0), 0),
      ptoHours: filteredEntries.filter(e => e.hours_type === 'pto').reduce((sum, e) => sum + (e.regular_hours || 0), 0),
      estimatedRevenue: filteredEntries.filter(e => e.is_billable && e.billing_rate).reduce((sum, e) => sum + ((e.regular_hours || 0) + (e.overtime_hours || 0)) * (e.billing_rate || 0), 0),
      targetHours: 40,
    };
  }, [filteredEntries]);

  // Export to CSV
  const handleExportCSV = () => {
    const exportData = filteredEntries.map(entry => ({
      Date: format(parseISO(entry.work_date), 'yyyy-MM-dd'),
      Project: entry.project?.name || '-',
      Task: entry.task ? `${entry.task.task_number}: ${entry.task.title}` : '-',
      'Regular Hours': entry.regular_hours,
      'Overtime Hours': entry.overtime_hours,
      'Total Hours': (entry.regular_hours || 0) + (entry.overtime_hours || 0),
      Type: entry.hours_type || 'regular',
      Billable: entry.is_billable ? 'Yes' : 'No',
      'Billing Rate': entry.billing_rate || 0,
      Description: entry.description || '',
    }));

    const result = exportToCSV(exportData, `timesheet-export-${format(new Date(), 'yyyy-MM-dd')}`);
    if (result.success) {
      toast({ title: 'Export successful', description: `Exported ${result.recordCount || 0} entries` });
    } else {
      toast({ title: 'Export failed', description: result.message, variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setFilterDateRange({ from: startOfMonth(subMonths(new Date(), 1)), to: new Date() });
    setFilterEmployee('all');
    setFilterProject('all');
  };

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

  const currentWeekTimesheet = timesheets?.find(ts => {
    const tsStart = parseISO(ts.period_start);
    return format(tsStart, 'yyyy-MM-dd') === format(currentWeekStart, 'yyyy-MM-dd');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Timesheet Management</h1>
          <p className="text-muted-foreground">Track your work hours with billable/non-billable breakdown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => syncLMSHoursMutation.mutate()}
            disabled={syncLMSHoursMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import LMS Hours
          </Button>
          {currentWeekTimesheet ? (
            <Button 
              size="sm"
              onClick={() => {
                setSelectedTimesheetId(currentWeekTimesheet.id);
                setIsEntryOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={() => createTimesheetMutation.mutate()}
              disabled={createTimesheetMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Timesheet
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-[130px] justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filterDateRange.from ? format(filterDateRange.from, 'MMM dd') : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterDateRange.from}
                        onSelect={(date) => setFilterDateRange(prev => ({ ...prev, from: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-[130px] justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filterDateRange.to ? format(filterDateRange.to, 'MMM dd') : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterDateRange.to}
                        onSelect={(date) => setFilterDateRange(prev => ({ ...prev, to: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Filter (Admin only) */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-sm">Employee</Label>
                  <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Navigation */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-medium">
                {format(currentWeekStart, 'MMM dd')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
              </p>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={goToCurrentWeek}>
                Go to current week
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="calendar" className="flex-1 sm:flex-none">Calendar</TabsTrigger>
          <TabsTrigger value="entries" className="flex-1 sm:flex-none">Entries</TabsTrigger>
          <TabsTrigger value="summary" className="flex-1 sm:flex-none">Summary</TabsTrigger>
          <TabsTrigger value="timer" className="flex-1 sm:flex-none">Timer</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6 space-y-6">
          <WeeklyCalendarGrid
            weekStart={currentWeekStart}
            entries={filteredEntries}
            onAddEntry={(date) => {
              if (currentWeekTimesheet) {
                setSelectedTimesheetId(currentWeekTimesheet.id);
              } else {
                createTimesheetMutation.mutate();
              }
              setIsEntryOpen(true);
            }}
            targetHoursPerDay={8}
          />
          <TimesheetSummaryCards summary={summary} />
        </TabsContent>

        <TabsContent value="entries" className="mt-6 space-y-6">
          <TimesheetSummaryCards summary={summary} />

          {/* Timesheet Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Entries</CardTitle>
              <CardDescription>Your logged work hours with project and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : timesheets && timesheets.length > 0 ? (
                <div className="space-y-4">
                  {timesheets.map((timesheet) => (
                    <Card key={timesheet.id} className="border-dashed">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <CardTitle className="text-sm">
                              {format(parseISO(timesheet.period_start), 'MMM dd')} - {format(parseISO(timesheet.period_end), 'MMM dd, yyyy')}
                            </CardTitle>
                            <CardDescription>
                              {timesheet.total_hours}h regular, {timesheet.overtime_hours}h overtime
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(timesheet.status)}
                            {timesheet.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => submitTimesheetMutation.mutate(timesheet.id)}
                                disabled={submitTimesheetMutation.isPending}
                              >
                                Submit
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTimesheetId(timesheet.id);
                                setIsEntryOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {timesheet.entries && timesheet.entries.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="overflow-x-auto -mx-4 px-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="min-w-[100px]">Date</TableHead>
                                  <TableHead className="min-w-[120px]">Project</TableHead>
                                  <TableHead className="text-right min-w-[80px]">Hours</TableHead>
                                  <TableHead className="min-w-[80px]">Type</TableHead>
                                  <TableHead className="min-w-[80px]">Billable</TableHead>
                                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {timesheet.entries.map((entry) => (
                                  <TableRow key={entry.id}>
                                    <TableCell className="font-medium">
                                      {format(parseISO(entry.work_date), 'MMM dd')}
                                    </TableCell>
                                    <TableCell>
                                      <div className="truncate max-w-[150px]">
                                        {entry.project?.name || '-'}
                                        {entry.task && (
                                          <span className="text-xs text-muted-foreground block truncate">
                                            {entry.task.task_number}: {entry.task.title}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {entry.regular_hours}h
                                      {entry.overtime_hours > 0 && (
                                        <span className="text-orange-600 ml-1">+{entry.overtime_hours}</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-xs">
                                        {entry.hours_type || 'regular'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {entry.is_billable ? (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          ${entry.billing_rate || 0}/hr
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">No</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                                      {entry.description || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No timesheet entries found</p>
                  <p className="text-sm">Click "New Timesheet" to start logging your hours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <TimesheetSummaryCards summary={summary} />
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Weekly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Detailed weekly breakdown charts coming soon</p>
              </div>
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
                        if (currentWeekTimesheet) {
                          setSelectedTimesheetId(currentWeekTimesheet.id);
                        } else {
                          createTimesheetMutation.mutate();
                        }
                        setIsEntryOpen(true);
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

      {/* Add Entry Dialog */}
      <Dialog open={isEntryOpen} onOpenChange={setIsEntryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Timesheet Entry</DialogTitle>
            <DialogDescription>Log your work hours with project and billing details</DialogDescription>
          </DialogHeader>
          <EnhancedTimesheetEntry
            initialData={elapsedMinutes > 0 ? { regular_hours: Math.round(elapsedMinutes / 60 * 10) / 10 } : undefined}
            onSubmit={(data) => createEntryMutation.mutate(data)}
            onCancel={() => setIsEntryOpen(false)}
            isSubmitting={createEntryMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
