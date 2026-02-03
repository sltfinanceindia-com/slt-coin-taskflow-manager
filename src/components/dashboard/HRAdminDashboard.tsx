/**
 * HR Admin Dashboard
 * Shows HR-specific widgets: Headcount, Attrition, Pending Leaves, New Hires
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, UserPlus, UserMinus, Calendar, FileCheck, ArrowRight,
  TrendingUp, TrendingDown, Building2, MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export function HRAdminDashboard() {
  const { profile } = useAuth();

  // Fetch all employees count
  const { data: employees = [] } = useQuery({
    queryKey: ['hr-employees', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, department, role, is_active, created_at')
        .eq('organization_id', profile?.organization_id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch pending leave requests
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['hr-pending-leaves', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, profiles:employee_id(full_name, avatar_url, department)')
        .eq('organization_id', profile?.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['hr-departments', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', profile?.organization_id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate metrics
  const activeEmployees = employees.filter(e => e.is_active !== false);
  const newHiresThisMonth = employees.filter(e => {
    const createdDate = new Date(e.created_at);
    const monthStart = startOfMonth(new Date());
    return createdDate >= monthStart;
  });

  // Calculate department distribution
  const departmentCounts = activeEmployees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDepartments = Object.entries(departmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const navigateToTab = (tab: string) => {
    const event = new CustomEvent('navigate-to-tab', { detail: { tab } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold">HR Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Overview of your organization&apos;s workforce
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
                <p className="text-2xl font-bold">{activeEmployees.length}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  {newHiresThisMonth.length} new this month
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Hires</p>
                <p className="text-2xl font-bold">{newHiresThisMonth.length}</p>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <UserPlus className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Leaves</p>
                <p className="text-2xl font-bold">{pendingLeaves.length}</p>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-xs text-muted-foreground">
                  Active departments
                </p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Building2 className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDepartments.map(([dept, count]) => (
              <div key={dept} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{dept}</span>
                  <span className="font-medium">{count} employees</span>
                </div>
                <Progress 
                  value={(count / activeEmployees.length) * 100} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Leave Requests */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Pending Leave Requests
            {pendingLeaves.length > 0 && (
              <Badge variant="destructive">{pendingLeaves.length}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('leave')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 5).map((leave: any) => (
                <div 
                  key={leave.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{leave.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.leave_type} • {format(parseISO(leave.start_date), 'MMM d')} - {format(parseISO(leave.end_date), 'MMM d')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leave.profiles?.department}
                    </p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No pending leave requests
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('interns')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Add Employee</p>
              <p className="text-sm text-muted-foreground">Onboard new hire</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('attendance')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="font-medium">Attendance</p>
              <p className="text-sm text-muted-foreground">View today&apos;s status</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('analytics')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-info" />
            <div className="flex-1">
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-muted-foreground">HR metrics & reports</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Hires */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Recent Hires
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('interns')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {newHiresThisMonth.length > 0 ? (
            <div className="space-y-3">
              {newHiresThisMonth.slice(0, 5).map((hire) => (
                <div 
                  key={hire.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{hire.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {hire.department || 'No department'} • {hire.role}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Joined {format(new Date(hire.created_at), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No new hires this month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
