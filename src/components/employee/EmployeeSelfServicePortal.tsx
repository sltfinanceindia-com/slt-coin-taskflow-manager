import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { 
  User, 
  Wallet, 
  Calendar, 
  Clock, 
  FileText, 
  Award, 
  TrendingUp,
  Download,
  Mail,
  Building2,
  Briefcase,
  Coins
} from 'lucide-react';
import { PayslipGenerator } from '@/components/payroll/PayslipGenerator';

export function EmployeeSelfServicePortal() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch employee's payroll records
  const { data: payrollRecords } = useQuery({
    queryKey: ['my-payroll', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('employee_id', profile?.id)
        .order('pay_period_end', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch leave balance
  const { data: leaveBalance } = useQuery({
    queryKey: ['my-leave-balance', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', profile?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch attendance for current month
  const { data: monthlyAttendance } = useQuery({
    queryKey: ['my-attendance', profile?.id],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', profile?.id)
        .gte('attendance_date', format(startOfMonth(now), 'yyyy-MM-dd'))
        .lte('attendance_date', format(endOfMonth(now), 'yyyy-MM-dd'));
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch tasks assigned to me
  const { data: myTasks } = useQuery({
    queryKey: ['my-tasks', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', profile?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch coin transactions
  const { data: coinTransactions } = useQuery({
    queryKey: ['my-coins', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*, task:tasks(title)')
        .eq('user_id', profile?.id)
        .order('transaction_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['my-achievements', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', profile?.id)
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Calculate stats
  const totalCoins = profile?.total_coins || 0;
  const presentDays = monthlyAttendance?.filter(a => a.status === 'present').length || 0;
  const workingDays = differenceInDays(endOfMonth(new Date()), startOfMonth(new Date())) + 1;
  const attendancePercentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;
  const completedTasks = myTasks?.filter(t => t.status === 'verified').length || 0;
  const totalTasks = myTasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <Badge variant="secondary" className="capitalize">{profile?.role}</Badge>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
              <Coins className="h-5 w-5 text-amber-600" />
              <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {totalCoins.toLocaleString()} Coins
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-primary">{attendancePercentage}%</div>
            <p className="text-sm text-muted-foreground">Attendance</p>
            <Progress value={attendancePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
            <p className="text-xs text-muted-foreground mt-1">of {totalTasks} assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{totalCoins}</div>
            <p className="text-sm text-muted-foreground">Total Coins</p>
            <p className="text-xs text-muted-foreground mt-1">Earned this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{achievements?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Achievements</p>
            <p className="text-xs text-muted-foreground mt-1">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payslips" className="gap-2">
            <FileText className="h-4 w-4" />
            Payslips
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-2">
            <Calendar className="h-4 w-4" />
            Leave
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Tasks</CardTitle>
                <CardDescription>Your latest assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myTasks?.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(task.end_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge 
                        variant={task.status === 'verified' ? 'default' : 'secondary'}
                        className={task.status === 'verified' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {(!myTasks || myTasks.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No tasks assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Coins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coin Transactions</CardTitle>
                <CardDescription>Your recent earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coinTransactions?.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{(tx.task as any)?.title || 'Task Reward'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.transaction_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <span className="font-bold text-amber-600">+{tx.coins_earned}</span>
                    </div>
                  ))}
                  {(!coinTransactions || coinTransactions.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No coin transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payslips">
          <Card>
            <CardHeader>
              <CardTitle>My Payslips</CardTitle>
              <CardDescription>View and download your salary statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRecords?.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {format(new Date(record.pay_period_start), 'MMMM yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold text-lg">₹{Number(record.net_salary).toLocaleString('en-IN')}</p>
                      <Badge 
                        variant={record.payment_status === 'paid' ? 'default' : 'secondary'}
                        className={record.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {record.payment_status}
                      </Badge>
                    </div>
                    <PayslipGenerator 
                      record={{
                        ...record,
                        employee: {
                          full_name: profile?.full_name || '',
                          email: profile?.email || ''
                        },
                        basic_salary: Number(record.basic_salary),
                        bonus: Number(record.bonus),
                        tax_deduction: Number(record.tax_deduction),
                        pf_deduction: Number(record.pf_deduction),
                        net_salary: Number(record.net_salary)
                      }}
                    />
                  </div>
                ))}
                {(!payrollRecords || payrollRecords.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No payslips available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your attendance for {format(new Date(), 'MMMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyAttendance?.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{format(new Date(record.attendance_date), 'EEEE, MMM dd')}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.clock_in_time && `In: ${format(new Date(record.clock_in_time), 'hh:mm a')}`}
                        {record.clock_out_time && ` • Out: ${format(new Date(record.clock_out_time), 'hh:mm a')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.total_hours && (
                        <span className="text-sm text-muted-foreground">{Number(record.total_hours).toFixed(1)}h</span>
                      )}
                      <Badge 
                        variant={record.status === 'present' ? 'default' : 'destructive'}
                        className={record.status === 'present' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!monthlyAttendance || monthlyAttendance.length === 0) && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No attendance records for this month</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
              <CardDescription>Your available leave entitlements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {leaveBalance?.map((balance) => {
                  const remaining = balance.total_days - balance.used_days;
                  return (
                    <Card key={balance.id}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Badge variant="outline" className="mb-2">Leave</Badge>
                          <div className="text-3xl font-bold text-primary">{remaining}</div>
                          <p className="text-sm text-muted-foreground">of {balance.total_days} days</p>
                          <Progress value={(remaining / balance.total_days) * 100} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {(!leaveBalance || leaveBalance.length === 0) && (
                  <div className="col-span-3 text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No leave balance information available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>My Achievements</CardTitle>
              <CardDescription>Badges and rewards you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements?.map((ua) => (
                  <Card key={ua.id} className="text-center">
                    <CardContent className="pt-4">
                      <div 
                        className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: (ua.achievement as any)?.badge_color || '#6366f1' }}
                      >
                        {(ua.achievement as any)?.icon || '🏆'}
                      </div>
                      <p className="font-medium text-sm">{(ua.achievement as any)?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(ua.earned_at), 'MMM dd, yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {(!achievements || achievements.length === 0) && (
                  <div className="col-span-4 text-center py-8">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No achievements yet. Keep up the good work!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
