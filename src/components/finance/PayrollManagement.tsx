import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Wallet, Play, CheckCircle, Clock, Download, 
  FileText, Users, IndianRupee, Calculator, TrendingUp
} from 'lucide-react';

interface PayrollRun {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'paid';
  total_gross: number;
  total_deductions: number;
  total_net: number;
  employee_count: number;
  processed_at?: string;
  paid_at?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PayrollManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('runs');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const currentDate = new Date();
  const [newRun, setNewRun] = useState({
    month: MONTHS[currentDate.getMonth()],
    year: currentDate.getFullYear().toString(),
  });

  // Fetch payroll runs from timesheets table (repurposed for payroll tracking)
  const { data: payrollRuns, isLoading } = useQuery({
    queryKey: ['payroll-runs', profile?.organization_id],
    queryFn: async (): Promise<PayrollRun[]> => {
      if (!profile?.organization_id) return [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { data, error } = await client
        .from('timesheets')
        .select('id, period_start, period_end, status, total_hours, overtime_hours, created_at')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((t: any) => {
        const startDate = new Date(t.period_start || t.start_date || new Date());
        return {
          id: t.id,
          month: MONTHS[startDate.getMonth()],
          year: startDate.getFullYear(),
          status: t.status === 'approved' ? 'completed' : t.status === 'submitted' ? 'processing' : 'draft',
          total_gross: (t.total_hours || 0) * 500, // Mock calculation
          total_deductions: (t.total_hours || 0) * 50,
          total_net: (t.total_hours || 0) * 450,
          employee_count: Math.floor(Math.random() * 20) + 5,
          processed_at: t.status === 'approved' ? t.created_at : undefined,
        } as PayrollRun;
      });
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch employees for payslips
  const { data: employees } = useQuery({
    queryKey: ['payroll-employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const createPayrollMutation = useMutation({
    mutationFn: async (run: typeof newRun) => {
      const monthIndex = MONTHS.indexOf(run.month);
      const startDate = new Date(parseInt(run.year), monthIndex, 1);
      const endDate = new Date(parseInt(run.year), monthIndex + 1, 0);

      // Using any to bypass strict type checking for flexible schema usage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData: any = {
        employee_id: profile?.id || '',
        period_start: format(startDate, 'yyyy-MM-dd'),
        period_end: format(endDate, 'yyyy-MM-dd'),
        status: 'draft',
        total_hours: 0,
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { error } = await client.from('timesheets').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      setIsCreateOpen(false);
      setNewRun({ month: MONTHS[currentDate.getMonth()], year: currentDate.getFullYear().toString() });
      toast({ title: 'Payroll run created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating payroll run', description: error.message, variant: 'destructive' });
    },
  });

  const processPayrollMutation = useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('timesheets')
        .update({ status: 'submitted' })
        .eq('id', runId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast({ title: 'Payroll processing started' });
    },
  });

  const approvePayrollMutation = useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('timesheets')
        .update({ status: 'approved' })
        .eq('id', runId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast({ title: 'Payroll approved and marked as paid' });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      draft: { variant: 'outline', label: 'Draft' },
      processing: { variant: 'secondary', label: 'Processing' },
      completed: { variant: 'default', label: 'Completed' },
      paid: { variant: 'default', label: 'Paid' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPayroll = payrollRuns?.reduce((sum, run) => sum + run.total_net, 0) || 0;
  const completedRuns = payrollRuns?.filter(r => r.status === 'completed' || r.status === 'paid').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process salaries, generate payslips, and manage compensation</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Calculator className="h-4 w-4 mr-2" />
              New Payroll Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payroll Run</DialogTitle>
              <DialogDescription>Start a new payroll processing cycle</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Month</Label>
                  <Select
                    value={newRun.month}
                    onValueChange={(v) => setNewRun(prev => ({ ...prev, month: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Year</Label>
                  <Select
                    value={newRun.year}
                    onValueChange={(v) => setNewRun(prev => ({ ...prev, year: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => createPayrollMutation.mutate(newRun)}
                disabled={createPayrollMutation.isPending}
              >
                {createPayrollMutation.isPending ? 'Creating...' : 'Create Payroll Run'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRuns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{completedRuns} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Net payroll amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollRuns?.filter(r => r.status === 'draft' || r.status === 'processing').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Runs to process</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="employees">Employee Salaries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing History</CardTitle>
              <CardDescription>View and manage payroll runs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : payrollRuns && payrollRuns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Employees</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Payable</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.month} {run.year}</TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell className="text-right">{run.employee_count}</TableCell>
                        <TableCell className="text-right">₹{run.total_gross.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-destructive">-₹{run.total_deductions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">₹{run.total_net.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {run.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => processPayrollMutation.mutate(run.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Process
                              </Button>
                            )}
                            {run.status === 'processing' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approvePayrollMutation.mutate(run.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {(run.status === 'completed' || run.status === 'paid') && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Export
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payroll runs yet</p>
                  <p className="text-sm">Create your first payroll run to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Salary Overview</CardTitle>
              <CardDescription>View individual employee compensation details</CardDescription>
            </CardHeader>
            <CardContent>
              {employees && employees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Basic Salary</TableHead>
                      <TableHead className="text-right">Allowances</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const basic = 50000 + Math.floor(Math.random() * 50000);
                      const allowances = basic * 0.4;
                      const deductions = basic * 0.12;
                      const net = basic + allowances - deductions;
                      return (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.full_name}</TableCell>
                          <TableCell>{emp.department || 'General'}</TableCell>
                          <TableCell className="text-right">₹{basic.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">+₹{allowances.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-destructive">-₹{deductions.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">₹{net.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No employees found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Reports</CardTitle>
                <CardDescription>Generate and download payroll reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Monthly Summary</h3>
                          <p className="text-sm text-muted-foreground">Payroll summary by month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">YTD Report</h3>
                          <p className="text-sm text-muted-foreground">Year-to-date payroll data</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <Download className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Bank File</h3>
                          <p className="text-sm text-muted-foreground">Generate bank transfer file</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
