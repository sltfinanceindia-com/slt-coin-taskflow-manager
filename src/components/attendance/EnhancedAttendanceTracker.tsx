import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, LogIn, LogOut, TrendingUp, Calendar as CalendarIcon, 
  Download, Search, Users, CheckCircle, FileText, BarChart3,
  PieChart, Activity, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance, AttendanceRecord } from '@/hooks/useAttendance';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { SimpleBarChart, SimpleLineChart } from '@/components/SimpleChart';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
}

export function EnhancedAttendanceTracker() {
  const { profile } = useAuth();
  const { 
    loading, 
    getAttendanceByDateRange,
    formatDuration,
    getAttendanceStatusColor,
    getAttendanceStatusText
  } = useAttendance();
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'charts'>('overview');
  const [isClosingStaleSessions, setIsClosingStaleSessions] = useState(false);

  const isAdmin = profile?.role === 'admin';

  // Fetch all users for admin
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active')
        .eq('is_active', true)
        .order('full_name');
      
      if (data) setAllUsers(data);
    };

    fetchUsers();
  }, [isAdmin]);

  // Fetch attendance records with realtime subscription
  useEffect(() => {
    const fetchAttendance = async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (viewMode === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000);
      
      const userId = isAdmin && selectedUser !== 'all' ? selectedUser : undefined;
      const data = await getAttendanceByDateRange(userId, startDate, endDate);
      setAttendanceRecords(data);
    };

    fetchAttendance();

    // Set up realtime subscription for session logs
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_logs'
        },
        () => {
          console.log('Session log changed, refetching attendance...');
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewMode, selectedUser, isAdmin, getAttendanceByDateRange]);

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const totalHours = filteredRecords.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
    const onTimeCount = filteredRecords.filter(r => r.attendance_status === 'on-time').length;
    const lateCount = filteredRecords.filter(r => r.attendance_status === 'late').length;
    const veryLateCount = filteredRecords.filter(r => r.attendance_status === 'very-late').length;
    const totalDays = filteredRecords.length;
    
    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
    const onTimePercentage = totalDays > 0 ? (onTimeCount / totalDays) * 100 : 0;
    const latePercentage = totalDays > 0 ? (lateCount / totalDays) * 100 : 0;
    const veryLatePercentage = totalDays > 0 ? (veryLateCount / totalDays) * 100 : 0;

    // Group by user for admin view
    const userStats = isAdmin && selectedUser === 'all' ? 
      Object.entries(
        filteredRecords.reduce((acc, record) => {
          if (!acc[record.user_id]) {
            acc[record.user_id] = {
              name: record.full_name,
              totalMinutes: 0,
              onTime: 0,
              late: 0,
              days: 0
            };
          }
          acc[record.user_id].totalMinutes += record.total_minutes;
          acc[record.user_id].days += 1;
          if (record.attendance_status === 'on-time') acc[record.user_id].onTime += 1;
          else acc[record.user_id].late += 1;
          return acc;
        }, {} as Record<string, any>)
      ).map(([id, data]) => ({ id, ...data }))
      : [];

    return {
      totalHours,
      avgHoursPerDay,
      onTimeCount,
      lateCount,
      veryLateCount,
      totalDays,
      onTimePercentage,
      latePercentage,
      veryLatePercentage,
      userStats
    };
  }, [filteredRecords, isAdmin, selectedUser]);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Daily hours trend
    const dailyHours = filteredRecords
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
      .map(r => ({
        date: format(new Date(r.session_date), 'MMM dd'),
        hours: Math.round((r.total_minutes / 60) * 10) / 10,
        status: r.attendance_status
      }));

    // Status distribution
    const statusDistribution = [
      { status: 'On Time', count: stats.onTimeCount, percentage: stats.onTimePercentage },
      { status: 'Late', count: stats.lateCount, percentage: stats.latePercentage },
      { status: 'Very Late', count: stats.veryLateCount, percentage: stats.veryLatePercentage }
    ];

    // Weekly comparison (for month view)
    const weeklyData = viewMode === 'month' ? 
      Array.from({ length: 4 }, (_, i) => {
        const weekRecords = filteredRecords.filter(r => {
          const recordDate = new Date(r.session_date);
          const weekStart = new Date(Date.now() - ((3 - i) * 7 + 7) * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(Date.now() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekStart && recordDate < weekEnd;
        });
        const totalMins = weekRecords.reduce((sum, r) => sum + r.total_minutes, 0);
        return {
          week: `Week ${i + 1}`,
          hours: Math.round((totalMins / 60) * 10) / 10
        };
      })
      : [];

    return { dailyHours, statusDistribution, weeklyData };
  }, [filteredRecords, stats, viewMode]);

  // Enhanced export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Email', 'In Time (First Login)', 'Out Time (Last Logout)', 'Total Hours', 'Sessions', 'Status'];
    const csvData = filteredRecords.map(r => [
      r.session_date,
      r.full_name,
      r.email,
      r.first_login ? format(new Date(r.first_login), 'HH:mm:ss') : 'N/A',
      r.last_logout ? format(new Date(r.last_logout), 'HH:mm:ss') : 'N/A',
      formatDuration(r.total_minutes),
      r.session_count.toString(),
      getAttendanceStatusText(r.attendance_status)
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeAllStaleSessions = async () => {
    setIsClosingStaleSessions(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-stale-sessions');
      
      if (error) throw error;
      
      toast({
        title: "Stale Sessions Closed",
        description: `Successfully closed ${data.closedCount} stale session(s)`,
      });
      
      // Refresh attendance data
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (viewMode === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000);
      const userId = isAdmin && selectedUser !== 'all' ? selectedUser : undefined;
      const newRecords = await getAttendanceByDateRange(userId, startDate, endDate);
      setAttendanceRecords(newRecords);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to close stale sessions",
        variant: "destructive",
      });
    } finally {
      setIsClosingStaleSessions(false);
    }
  };

  const exportDetailedReport = () => {
    const report = `
ATTENDANCE DETAILED REPORT
Generated: ${format(new Date(), 'PPpp')}
Period: ${viewMode === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
${selectedUser !== 'all' ? `User: ${allUsers.find(u => u.id === selectedUser)?.full_name}` : 'All Users'}

=== SUMMARY STATISTICS ===
Total Working Hours: ${formatDuration(stats.totalHours)}
Average Hours/Day: ${formatDuration(stats.avgHoursPerDay)}
Total Days: ${stats.totalDays}
On-Time Days: ${stats.onTimeCount} (${stats.onTimePercentage.toFixed(1)}%)
Late Days: ${stats.lateCount} (${stats.latePercentage.toFixed(1)}%)
Very Late Days: ${stats.veryLateCount} (${stats.veryLatePercentage.toFixed(1)}%)

=== DETAILED RECORDS ===
${filteredRecords.map(r => `
Date: ${format(new Date(r.session_date), 'EEEE, MMMM dd, yyyy')}
Employee: ${r.full_name} (${r.email})
In Time: ${r.first_login ? format(new Date(r.first_login), 'HH:mm:ss') : 'N/A'}
Out Time: ${r.last_logout ? format(new Date(r.last_logout), 'HH:mm:ss') : (r.is_active ? 'Currently Active' : 'N/A')}
Total Hours: ${formatDuration(r.total_minutes)}${r.is_active ? ' (ongoing)' : ''}
Sessions: ${r.session_count}
Status: ${getAttendanceStatusText(r.attendance_status)}
${r.closure_note ? `Note: ${r.closure_note}` : ''}
---`).join('\n')}

${isAdmin && selectedUser === 'all' && stats.userStats.length > 0 ? `
=== USER SUMMARY ===
${stats.userStats.map(u => `
${u.name}:
  Total Hours: ${formatDuration(u.totalMinutes)}
  Days Present: ${u.days}
  On-Time: ${u.onTime} | Late: ${u.late}
  Avg Hours/Day: ${formatDuration(u.totalMinutes / u.days)}
`).join('\n')}` : ''}

=== END OF REPORT ===
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_detailed_report_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Attendance Management
          </h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Monitor team attendance with In Time and Out Time tracking' : 'View your attendance records'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportDetailedReport} variant="default" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Detailed Report
          </Button>
          {isAdmin && (
            <Button 
              onClick={closeAllStaleSessions} 
              variant="destructive"
              size="sm"
              disabled={isClosingStaleSessions}
            >
              <X className="h-4 w-4 mr-2" />
              {isClosingStaleSessions ? 'Closing...' : 'Close Stale Sessions'}
            </Button>
          )}
        </div>
      </div>

      {/* Filters - Admin Only */}
      {isAdmin && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="on-time">On Time</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="very-late">Very Late</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Time</p>
                <p className="text-2xl font-bold">{stats.onTimeCount}</p>
                <p className="text-xs text-muted-foreground">{stats.onTimePercentage.toFixed(1)}% of days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold">{stats.lateCount + stats.veryLateCount}</p>
                <p className="text-xs text-muted-foreground">
                  {(stats.latePercentage + stats.veryLatePercentage).toFixed(1)}% of days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{formatDuration(stats.totalHours)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDuration(stats.avgHoursPerDay)} avg/day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Days Present</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
                <p className="text-xs text-muted-foreground">
                  {viewMode === 'week' ? 'This week' : 'This month'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="details">
            <Users className="h-4 w-4 mr-2" />
            Detailed Records
          </TabsTrigger>
          <TabsTrigger value="charts">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance Status Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Attendance Status Distribution
                </CardTitle>
                <CardDescription>Breakdown of attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chartData.statusDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-4 h-4 rounded ${
                          item.status === 'On Time' ? 'bg-green-500' :
                          item.status === 'Late' ? 'bg-yellow-500' : 'bg-orange-500'
                        }`} />
                        <span className="text-sm font-medium">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{item.count} days</span>
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Performance (Admin only) */}
            {isAdmin && selectedUser === 'all' && stats.userStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Users ranked by total hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.userStats
                      .sort((a, b) => b.totalMinutes - a.totalMinutes)
                      .slice(0, 5)
                      .map((user, idx) => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{idx + 1}</Badge>
                            <span className="text-sm font-medium">{user.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatDuration(user.totalMinutes)}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.onTime}/{user.days} on-time
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Detailed view of In Time and Out Time for each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading attendance...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">No attendance records found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRecords.map((record) => (
                    <div
                      key={`${record.user_id}-${record.session_date}`}
                      className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getAttendanceStatusColor(record.attendance_status)}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-base">
                                {format(new Date(record.session_date), 'EEEE, MMM dd, yyyy')}
                              </p>
                              {record.is_active && (
                                <Badge className="bg-blue-500 hover:bg-blue-600">
                                  <Activity className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                              {record.closure_type === 'auto' && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                                  Auto-closed
                                </Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={`${getAttendanceStatusColor(record.attendance_status)} text-white border-0`}
                              >
                                {getAttendanceStatusText(record.attendance_status)}
                              </Badge>
                            </div>
                            {isAdmin && (
                              <p className="text-sm text-muted-foreground mt-1">{record.full_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg text-primary">
                            {formatDuration(record.total_minutes)}
                            {record.is_active && <span className="text-blue-600 text-sm ml-1">(ongoing)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.session_count} session{record.session_count > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm pl-6">
                        <div className="flex items-center gap-1">
                          <LogIn className="h-3 w-3 text-green-600" />
                          <span className="font-medium">In Time:</span>
                          <span className="text-muted-foreground">
                            {record.first_login ? format(new Date(record.first_login), 'HH:mm:ss') : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <LogOut className="h-3 w-3 text-blue-600" />
                          <span className="font-medium">Out Time:</span>
                          <span className="text-muted-foreground">
                            {record.last_logout ? format(new Date(record.last_logout), 'HH:mm:ss') : (
                              <span className="text-blue-600">Currently Active</span>
                            )}
                          </span>
                        </div>
                      </div>
                      {record.closure_note && (
                        <div className="mt-3 ml-6 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-700">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {record.closure_note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Daily Hours Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Working Hours Trend
                </CardTitle>
                <CardDescription>
                  Hours worked each day over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.dailyHours.length > 0 ? (
                  <SimpleBarChart
                    data={chartData.dailyHours}
                    dataKey="hours"
                    xAxisKey="date"
                    height={250}
                    color="hsl(var(--primary))"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Comparison (Month view) */}
            {viewMode === 'month' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weekly Hours Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare total hours across weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.weeklyData.length > 0 ? (
                    <SimpleLineChart
                      data={chartData.weeklyData}
                      dataKey="hours"
                      xAxisKey="week"
                      height={250}
                      color="hsl(var(--chart-2))"
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
