import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, TrendingDown, Clock, CheckCircle } from 'lucide-react';

export const LeaveOverview: React.FC = () => {
  const { myBalances, myRequests, isLoading } = useLeaveManagement();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const approvedThisMonth = myRequests.filter(r => {
    const requestDate = new Date(r.created_at);
    const now = new Date();
    return r.status === 'approved' && 
           requestDate.getMonth() === now.getMonth() && 
           requestDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Leave days approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            My Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myBalances.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No leave balances configured. Contact your administrator.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myBalances.map((balance) => {
                const available = Number(balance.total_days) - Number(balance.used_days) - Number(balance.pending_days);
                const usedPercentage = (Number(balance.used_days) / Number(balance.total_days)) * 100;
                
                return (
                  <Card key={balance.id} className="border-l-4" style={{ borderLeftColor: balance.leave_type?.color }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {balance.leave_type?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-semibold">{available.toFixed(1)} days</span>
                      </div>
                      <Progress value={usedPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {Number(balance.used_days).toFixed(1)}</span>
                        <span>Total: {Number(balance.total_days).toFixed(1)}</span>
                      </div>
                      {Number(balance.pending_days) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Clock className="h-3 w-3" />
                          <span>{Number(balance.pending_days).toFixed(1)} days pending</span>
                        </div>
                      )}
                      {Number(balance.carried_forward) > 0 && (
                        <div className="text-xs text-muted-foreground">
                          +{Number(balance.carried_forward).toFixed(1)} carried forward
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
