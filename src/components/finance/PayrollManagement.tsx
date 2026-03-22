import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePayroll } from '@/hooks/usePayroll';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  Wallet, Play, CheckCircle, Clock, Download, 
  FileText, Users, IndianRupee, Calculator, TrendingUp
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PayrollManagement() {
  const { profile } = useAuth();
  const { 
    payrollRuns, 
    payrollRecords, 
    isLoading, 
    createPayrollRun, 
    updatePayrollRunStatus,
    isCreating 
  } = usePayroll();
  
  const [activeTab, setActiveTab] = useState('runs');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const currentDate = new Date();
  const [newRun, setNewRun] = useState({
    month: MONTHS[currentDate.getMonth()],
    year: currentDate.getFullYear().toString(),
  });

  // Fetch employees with their salary data from payroll_records
  const { data: employeesWithSalary } = useQuery({
    queryKey: ['payroll-employees-salary', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data: employees, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;

      // Get latest payroll record for each employee
      const employeeSalaries = await Promise.all(
        (employees || []).map(async (emp) => {
          const { data: latestRecord } = await supabase
            .from('payroll_records')
            .select('basic_salary, allowances, deductions, net_salary, gross_salary')
            .eq('employee_id', emp.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...emp,
            basic_salary: latestRecord?.basic_salary || 0,
            allowances: latestRecord?.allowances || {},
            deductions: latestRecord?.deductions || {},
            net_salary: latestRecord?.net_salary || 0,
            gross_salary: latestRecord?.gross_salary || 0,
          };
        })
      );

      return employeeSalaries;
    },
    enabled: !!profile?.organization_id,
  });

  const handleCreatePayrollRun = () => {
    const monthIndex = MONTHS.indexOf(newRun.month);
    const startDate = new Date(parseInt(newRun.year), monthIndex, 1);
    const endDate = new Date(parseInt(newRun.year), monthIndex + 1, 0);
    
    createPayrollRun.mutate({
      run_name: `${newRun.month} ${newRun.year} Payroll`,
      period_start: format(startDate, 'yyyy-MM-dd'),
      period_end: format(endDate, 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewRun({ month: MONTHS[currentDate.getMonth()], year: currentDate.getFullYear().toString() });
      }
    });
  };

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

  // Calculate real totals from payroll records
  const totalPayroll = payrollRecords.reduce((sum, record) => sum + (record.net_salary || 0), 0);
  const completedRuns = payrollRuns.filter(r => r.status === 'completed' || r.status === 'paid').length;
  const pendingRuns = payrollRuns.filter(r => r.status === 'draft' || r.status === 'processing').length;

  // Calculate allowances sum from object - using 'any' to handle Json type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateAllowances = (allowances: any): number => {
    if (!allowances || typeof allowances !== 'object' || Array.isArray(allowances)) return 0;
    let total = 0;
    for (const key in allowances) {
      const numVal = Number(allowances[key]);
      if (!isNaN(numVal)) total += numVal;
    }
    return total;
  };

  // Calculate deductions sum from object - using 'any' to handle Json type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateDeductions = (deductions: any): number => {
    if (!deductions || typeof deductions !== 'object' || Array.isArray(deductions)) return 0;
    let total = 0;
    for (const key in deductions) {
      const numVal = Number(deductions[key]);
      if (!isNaN(numVal)) total += numVal;
    }
    return total;
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Payroll Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Process salaries, generate payslips, and manage compensation</p>
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
                onClick={handleCreatePayrollRun}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Payroll Run'}
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
            <div className="text-2xl font-bold">{employeesWithSalary?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRuns.length}</div>
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
            <div className="text-2xl font-bold">{pendingRuns}</div>
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
              ) : payrollRuns.length > 0 ? (
                <div className="overflow-x-auto"><Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Employees</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Processed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.run_name}</TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell className="text-right">{run.total_employees || 0}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{(run.total_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {run.processed_at ? format(new Date(run.processed_at), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {run.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePayrollRunStatus.mutate({ id: run.id, status: 'processing' })}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Process
                              </Button>
                            )}
                            {run.status === 'processing' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePayrollRunStatus.mutate({ id: run.id, status: 'completed' })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
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
                </Table></div>
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
              <CardDescription>View individual employee compensation details from payroll records</CardDescription>
            </CardHeader>
            <CardContent>
              {employeesWithSalary && employeesWithSalary.length > 0 ? (
                <div className="overflow-x-auto"><Table>
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
                    {employeesWithSalary.map((emp) => {
                      const allowancesTotal = calculateAllowances(emp.allowances);
                      const deductionsTotal = calculateDeductions(emp.deductions);
                      
                      return (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.full_name}</TableCell>
                          <TableCell>{emp.department || 'General'}</TableCell>
                          <TableCell className="text-right">
                            {emp.basic_salary > 0 ? `₹${emp.basic_salary.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {allowancesTotal > 0 ? `+₹${allowancesTotal.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {deductionsTotal > 0 ? `-₹${deductionsTotal.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {emp.net_salary > 0 ? `₹${emp.net_salary.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table></div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No employee salary records found</p>
                  <p className="text-sm">Create payroll records to see salary data here</p>
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
