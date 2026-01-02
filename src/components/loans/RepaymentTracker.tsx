import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, addMonths } from 'date-fns';
import { 
  Calculator, 
  Calendar, 
  CheckCircle, 
  Clock, 
  IndianRupee,
  TrendingDown,
  Plus
} from 'lucide-react';

interface Loan {
  id: string;
  amount: number;
  tenure_months: number;
  emi_amount: number;
  remaining_balance: number;
  disbursed_at: string;
  interest_rate?: number;
  status: string;
}

interface Repayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  notes?: string;
}

interface RepaymentTrackerProps {
  loan: Loan;
}

export function RepaymentTracker({ loan }: RepaymentTrackerProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(loan.emi_amount.toString());

  // Fetch repayments for this loan
  const { data: repayments, isLoading } = useQuery({
    queryKey: ['loan-repayments', loan.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('loan_id', loan.id)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Repayment[];
    }
  });

  // Add repayment mutation
  const addRepayment = useMutation({
    mutationFn: async (amount: number) => {
      const { error } = await supabase
        .from('loan_repayments')
        .insert({
          loan_id: loan.id,
          organization_id: profile?.organization_id,
          employee_id: profile?.id,
          amount,
          payment_date: new Date().toISOString(),
          payment_method: 'salary_deduction',
          status: 'completed'
        });

      if (error) throw error;

      // Update loan remaining balance
      const newBalance = Math.max(0, loan.remaining_balance - amount);
      await supabase
        .from('loan_requests')
        .update({ 
          remaining_balance: newBalance,
          status: newBalance <= 0 ? 'completed' : 'active'
        })
        .eq('id', loan.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-repayments'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
      setIsAddOpen(false);
      toast({ title: 'Repayment recorded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Calculate stats
  const totalPaid = repayments?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  const progressPercentage = (totalPaid / loan.amount) * 100;
  const remainingEmis = Math.ceil(loan.remaining_balance / loan.emi_amount);

  // Generate EMI schedule
  const generateEmiSchedule = () => {
    const schedule = [];
    const disbursedDate = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date();
    
    for (let i = 1; i <= loan.tenure_months; i++) {
      const dueDate = addMonths(disbursedDate, i);
      const paidRepayment = repayments?.find(r => {
        const paymentMonth = format(new Date(r.payment_date), 'yyyy-MM');
        const dueMonth = format(dueDate, 'yyyy-MM');
        return paymentMonth === dueMonth;
      });

      schedule.push({
        month: i,
        dueDate,
        amount: loan.emi_amount,
        status: paidRepayment ? 'paid' : (dueDate < new Date() ? 'overdue' : 'upcoming'),
        paidAmount: paidRepayment?.amount
      });
    }
    return schedule;
  };

  const emiSchedule = generateEmiSchedule();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loan Amount</p>
                <p className="text-lg font-bold">₹{loan.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-lg font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-lg font-bold text-amber-600">₹{loan.remaining_balance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EMIs Left</p>
                <p className="text-lg font-bold text-blue-600">{remainingEmis}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Repayment Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹{totalPaid.toLocaleString('en-IN')} paid</span>
              <span>₹{loan.remaining_balance.toLocaleString('en-IN')} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EMI Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">EMI Schedule</CardTitle>
            <CardDescription>Monthly repayment schedule</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={loan.status === 'completed'}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Repayment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Payment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Standard EMI: ₹{loan.emi_amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => addRepayment.mutate(parseFloat(paymentAmount))}
                  disabled={addRepayment.isPending || !paymentAmount}
                >
                  {addRepayment.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EMI #</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emiSchedule.slice(0, 12).map((emi) => (
                <TableRow key={emi.month}>
                  <TableCell className="font-medium">{emi.month}</TableCell>
                  <TableCell>{format(emi.dueDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    ₹{emi.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    {emi.status === 'paid' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : emi.status === 'overdue' ? (
                      <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Interest Calculator Component
interface InterestCalculatorProps {
  principal: number;
  tenure: number;
  rate?: number;
}

export function InterestCalculator({ principal, tenure, rate = 0 }: InterestCalculatorProps) {
  const monthlyRate = rate / 12 / 100;
  
  // EMI calculation with compound interest (if rate > 0)
  let emi: number;
  let totalInterest: number;
  
  if (rate > 0) {
    emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
          (Math.pow(1 + monthlyRate, tenure) - 1);
    totalInterest = (emi * tenure) - principal;
  } else {
    emi = principal / tenure;
    totalInterest = 0;
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">EMI Breakdown</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Monthly EMI</p>
            <p className="text-lg font-bold">₹{Math.round(emi).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="text-lg font-bold text-amber-600">₹{Math.round(totalInterest).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Payable</p>
            <p className="text-lg font-bold">₹{Math.round(principal + totalInterest).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
