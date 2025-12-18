import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV, formatDateForExport } from '@/lib/export';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Clock, Download, Search, Filter, Calendar } from 'lucide-react';

export function TimeLogsPage() {
  const { timeLogs, isLoading, getWeeklyHours, getMonthlyHours } = useTimeLogs();
  const { tasks } = useTasks();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [datePreset, setDatePreset] = useState<string>('last30');

  // Fetch employees for admin filter
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-timelogs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin && !!profile?.organization_id,
  });

  // Handle date preset changes
  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    switch (preset) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'last7':
        setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'last30':
        setStartDate(format(subDays(today, 30), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'thisMonth':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'custom':
        // Keep current dates
        break;
    }
  };

  // Filtered time logs
  const filteredLogs = useMemo(() => {
    return timeLogs.filter(log => {
      // Date filter
      const logDate = parseISO(log.date_logged);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (!isWithinInterval(logDate, { start, end })) return false;

      // Task filter
      if (selectedTask !== 'all' && log.task_id !== selectedTask) return false;

      // User filter (admin only)
      if (isAdmin && selectedUser !== 'all' && log.user_id !== selectedUser) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const taskTitle = log.task?.title?.toLowerCase() || '';
        const userName = log.user_profile?.full_name?.toLowerCase() || '';
        const description = log.description?.toLowerCase() || '';
        if (!taskTitle.includes(query) && !userName.includes(query) && !description.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [timeLogs, startDate, endDate, selectedTask, selectedUser, searchQuery, isAdmin]);

  // Stats from filtered data
  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours_worked, 0);
  const uniqueTasks = new Set(filteredLogs.map(log => log.task_id)).size;
  const uniqueUsers = new Set(filteredLogs.map(log => log.user_id)).size;

  // Export filtered data
  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      date: formatDateForExport(log.date_logged),
      task: log.task?.title || 'Unknown Task',
      employee: log.user_profile?.full_name || 'Unknown',
      hours: log.hours_worked,
      description: log.description || '',
      created_at: formatDateForExport(log.created_at),
    }));

    exportToCSV(exportData, 'time_logs', [
      { key: 'date', label: 'Date' },
      { key: 'task', label: 'Task' },
      { key: 'employee', label: 'Employee' },
      { key: 'hours', label: 'Hours Worked' },
      { key: 'description', label: 'Description' },
      { key: 'created_at', label: 'Logged At' },
    ]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Logs</h1>
          <p className="text-muted-foreground text-sm">Track and manage working hours</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={filteredLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Hours</p>
                <p className="text-2xl font-bold">{getWeeklyHours().toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Filter className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Logged</p>
                <p className="text-2xl font-bold">{uniqueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Search className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{uniqueUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, users, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date Preset */}
            <div>
              <Label className="text-xs">Date Range</Label>
              <Select value={datePreset} onValueChange={handleDatePreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Task Filter */}
            <div>
              <Label className="text-xs">Task</Label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Filter (Admin only) */}
            {isAdmin && (
              <div>
                <Label className="text-xs">Employee</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Custom Date Range */}
          {datePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Log Entries</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {timeLogs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No Time Logs Found</h3>
              <p className="text-muted-foreground">
                {timeLogs.length === 0 
                  ? 'Start logging time on your tasks to see them here.'
                  : 'Try adjusting your filters to see more results.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Task</TableHead>
                    {isAdmin && <TableHead>Employee</TableHead>}
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(log.date_logged), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{log.task?.title || 'Unknown Task'}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {log.user_profile?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{log.user_profile?.full_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-right font-mono">
                        {log.hours_worked.toFixed(1)}h
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {log.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
