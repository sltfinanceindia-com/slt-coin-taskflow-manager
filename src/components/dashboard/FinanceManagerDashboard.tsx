/**
 * Finance Manager Dashboard
 * Shows finance-specific widgets: Payroll Status, Expenses, Loans, Budget
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, CreditCard, FileCheck, ArrowRight,
  TrendingUp, Receipt, Wallet, Calculator
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export function FinanceManagerDashboard() {
  const { profile } = useAuth();

  // Fetch payroll records for current month
  const { data: payrollRecords = [] } = useQuery({
    queryKey: ['finance-payroll', profile?.organization_id],
    queryFn: async () => {
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .gte('pay_period_start', monthStart)
        .lte('pay_period_start', monthEnd);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch pending expense claims
  const { data: pendingExpenses = [] } = useQuery({
    queryKey: ['finance-expenses', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_claims')
        .select('*, profiles:employee_id(full_name)')
        .eq('organization_id', profile?.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch loan requests
  const { data: loanRequests = [] } = useQuery({
    queryKey: ['finance-loans', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*, profiles:employee_id(full_name)')
        .eq('organization_id', profile?.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate totals
  const totalPayroll = payrollRecords.reduce((sum, r) => sum + (r.net_salary || 0), 0);
  const totalPendingExpenses = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPendingLoans = loanRequests.reduce((sum, l) => sum + (l.amount || 0), 0);

  const navigateToTab = (tab: string) => {
    const event = new CustomEvent('navigate-to-tab', { detail: { tab } });
    window.dispatchEvent(event);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold">Finance Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Manage payroll, expenses, and financial operations
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayroll)}</p>
                <p className="text-xs text-muted-foreground">
                  {payrollRecords.length} records
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPendingExpenses)}</p>
                <p className="text-xs text-muted-foreground">
                  {pendingExpenses.length} claims
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Loan Requests</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPendingLoans)}</p>
                <p className="text-xs text-muted-foreground">
                  {loanRequests.length} pending
                </p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Wallet className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">
                  {pendingExpenses.length + loanRequests.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Approvals needed
                </p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10">
                <FileCheck className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('payroll')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Calculator className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Process Payroll</p>
              <p className="text-sm text-muted-foreground">Run monthly payroll</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('expenses')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Receipt className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="font-medium">Expense Claims</p>
              <p className="text-sm text-muted-foreground">{pendingExpenses.length} pending</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('loans')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Wallet className="h-5 w-5 text-info" />
            <div className="flex-1">
              <p className="font-medium">Loan Requests</p>
              <p className="text-sm text-muted-foreground">{loanRequests.length} pending</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Pending Expense Claims */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pending Expense Claims
            {pendingExpenses.length > 0 && (
              <Badge variant="destructive">{pendingExpenses.length}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('expenses')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {pendingExpenses.length > 0 ? (
            <div className="space-y-3">
              {pendingExpenses.slice(0, 5).map((expense: any) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{expense.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • {expense.description?.slice(0, 50)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(expense.amount || 0)}</p>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No pending expense claims
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pending Loan Requests */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pending Loan Requests
            {loanRequests.length > 0 && (
              <Badge variant="destructive">{loanRequests.length}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('loans')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loanRequests.length > 0 ? (
            <div className="space-y-3">
              {loanRequests.slice(0, 5).map((loan: any) => (
                <div 
                  key={loan.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{loan.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.loan_type} • {loan.tenure_months} months
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(loan.amount || 0)}</p>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No pending loan requests
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
