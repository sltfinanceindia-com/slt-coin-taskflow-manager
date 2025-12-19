import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useGeoAttendance } from '@/hooks/useGeoAttendance';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, AlertTriangle, CheckCircle2, Download, CalendarIcon, Search, Filter, X } from 'lucide-react';
import { exportToCSV } from '@/lib/export';
import { cn } from '@/lib/utils';

export const AttendanceDashboard: React.FC = () => {
  const { allAttendance, isAdminLoading } = useGeoAttendance();
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter attendance records
  const filteredAttendance = useMemo(() => {
    return allAttendance.filter(record => {
      // Date range filter
      if (startDate || endDate) {
        const recordDate = parseISO(record.attendance_date);
        if (startDate && endDate) {
          if (!isWithinInterval(recordDate, { start: startOfDay(startDate), end: endOfDay(endDate) })) {
            return false;
          }
        } else if (startDate && recordDate < startOfDay(startDate)) {
          return false;
        } else if (endDate && recordDate > endOfDay(endDate)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false;
      }

      // Search filter (by employee name or email)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = record.employee?.full_name?.toLowerCase().includes(query);
        const emailMatch = record.employee?.email?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allAttendance, startDate, endDate, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    present: filteredAttendance.filter(a => a.status === 'present' || a.status === 'late').length,
    late: filteredAttendance.filter(a => a.status === 'late').length,
    onTime: filteredAttendance.filter(a => a.status === 'present').length,
    wfh: filteredAttendance.filter(a => a.status === 'wfh').length,
  }), [filteredAttendance]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = startDate || endDate || statusFilter !== 'all' || searchQuery;

  if (isAdminLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportCSV = () => {
    const exportData = filteredAttendance.map(record => ({
      employee_name: record.employee?.full_name || 'Unknown',
      email: record.employee?.email || '',
      date: format(new Date(record.attendance_date), 'yyyy-MM-dd'),
      clock_in: record.clock_in_time ? format(new Date(record.clock_in_time), 'HH:mm') : '-',
      clock_out: record.clock_out_time ? format(new Date(record.clock_out_time), 'HH:mm') : '-',
      status: record.status,
      total_hours: record.total_hours || 0,
    }));
    
    exportToCSV(exportData, 'attendance_report', [
      { key: 'employee_name', label: 'Employee Name' },
      { key: 'email', label: 'Email' },
      { key: 'date', label: 'Date' },
      { key: 'clock_in', label: 'Clock In' },
      { key: 'clock_out', label: 'Clock Out' },
      { key: 'status', label: 'Status' },
      { key: 'total_hours', label: 'Total Hours' },
    ]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="wfh">Work from Home</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Present</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{stats.present}</div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? 'Filtered results' : 'Employees today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">On Time</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500 hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.onTime}</div>
            <p className="text-xs text-muted-foreground">Arrived on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500 hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Arrived late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Working from Home</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500 hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.wfh}</div>
            <p className="text-xs text-muted-foreground">Remote today</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            {hasActiveFilters 
              ? `Attendance Records (${filteredAttendance.length})` 
              : `Today's Attendance - ${format(new Date(), 'MMM d, yyyy')}`}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredAttendance.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {hasActiveFilters ? 'No records match your filters' : 'No attendance records for today'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttendance.map((record) => (
                <div 
                  key={record.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      <AvatarImage src={record.employee?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {record.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{record.employee?.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{record.employee?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-12 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(record.attendance_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs sm:text-sm">
                        In: {record.clock_in_time ? format(new Date(record.clock_in_time), 'HH:mm') : '-'}
                        {' / '}
                        Out: {record.clock_out_time ? format(new Date(record.clock_out_time), 'HH:mm') : '-'}
                      </p>
                    </div>
                    <Badge 
                      className={
                        record.status === 'present' ? 'bg-green-500' :
                        record.status === 'late' ? 'bg-amber-500' :
                        record.status === 'wfh' ? 'bg-indigo-500' :
                        'bg-gray-500'
                      }
                    >
                      {record.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};