import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, CreditCard, Loader2, DollarSign, Calendar, User } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  bonus: number;
  allowances?: Record<string, number> | unknown;
  tax_deduction: number;
  pf_deduction: number;
  other_deductions?: number;
  net_salary: number;
  payment_status: string;
  payment_date?: string | null;
  transaction_reference?: string | null;
  employee?: { full_name: string; email: string } | unknown;
}

interface PayrollApprovalActionsProps {
  record: PayrollRecord;
  onSuccess?: () => void;
}

export function PayrollApprovalActions({ record, onSuccess }: PayrollApprovalActionsProps) {
  const queryClient = useQueryClient();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Approve payroll mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('payroll_records')
        .update({ 
          payment_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      onSuccess?.();
      toast({ title: 'Payroll approved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error approving payroll', description: error.message, variant: 'destructive' });
    },
  });

  // Reject payroll mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const { error } = await supabase
        .from('payroll_records')
        .update({ 
          payment_status: 'rejected',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      setIsRejectOpen(false);
      setRejectionReason('');
      toast({ title: 'Payroll rejected' });
    },
    onError: (error) => {
      toast({ title: 'Error rejecting payroll', description: error.message, variant: 'destructive' });
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('payroll_records')
        .update({ 
          payment_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      toast({ title: 'Payment processing started' });
    },
    onError: (error) => {
      toast({ title: 'Error processing payment', description: error.message, variant: 'destructive' });
    },
  });

  // Mark as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async (txRef: string) => {
      const { error } = await supabase
        .from('payroll_records')
        .update({ 
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          transaction_reference: txRef,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      setIsProcessOpen(false);
      setTransactionRef('');
      toast({ title: 'Payment marked as completed' });
    },
    onError: (error) => {
      toast({ title: 'Error completing payment', description: error.message, variant: 'destructive' });
    },
  });

  const isLoading = approveMutation.isPending || rejectMutation.isPending || 
                    processPaymentMutation.isPending || markPaidMutation.isPending;

  const allowancesObj = record.allowances && typeof record.allowances === 'object' && !Array.isArray(record.allowances)
    ? record.allowances as Record<string, number>
    : null;
  const totalAllowances = allowancesObj 
    ? Object.values(allowancesObj).reduce((sum, val) => sum + (Number(val) || 0), 0)
    : 0;
  const totalDeductions = Number(record.tax_deduction) + Number(record.pf_deduction) + Number(record.other_deductions || 0);
  const employeeData = record.employee && typeof record.employee === 'object' 
    ? record.employee as { full_name?: string; email?: string }
    : null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setIsViewOpen(true)}>
          <Eye className="h-4 w-4" />
        </Button>

        {record.payment_status === 'pending' && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => approveMutation.mutate()}
              disabled={isLoading}
            >
              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsRejectOpen(true)}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}

        {record.payment_status === 'approved' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => processPaymentMutation.mutate()}
            disabled={isLoading}
          >
            {processPaymentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CreditCard className="h-4 w-4 mr-1" />}
            Process
          </Button>
        )}

        {record.payment_status === 'processing' && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsProcessOpen(true)}
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Details
            </DialogTitle>
            <DialogDescription>
              {employeeData?.full_name || 'Employee'} - {format(new Date(record.pay_period_start), 'MMM d')} to {format(new Date(record.pay_period_end), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{employeeData?.full_name || 'Employee'}</p>
                <p className="text-sm text-muted-foreground">{employeeData?.email || ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Pay Period</p>
                <p className="font-medium">
                  {format(new Date(record.pay_period_start), 'MMM d')} - {format(new Date(record.pay_period_end), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Earnings</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span>₹{Number(record.basic_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bonus</span>
                  <span className="text-green-600">+₹{Number(record.bonus).toLocaleString()}</span>
                </div>
                {allowancesObj && Object.entries(allowancesObj).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-green-600">+₹{Number(value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Deductions</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-red-600">-₹{Number(record.tax_deduction).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provident Fund</span>
                  <span className="text-red-600">-₹{Number(record.pf_deduction).toLocaleString()}</span>
                </div>
                {Number(record.other_deductions) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other Deductions</span>
                    <span className="text-red-600">-₹{Number(record.other_deductions).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="font-semibold">Net Salary</span>
              <span className="text-xl font-bold text-primary">₹{Number(record.net_salary).toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={
                record.payment_status === 'paid' ? 'default' :
                record.payment_status === 'approved' ? 'secondary' :
                record.payment_status === 'processing' ? 'outline' :
                record.payment_status === 'rejected' ? 'destructive' :
                'outline'
              }>
                {record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)}
              </Badge>
            </div>

            {record.payment_date && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Date</span>
                <span>{format(new Date(record.payment_date), 'MMM d, yyyy')}</span>
              </div>
            )}

            {record.transaction_reference && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Ref</span>
                <span className="font-mono text-xs">{record.transaction_reference}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payroll</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payroll record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => rejectMutation.mutate(rejectionReason)}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Payment Dialog */}
      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Enter the transaction reference to mark this payment as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="txRef">Transaction Reference</Label>
              <Input
                id="txRef"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g., TXN12345678"
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-bold">₹{Number(record.net_salary).toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => markPaidMutation.mutate(transactionRef)}
              disabled={markPaidMutation.isPending || !transactionRef}
            >
              {markPaidMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
