/**
 * Time Logs Tab Component
 * Time tracking and logging with search, filters, and export
 */

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTimeLogs, TimeLog } from '@/hooks/useTimeLogs';
import { TimeLogDialog } from '@/components/TimeLogDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Search, Download, Calendar, User, Filter, TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';

export function TimeLogsTab() {
  const { profile } = useAuth();
  const { role, isAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch employees for admin filter
  const { data: employees } = useQuery({
    queryKey: ['employees-for-filter', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id && isAdmin,
  });

  // Fetch time logs with date range
  const { timeLogs, logTime, isLogging, getWeeklyHours, getMonthlyHours, isLoading } = useTimeLogs(
    selectedEmployee !== 'all' ? selectedEmployee : undefined,
    dateFrom || dateTo ? { start: dateFrom, end: dateTo } : undefined
  );

  // Filter logs based on search and user permissions
  const filteredLogs = useMemo(() => {
    let logs = timeLogs;

    // Non-admins only see their own logs
    if (!isAdmin) {
      logs = logs.filter(log => log.user_id === profile?.id);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      logs = logs.filter(log =>
        log.task?.title?.toLowerCase().includes(search) ||
        log.description?.toLowerCase().includes(search) ||
        log.user_profile?.full_name?.toLowerCase().includes(search)
      );
    }

    return logs;
  }, [timeLogs, searchTerm, isAdmin, profile?.id]);

  // Calculate stats
  const totalHours = useMemo(() => 
    filteredLogs.reduce((sum, log) => sum + log.hours_worked, 0),
    [filteredLogs]
  );

  const weeklyHours = getWeeklyHours(selectedEmployee !== 'all' ? selectedEmployee : undefined);
  const monthlyHours = getMonthlyHours(selectedEmployee !== 'all' ? selectedEmployee : undefined);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Date', 'Task', 'Employee', 'Hours', 'Description'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.date_logged), 'yyyy-MM-dd'),
      log.task?.title || 'N/A',
      log.user_profile?.full_name || 'N/A',
      log.hours_worked.toString(),
      log.description || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `time-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || selectedEmployee !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Time Logs"
        description="Track your working hours across tasks"
        actions={
          <div className="flex items-center gap-2">
            {(role === 'intern' || role === 'employee' || isAdmin) && (
              <TimeLogDialog onLogTime={logTime} isLogging={isLogging} />
            )}
          </div>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-lg font-bold">{weeklyHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold">{monthlyHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Shown</p>
                <p className="text-lg font-bold">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <User className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entries</p>
                <p className="text-lg font-bold">{filteredLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search and Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by task, description, or employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      Active
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t animate-fade-in">
                {isAdmin && (
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Employee</label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="All employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom}
                  />
                </div>
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Time Logs List */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            {filteredLogs.length} entries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{log.task?.title || 'No task'}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {log.description || 'No description'}
                    </p>
                    {isAdmin && log.user_profile && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {log.user_profile.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <Badge variant="secondary" className="font-bold text-base">
                      {log.hours_worked}h
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.date_logged), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No time logs found</h3>
              <p className="text-muted-foreground text-sm">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search term.'
                  : 'Start logging your work hours to track your progress.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
