import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock,
  Calculator,
  FileText,
  Download,
  AlertCircle,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'sonner';

interface PayrollRun {
  id: string;
  run_name: string;
  period_start: string;
  period_end: string;
  status: string;
  total_employees: number;
  total_amount: number;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
}

interface PayrollItem {
  id: string;
  employee_id: string;
  base_salary: number;
  overtime_pay: number;
  bonuses: number;
  deductions: number;
  loan_deductions: number;
  tax_amount: number;
  net_pay: number;
  status: string;
  employee?: { full_name: string; email: string };
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

export function AutomatedPayrollProcessor() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [newRunDialog, setNewRunDialog] = useState(false);
  const [runConfig, setRunConfig] = useState({
    name: `Payroll - ${format(new Date(), 'MMMM yyyy')}`,
    periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [processingProgress, setProcessingProgress] = useState(0);

  // Fetch payroll runs
  const { data: payrollRuns, isLoading } = useQuery({
    queryKey: ['payroll-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PayrollRun[];
    }
  });

  // Fetch payroll items for selected run
  const { data: payrollItems } = useQuery({
    queryKey: ['payroll-items', selectedRun?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_items')
        .select(`
          *,
          employee:profiles!payroll_items_employee_id_fkey(full_name, email)
        `)
        .eq('payroll_run_id', selectedRun!.id);
      if (error) throw error;
      return data as PayrollItem[];
    },
    enabled: !!selectedRun?.id
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['employees-for-payroll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true);
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!profile?.organization_id
  });

  // Create new payroll run with salary structure integration
  const createPayrollRun = useMutation({
    mutationFn: async () => {
      if (!employees || employees.length === 0) {
        throw new Error('No employees found');
      }

      // Create payroll run
      const { data: run, error: runError } = await supabase
        .from('payroll_runs')
        .insert({
          organization_id: profile?.organization_id,
          run_name: runConfig.name,
          period_start: runConfig.periodStart,
          period_end: runConfig.periodEnd,
          total_employees: employees.length,
          status: 'pending'
        })
        .select()
        .single();

      if (runError) throw runError;

      // Fetch salary structures for all employees
      const { data: salaryData } = await supabase
        .from('salary_structures')
        .select('employee_id, gross_salary, total_deductions, net_salary, pf_contribution, esi_contribution, professional_tax')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true);

      const salaryMap = new Map(
        (salaryData || []).map(s => [s.employee_id, s])
      );

      // Fetch active loan balances for deductions
      const { data: loanData } = await supabase
        .from('loan_requests')
        .select('employee_id, emi_amount')
        .eq('organization_id', profile?.organization_id)
        .eq('status', 'approved');

      const loanMap = new Map<string, number>();
      (loanData || []).forEach(l => {
        loanMap.set(l.employee_id, (loanMap.get(l.employee_id) || 0) + (l.emi_amount || 0));
      });

      // Create payroll items with salary data pre-filled
      const items = employees.map(emp => {
        const salary = salaryMap.get(emp.id);
        const loanDeduction = loanMap.get(emp.id) || 0;
        const baseSalary = salary?.gross_salary || 0;
        const deductions = salary?.total_deductions || 0;
        const taxAmount = salary?.professional_tax || 0;
        const netPay = baseSalary - deductions - loanDeduction;

        return {
          payroll_run_id: run.id,
          employee_id: emp.id,
          organization_id: profile?.organization_id,
          base_salary: baseSalary,
          overtime_pay: 0,
          bonuses: 0,
          deductions: deductions,
          loan_deductions: loanDeduction,
          tax_amount: taxAmount,
          net_pay: Math.max(0, netPay),
          status: 'pending'
        };
      });

      const { error: itemsError } = await supabase
        .from('payroll_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return run;
    },
    onSuccess: (run) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      setSelectedRun(run);
      setNewRunDialog(false);
      toast.success('Payroll run created successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  // Process payroll run
  const processPayrollRun = useMutation({
    mutationFn: async (runId: string) => {
      // Update status to processing
      await supabase
        .from('payroll_runs')
        .update({ status: 'processing' })
        .eq('id', runId);

      // Simulate processing with progress
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Calculate totals from items
      const { data: items } = await supabase
        .from('payroll_items')
        .select('net_pay')
        .eq('payroll_run_id', runId);

      const totalAmount = items?.reduce((sum, item) => sum + (item.net_pay || 0), 0) || 0;

      // Update all items to processed
      await supabase
        .from('payroll_items')
        .update({ status: 'processed' })
        .eq('payroll_run_id', runId);

      // Complete the run
      const { error } = await supabase
        .from('payroll_runs')
        .update({ 
          status: 'completed',
          total_amount: totalAmount,
          processed_by: profile?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', runId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-items'] });
      setProcessingProgress(0);
      toast.success('Payroll processed successfully');
    },
    onError: () => {
      setProcessingProgress(0);
      toast.error('Failed to process payroll');
    }
  });

  // Update payroll item
  const updatePayrollItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PayrollItem> }) => {
      // Calculate net pay
      const netPay = (updates.base_salary || 0) + 
                     (updates.overtime_pay || 0) + 
                     (updates.bonuses || 0) - 
                     (updates.deductions || 0) - 
                     (updates.loan_deductions || 0) - 
                     (updates.tax_amount || 0);

      const { error } = await supabase
        .from('payroll_items')
        .update({ ...updates, net_pay: netPay })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-items'] });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const stats = {
    totalRuns: payrollRuns?.length || 0,
    completedRuns: payrollRuns?.filter(r => r.status === 'completed').length || 0,
    totalDisbursed: payrollRuns?.filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
    pendingAmount: payrollItems?.filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + (i.net_pay || 0), 0) || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automated Payroll</h2>
          <p className="text-muted-foreground">Process employee salaries efficiently</p>
        </div>
        <Dialog open={newRunDialog} onOpenChange={setNewRunDialog}>
          <DialogTrigger asChild>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              New Payroll Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payroll Run</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Run Name</Label>
                <Input
                  value={runConfig.name}
                  onChange={(e) => setRunConfig({ ...runConfig, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period Start</Label>
                  <Input
                    type="date"
                    value={runConfig.periodStart}
                    onChange={(e) => setRunConfig({ ...runConfig, periodStart: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Period End</Label>
                  <Input
                    type="date"
                    value={runConfig.periodEnd}
                    onChange={(e) => setRunConfig({ ...runConfig, periodEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium">Summary</p>
                <p className="text-muted-foreground">{employees?.length || 0} employees will be included</p>
              </div>
              <Button 
                onClick={() => createPayrollRun.mutate()} 
                disabled={createPayrollRun.isPending}
                className="w-full"
              >
                Create Payroll Run
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRuns}</p>
                <p className="text-sm text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedRuns}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{stats.totalDisbursed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Disbursed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Progress */}
      {processingProgress > 0 && processingProgress < 100 && (
        <Card className="card-gradient border-primary/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Processing Payroll...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="details">Run Details</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          {isLoading ? (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">Loading payroll runs...</div>
              </CardContent>
            </Card>
          ) : payrollRuns?.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Payroll Runs Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first payroll run to get started</p>
                <Button onClick={() => setNewRunDialog(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Create First Run
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-gradient">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run Name</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns?.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.run_name}</TableCell>
                        <TableCell>
                          {format(parseISO(run.period_start), 'MMM d')} - {format(parseISO(run.period_end), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{run.total_employees}</TableCell>
                        <TableCell>₹{(run.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedRun(run)}
                            >
                              View
                            </Button>
                            {run.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => processPayrollRun.mutate(run.id)}
                                disabled={processPayrollRun.isPending}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Process
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedRun ? (
            <Card className="card-gradient">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedRun.run_name}</CardTitle>
                    <CardDescription>
                      {format(parseISO(selectedRun.period_start), 'MMMM d')} - {format(parseISO(selectedRun.period_end), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(selectedRun.status)}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Bonuses</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.employee?.full_name}</TableCell>
                        <TableCell>
                          {selectedRun.status === 'pending' ? (
                            <Input
                              type="number"
                              value={item.base_salary}
                              onChange={(e) => updatePayrollItem.mutate({
                                id: item.id,
                                updates: { base_salary: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-24"
                            />
                          ) : (
                            `₹${item.base_salary.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedRun.status === 'pending' ? (
                            <Input
                              type="number"
                              value={item.overtime_pay}
                              onChange={(e) => updatePayrollItem.mutate({
                                id: item.id,
                                updates: { overtime_pay: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-20"
                            />
                          ) : (
                            `₹${item.overtime_pay.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedRun.status === 'pending' ? (
                            <Input
                              type="number"
                              value={item.bonuses}
                              onChange={(e) => updatePayrollItem.mutate({
                                id: item.id,
                                updates: { bonuses: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-20"
                            />
                          ) : (
                            `₹${item.bonuses.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedRun.status === 'pending' ? (
                            <Input
                              type="number"
                              value={item.deductions + item.loan_deductions}
                              onChange={(e) => updatePayrollItem.mutate({
                                id: item.id,
                                updates: { deductions: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-20"
                            />
                          ) : (
                            `₹${(item.deductions + item.loan_deductions).toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedRun.status === 'pending' ? (
                            <Input
                              type="number"
                              value={item.tax_amount}
                              onChange={(e) => updatePayrollItem.mutate({
                                id: item.id,
                                updates: { tax_amount: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-20"
                            />
                          ) : (
                            `₹${item.tax_amount.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          ₹{item.net_pay.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {selectedRun.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => processPayrollRun.mutate(selectedRun.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Process Payroll
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold">No Run Selected</h3>
                <p className="text-muted-foreground">Select a payroll run from the Runs tab to view details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
