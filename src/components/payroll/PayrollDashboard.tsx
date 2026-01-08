import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PayrollApprovalActions } from './PayrollApprovalActions';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Download, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export function PayrollDashboard() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    employee_id: '',
    pay_period_start: '',
    pay_period_end: '',
    basic_salary: '',
    bonus: '0',
    tax_deduction: '0',
    pf_deduction: '0',
  });

  // Fetch payroll records
  const { data: payrollRecords, isLoading } = useQuery({
    queryKey: ['payroll-records', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_records')
        .select(`
          *,
          employee:profiles!payroll_records_employee_id_fkey(id, full_name, email)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ['payroll-employees', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Create payroll record mutation
  const createPayrollMutation = useMutation({
    mutationFn: async (record: typeof newRecord) => {
      const basicSalary = parseFloat(record.basic_salary) || 0;
      const bonus = parseFloat(record.bonus) || 0;
      const taxDeduction = parseFloat(record.tax_deduction) || 0;
      const pfDeduction = parseFloat(record.pf_deduction) || 0;
      const netSalary = basicSalary + bonus - taxDeduction - pfDeduction;

      const { data, error } = await supabase
        .from('payroll_records')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: record.employee_id,
          pay_period_start: record.pay_period_start,
          pay_period_end: record.pay_period_end,
          basic_salary: basicSalary,
          bonus: bonus,
          tax_deduction: taxDeduction,
          pf_deduction: pfDeduction,
          net_salary: netSalary,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      setIsCreateOpen(false);
      setNewRecord({
        employee_id: '',
        pay_period_start: '',
        pay_period_end: '',
        basic_salary: '',
        bonus: '0',
        tax_deduction: '0',
        pf_deduction: '0',
      });
      toast({ title: 'Payroll record created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating payroll record', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate summary stats
  const totalPayroll = payrollRecords?.reduce((sum, r) => sum + (Number(r.net_salary) || 0), 0) || 0;
  const paidCount = payrollRecords?.filter(r => r.payment_status === 'paid').length || 0;
  const pendingCount = payrollRecords?.filter(r => r.payment_status === 'pending').length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee salaries and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payroll Record</DialogTitle>
                <DialogDescription>Add a new payroll entry for an employee</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Employee</Label>
                  <Select 
                    value={newRecord.employee_id} 
                    onValueChange={(v) => setNewRecord(prev => ({ ...prev, employee_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Period Start</Label>
                    <Input 
                      type="date" 
                      value={newRecord.pay_period_start}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, pay_period_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Period End</Label>
                    <Input 
                      type="date" 
                      value={newRecord.pay_period_end}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, pay_period_end: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Basic Salary (₹)</Label>
                  <Input 
                    type="number" 
                    value={newRecord.basic_salary}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, basic_salary: e.target.value }))}
                    placeholder="Enter basic salary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bonus (₹)</Label>
                    <Input 
                      type="number" 
                      value={newRecord.bonus}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, bonus: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Tax Deduction (₹)</Label>
                    <Input 
                      type="number" 
                      value={newRecord.tax_deduction}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, tax_deduction: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>PF Deduction (₹)</Label>
                  <Input 
                    type="number" 
                    value={newRecord.pf_deduction}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, pf_deduction: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createPayrollMutation.mutate(newRecord)}
                  disabled={createPayrollMutation.isPending}
                >
                  {createPayrollMutation.isPending ? 'Creating...' : 'Create Payroll Record'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
            <p className="text-xs text-muted-foreground">Payments completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>View and manage employee payroll</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payrollRecords && payrollRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Bonus</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {(record.employee as any)?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">₹{Number(record.basic_salary).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">+₹{Number(record.bonus).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">
                        -₹{(Number(record.tax_deduction) + Number(record.pf_deduction)).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold">₹{Number(record.net_salary).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
                      <TableCell className="text-right">
                        <PayrollApprovalActions 
                          record={record} 
                          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['payroll-records'] })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payroll records found</p>
              <p className="text-sm">Create your first payroll entry to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
