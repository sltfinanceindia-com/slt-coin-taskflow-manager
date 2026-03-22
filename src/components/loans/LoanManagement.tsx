import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Wallet, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  IndianRupee,
  Calculator,
  FileText,
  TrendingDown,
  User
} from 'lucide-react';
import { LoanManagementSkeleton, EmptyState } from '@/components/ui/enhanced-skeletons';

const loanTypeConfig = {
  salary_advance: { label: 'Salary Advance', color: 'bg-blue-100 text-blue-800' },
  personal_loan: { label: 'Personal Loan', color: 'bg-purple-100 text-purple-800' },
  emergency_loan: { label: 'Emergency Loan', color: 'bg-red-100 text-red-800' },
  education_loan: { label: 'Education Loan', color: 'bg-green-100 text-green-800' },
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  disbursed: { label: 'Disbursed', color: 'bg-green-100 text-green-800', icon: IndianRupee },
  active: { label: 'Active', color: 'bg-primary/10 text-primary', icon: TrendingDown },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export function LoanManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-loans');
  const [formData, setFormData] = useState({
    loan_type: 'salary_advance',
    amount: '',
    tenure_months: '1',
    reason: '',
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'org_admin';

  // Fetch user's loan requests
  const { data: myLoans, isLoading: loadingMyLoans } = useQuery({
    queryKey: ['my-loans', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .eq('employee_id', profile?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch all loan requests (admin only)
  const { data: allLoans, isLoading: loadingAllLoans } = useQuery({
    queryKey: ['all-loans', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*, employee:profiles!loan_requests_employee_id_fkey(full_name, email)')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id && isAdmin,
  });

  // Create loan request mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const amount = parseFloat(data.amount);
      const tenure = parseInt(data.tenure_months);
      const emiAmount = amount / tenure;
      
      const { error } = await supabase
        .from('loan_requests')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: profile?.id,
          loan_type: data.loan_type,
          amount,
          tenure_months: tenure,
          emi_amount: emiAmount,
          remaining_balance: amount,
          reason: data.reason,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
      setIsCreateOpen(false);
      setFormData({ loan_type: 'salary_advance', amount: '', tenure_months: '1', reason: '' });
      toast({ title: 'Loan request submitted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update loan status mutation (admin)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'approved') {
        updateData.approved_by = profile?.id;
        updateData.approved_at = new Date().toISOString();
      }
      if (status === 'disbursed') {
        updateData.disbursed_at = new Date().toISOString();
        updateData.status = 'active';
      }
      
      const { error } = await supabase
        .from('loan_requests')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
      toast({ title: 'Loan status updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate stats
  const pendingLoans = allLoans?.filter(l => l.status === 'pending').length || 0;
  const activeLoans = allLoans?.filter(l => l.status === 'active').length || 0;
  const totalDisbursed = allLoans?.filter(l => ['active', 'disbursed', 'completed'].includes(l.status))
    .reduce((sum, l) => sum + Number(l.amount), 0) || 0;

  const LoanTable = ({ loans, showEmployee = false }: { loans: any[]; showEmployee?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          {showEmployee && <TableHead>Employee</TableHead>}
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Tenure</TableHead>
          <TableHead className="text-right">EMI</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          {isAdmin && showEmployee && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => {
          const StatusIcon = statusConfig[loan.status as keyof typeof statusConfig]?.icon || Clock;
          return (
            <TableRow key={loan.id}>
              {showEmployee && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{(loan.employee as any)?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{(loan.employee as any)?.email}</p>
                    </div>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <Badge className={loanTypeConfig[loan.loan_type as keyof typeof loanTypeConfig]?.color}>
                  {loanTypeConfig[loan.loan_type as keyof typeof loanTypeConfig]?.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-bold">
                ₹{Number(loan.amount).toLocaleString('en-IN')}
              </TableCell>
              <TableCell>{loan.tenure_months} months</TableCell>
              <TableCell className="text-right">
                ₹{Number(loan.emi_amount).toLocaleString('en-IN')}
              </TableCell>
              <TableCell>
                <Badge className={statusConfig[loan.status as keyof typeof statusConfig]?.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[loan.status as keyof typeof statusConfig]?.label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(loan.created_at), 'MMM dd, yyyy')}
              </TableCell>
              {isAdmin && showEmployee && (
                <TableCell>
                  {loan.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => updateStatusMutation.mutate({ id: loan.id, status: 'approved' })}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => updateStatusMutation.mutate({ id: loan.id, status: 'rejected' })}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {loan.status === 'approved' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: loan.id, status: 'disbursed' })}
                    >
                      Disburse
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Loan & Advance Management
          </h1>
          <p className="text-muted-foreground">Request and manage employee loans</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request Loan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Loan / Advance</DialogTitle>
              <DialogDescription>
                Submit a new loan or salary advance request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Loan Type</Label>
                <Select
                  value={formData.loan_type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, loan_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary_advance">Salary Advance</SelectItem>
                    <SelectItem value="personal_loan">Personal Loan</SelectItem>
                    <SelectItem value="emergency_loan">Emergency Loan</SelectItem>
                    <SelectItem value="education_loan">Education Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter loan amount"
                />
              </div>
              <div>
                <Label>Repayment Tenure (Months)</Label>
                <Select
                  value={formData.tenure_months}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, tenure_months: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 6, 12, 24, 36].map(m => (
                      <SelectItem key={m} value={m.toString()}>{m} month{m > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.amount && formData.tenure_months && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Estimated EMI</span>
                      <span className="font-bold text-lg">
                        ₹{(parseFloat(formData.amount) / parseInt(formData.tenure_months)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why you need this loan..."
                  rows={3}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending || !formData.amount}
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingLoans}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-bold text-green-600">{activeLoans}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Disbursed</p>
                  <p className="text-2xl font-bold">₹{totalDisbursed.toLocaleString('en-IN')}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for My Loans / All Loans */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-loans">My Loans</TabsTrigger>
          {isAdmin && <TabsTrigger value="all-loans">All Requests ({allLoans?.length || 0})</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-loans">
          {loadingMyLoans ? (
            <LoanManagementSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>My Loan Requests</CardTitle>
                <CardDescription>Track your loan and advance requests</CardDescription>
              </CardHeader>
              <CardContent>
                {myLoans && myLoans.length > 0 ? (
                  <LoanTable loans={myLoans} />
                ) : (
                  <EmptyState
                    icon={Wallet}
                    title="No Loan Requests"
                    description="Need financial assistance? Request a salary advance or personal loan. All requests are reviewed within 24-48 hours."
                    action={{
                      label: "Request Loan",
                      onClick: () => setIsCreateOpen(true)
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="all-loans">
            <Card>
              <CardHeader>
                <CardTitle>All Loan Requests</CardTitle>
                <CardDescription>Review and manage employee loan requests</CardDescription>
              </CardHeader>
              <CardContent>
                {allLoans && allLoans.length > 0 ? (
                  <LoanTable loans={allLoans} showEmployee />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No loan requests in your organization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
