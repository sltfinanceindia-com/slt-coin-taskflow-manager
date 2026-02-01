/**
 * Employee Leaves Tab
 * Leave balance cards, leave history, upcoming leaves
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface EmployeeLeavesTabProps {
  employeeId: string;
}

export function EmployeeLeavesTab({ employeeId }: EmployeeLeavesTabProps) {
  const { data: leaveBalances = [] } = useQuery({
    queryKey: ['employee-leave-balances', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*, leave_types(*)')
        .eq('employee_id', employeeId);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['employee-leave-requests', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Leave Balance Cards */}
      <div>
        <h3 className="font-medium mb-4">Leave Balances</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leaveBalances.length === 0 ? (
            <>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Casual Leave</p>
                  <p className="text-2xl font-bold mt-1">0 / 12</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Sick Leave</p>
                  <p className="text-2xl font-bold mt-1">0 / 10</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Earned Leave</p>
                  <p className="text-2xl font-bold mt-1">0 / 15</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Comp Off</p>
                  <p className="text-2xl font-bold mt-1">0 / 0</p>
                </CardContent>
              </Card>
            </>
          ) : (
            leaveBalances.map((balance: any) => (
              <Card key={balance.id}>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    {balance.leave_types?.name || 'Leave'}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {balance.used || 0} / {balance.entitled || 0}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave History</CardTitle>
          <CardDescription>Recent leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((request: any) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{request.leave_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(request.start_date), 'MMM dd')} - {format(parseISO(request.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.days} day(s)
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
