import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Users, Calculator, DollarSign, Zap } from 'lucide-react';

const DEFAULT_SALARY = 50000;

export function BulkPayrollProcessor() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [payPeriodStart, setPayPeriodStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [payPeriodEnd, setPayPeriodEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data: employees } = useQuery({
    queryKey: ['employees-for-payroll', profile?.organization_id],
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

  const bulkCreateMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      const records = employeeIds.map(empId => ({
        organization_id: profile?.organization_id,
        employee_id: empId,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        basic_salary: DEFAULT_SALARY,
        bonus: 0,
        tax_deduction: DEFAULT_SALARY * 0.1,
        pf_deduction: DEFAULT_SALARY * 0.12,
        net_salary: DEFAULT_SALARY * 0.78,
        created_by: profile?.id,
        payment_status: 'pending',
      }));
      const { error } = await supabase.from('payroll_records').insert(records);
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      setIsOpen(false);
      setSelectedEmployees([]);
      toast({ title: `${count} payroll records created` });
    },
    onError: (error) => {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedEmployees(checked && employees ? employees.map(e => e.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedEmployees(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Zap className="h-4 w-4 mr-2" />Bulk Process</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Payroll Processing</DialogTitle>
          <DialogDescription>Generate payroll for multiple employees</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Period Start</Label><Input type="date" value={payPeriodStart} onChange={(e) => setPayPeriodStart(e.target.value)} /></div>
            <div><Label>Period End</Label><Input type="date" value={payPeriodEnd} onChange={(e) => setPayPeriodEnd(e.target.value)} /></div>
          </div>
          {selectedEmployees.length > 0 && (
            <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{selectedEmployees.length} selected</Badge>
          )}
          <Card>
            <CardContent className="p-0 max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"><Checkbox checked={selectedEmployees.length === employees?.length} onCheckedChange={handleSelectAll} /></TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees?.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell><Checkbox checked={selectedEmployees.includes(emp.id)} onCheckedChange={(c) => handleSelectOne(emp.id, c as boolean)} /></TableCell>
                      <TableCell>{emp.full_name}</TableCell>
                      <TableCell className="text-right">₹{DEFAULT_SALARY.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={() => bulkCreateMutation.mutate(selectedEmployees)} disabled={selectedEmployees.length === 0 || bulkCreateMutation.isPending}>
            <Calculator className="h-4 w-4 mr-2" />{bulkCreateMutation.isPending ? 'Processing...' : `Process ${selectedEmployees.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
