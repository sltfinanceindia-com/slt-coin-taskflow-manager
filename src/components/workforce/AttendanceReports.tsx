import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function AttendanceReports() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState('current');

  const getDateRange = () => {
    const now = new Date();
    if (period === 'current') return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === 'last') return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(subMonths(now, 2)) };
  };

  const { start, end } = getDateRange();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance-reports', profile?.organization_id, period],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*, employee:profiles!attendance_records_employee_id_fkey(full_name, department)')
        .eq('organization_id', profile.organization_id)
        .gte('attendance_date', format(start, 'yyyy-MM-dd'))
        .lte('attendance_date', format(end, 'yyyy-MM-dd'))
        .order('attendance_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const totalRecords = records.length;
  const presentCount = records.filter((r: any) => r.status === 'present').length;
  const lateCount = records.filter((r: any) => r.status === 'late').length;
  const absentCount = records.filter((r: any) => r.status === 'absent').length;
  const avgHours = totalRecords > 0
    ? (records.reduce((sum: number, r: any) => sum + (r.total_hours || 0), 0) / totalRecords).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Reports</h2>
          <p className="text-muted-foreground">Organization attendance summary and analytics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Month</SelectItem>
            <SelectItem value="last">Last Month</SelectItem>
            <SelectItem value="2months">2 Months Ago</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHours}h</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-muted-foreground">No attendance records found for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Employee</th>
                    <th className="text-left py-2 px-3 font-medium">Date</th>
                    <th className="text-left py-2 px-3 font-medium">Clock In</th>
                    <th className="text-left py-2 px-3 font-medium">Clock Out</th>
                    <th className="text-left py-2 px-3 font-medium">Hours</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 50).map((record: any) => (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="py-2 px-3">{record.employee?.full_name || 'Unknown'}</td>
                      <td className="py-2 px-3">{record.attendance_date}</td>
                      <td className="py-2 px-3">{record.clock_in_time ? format(new Date(record.clock_in_time), 'HH:mm') : '-'}</td>
                      <td className="py-2 px-3">{record.clock_out_time ? format(new Date(record.clock_out_time), 'HH:mm') : '-'}</td>
                      <td className="py-2 px-3">{record.total_hours?.toFixed(1) || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}>
                          {record.status || 'unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
