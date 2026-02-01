/**
 * Employee Detail Page - Full 11-Tab Structure
 * Route: /employees/:id
 * Tabs: Overview, Personal, Employment, Documents, Performance, Attendance, Leaves, Payroll, Assets, Training, History
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, User, Briefcase, FileText, TrendingUp, Clock, 
  Calendar, DollarSign, Laptop, GraduationCap, History,
  Mail, Phone, Building, MapPin, Users, Award, CheckCircle2
} from 'lucide-react';

// Tab Components
import { EmployeeOverviewTab } from '@/components/employee-detail/EmployeeOverviewTab';
import { EmployeePersonalTab } from '@/components/employee-detail/EmployeePersonalTab';
import { EmployeeEmploymentTab } from '@/components/employee-detail/EmployeeEmploymentTab';
import { EmployeeDocumentsTab } from '@/components/employee-detail/EmployeeDocumentsTab';
import { EmployeePerformanceTab } from '@/components/employee-detail/EmployeePerformanceTab';
import { EmployeeAttendanceTab } from '@/components/employee-detail/EmployeeAttendanceTab';
import { EmployeeLeavesTab } from '@/components/employee-detail/EmployeeLeavesTab';
import { EmployeePayrollTab } from '@/components/employee-detail/EmployeePayrollTab';
import { EmployeeAssetsTab } from '@/components/employee-detail/EmployeeAssetsTab';
import { EmployeeTrainingTab } from '@/components/employee-detail/EmployeeTrainingTab';
import { EmployeeHistoryTab } from '@/components/employee-detail/EmployeeHistoryTab';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();
  const { isAdmin, isManager } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch employee profile
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee-detail', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch employee stats
  const { data: employeeStats } = useQuery({
    queryKey: ['employee-stats', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Get task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('assigned_to', id);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => ['completed', 'verified'].includes(t.status)).length || 0;

      // Get attendance stats for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('id, status')
        .eq('employee_id', id)
        .gte('attendance_date', startOfMonth.toISOString().split('T')[0]);

      const presentDays = attendance?.filter(a => a.status === 'present').length || 0;
      const totalRecords = attendance?.length || 0;
      const attendanceRate = totalRecords > 0 ? Math.round((presentDays / totalRecords) * 100) : 100;

      // Get leave balance - using entitled column
      const { data: leaveBalances } = await supabase
        .from('leave_balances')
        .select('entitled, used')
        .eq('employee_id', id);

      const totalLeaveBalance = leaveBalances?.reduce((sum: number, lb: any) => sum + ((lb.entitled || 0) - (lb.used || 0)), 0) || 0;

      return {
        totalTasks,
        completedTasks,
        attendanceRate,
        totalLeaveBalance,
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Employee Not Found</h1>
        <Button onClick={() => navigate('/dashboard?tab=interns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Team
        </Button>
      </div>
    );
  }

  // Check if user has access
  if (!isAdmin && !isManager && currentUser?.id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view this profile.</p>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatar_url || ''} />
                  <AvatarFallback>{employee.full_name?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{employee.full_name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{employee.employee_id || 'No ID'}</span>
                    <span>•</span>
                    <span>{employee.department || 'No Department'}</span>
                    <Badge variant={employee.is_active !== false ? 'default' : 'destructive'} className="ml-2">
                      {employee.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Award className="h-3 w-3 text-amber-500" />
                {employee.total_coins || 0} coins
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Tasks
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {employeeStats?.completedTasks || 0}/{employeeStats?.totalTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                Attendance
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{employeeStats?.attendanceRate || 100}%</div>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                Leave Balance
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{employeeStats?.totalLeaveBalance || 0}</div>
                <p className="text-xs text-muted-foreground">days available</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Award className="h-4 w-4" />
                Coins Earned
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{employee.total_coins || 0}</div>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 11-Tab Structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full h-auto flex-wrap gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Employment</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Documents</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="leaves" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Leaves</span>
              </TabsTrigger>
              <TabsTrigger value="payroll" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Payroll</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Laptop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Assets</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Training</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <EmployeeOverviewTab employee={employee} stats={employeeStats} />
          </TabsContent>
          <TabsContent value="personal">
            <EmployeePersonalTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="employment">
            <EmployeeEmploymentTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="documents">
            <EmployeeDocumentsTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="performance">
            <EmployeePerformanceTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="attendance">
            <EmployeeAttendanceTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="leaves">
            <EmployeeLeavesTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="payroll">
            <EmployeePayrollTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="assets">
            <EmployeeAssetsTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="training">
            <EmployeeTrainingTab employeeId={id!} />
          </TabsContent>
          <TabsContent value="history">
            <EmployeeHistoryTab employeeId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
