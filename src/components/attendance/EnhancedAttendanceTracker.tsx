import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, LogIn, LogOut, TrendingUp, Calendar as CalendarIcon, 
  Download, Search, Filter, Users, CheckCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance, AttendanceRecord } from '@/hooks/useAttendance';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (viewMode === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000);
      
      const userId = isAdmin && selectedUser !== 'all' ? selectedUser : undefined;
      const data = await getAttendanceByDateRange(userId, startDate, endDate);
      setAttendanceRecords(data);
    };

    fetchAttendance();
  }, [viewMode, selectedUser, isAdmin, getAttendanceByDateRange]);

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const todayRecord = filteredRecords.find(
    r => r.session_date === new Date().toISOString().split('T')[0] && 
         (!isAdmin || selectedUser === 'all' || r.user_id === selectedUser)
  );

  const totalHours = filteredRecords.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
  const avgHoursPerDay = filteredRecords.length > 0 ? totalHours / filteredRecords.length : 0;
  const onTimeCount = filteredRecords.filter(r => r.attendance_status === 'on-time').length;
  const lateCount = filteredRecords.filter(r => r.attendance_status === 'late' || r.attendance_status === 'very-late').length;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Email', 'First Login', 'Last Logout', 'Total Hours', 'Status'];
    const csvData = filteredRecords.map(r => [
      r.session_date,
      r.full_name,
      r.email,
      r.first_login ? format(new Date(r.first_login), 'HH:mm') : '',
      r.last_logout ? format(new Date(r.last_logout), 'HH:mm') : '',
      formatDuration(r.total_minutes),
      getAttendanceStatusText(r.attendance_status)
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Attendance Tracking</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Monitor team attendance and work hours' : 'View your attendance records'}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">On Time</p>
                <p className="text-lg font-bold">{onTimeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Late</p>
                <p className="text-lg font-bold">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Hours</p>
                <p className="text-lg font-bold">{formatDuration(totalHours)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg Hours/Day</p>
                <p className="text-lg font-bold">{formatDuration(avgHoursPerDay)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {isAdmin ? 'Team attendance history' : 'Your attendance history'}
              </CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading attendance...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <div
                  key={`${record.user_id}-${record.session_date}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getAttendanceStatusColor(record.attendance_status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {format(new Date(record.session_date), 'EEEE, MMM dd, yyyy')}
                        </p>
                        <Badge variant="outline" className={getAttendanceStatusColor(record.attendance_status)}>
                          {getAttendanceStatusText(record.attendance_status)}
                        </Badge>
                      </div>
                      {isAdmin && (
                        <p className="text-sm text-muted-foreground">{record.full_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        <LogIn className="inline h-3 w-3 mr-1" />
                        {record.first_login && format(new Date(record.first_login), 'HH:mm')}
                        <LogOut className="inline h-3 w-3 ml-3 mr-1" />
                        {record.last_logout && format(new Date(record.last_logout), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatDuration(record.total_minutes)}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.session_count} session{record.session_count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
