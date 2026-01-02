import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Receipt, 
  Plus, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  TrendingUp,
  Upload,
  ListChecks
} from 'lucide-react';
import { ReceiptUpload } from './ReceiptUpload';
import { BulkExpenseApproval } from './BulkExpenseApproval';

const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'supplies', label: 'Office Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'training', label: 'Training & Education' },
  { value: 'other', label: 'Other' },
];

export function ExpenseManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch expense claims
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expense-claims', profile?.organization_id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('expense_claims')
        .select(`
          *,
          employee:profiles!expense_claims_employee_id_fkey(id, full_name, email),
          reviewer:profiles!expense_claims_reviewed_by_fkey(id, full_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('employee_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: typeof newExpense) => {
      const { data, error } = await supabase
        .from('expense_claims')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: profile?.id,
          title: expense.title,
          description: expense.description,
          category: expense.category,
          amount: parseFloat(expense.amount),
          expense_date: expense.expense_date,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      setIsCreateOpen(false);
      setNewExpense({
        title: '',
        description: '',
        category: '',
        amount: '',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
      });
      toast({ title: 'Expense claim submitted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error submitting expense', description: error.message, variant: 'destructive' });
    },
  });

  // Approve/Reject expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('expense_claims')
        .update({
          status,
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      toast({ title: 'Expense claim updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating expense', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate summary stats
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const approvedExpenses = expenses?.filter(e => e.status === 'approved').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const pendingCount = expenses?.filter(e => e.status === 'pending').length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30"><DollarSign className="h-3 w-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Review and approve expense claims' : 'Submit and track your expense claims'}
          </p>
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
                New Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Expense Claim</DialogTitle>
                <DialogDescription>Enter your expense details for reimbursement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={newExpense.title}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Client meeting lunch"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(v) => setNewExpense(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Expense Date</Label>
                    <Input 
                      type="date" 
                      value={newExpense.expense_date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide details about this expense..."
                    rows={3}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createExpenseMutation.mutate(newExpense)}
                  disabled={createExpenseMutation.isPending || !newExpense.title || !newExpense.category || !newExpense.amount}
                >
                  {createExpenseMutation.isPending ? 'Submitting...' : 'Submit Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{expenses?.length || 0} claims submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{approvedExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Claims with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Claims</CardTitle>
          <CardDescription>
            {isAdmin ? 'Review and manage expense claims from employees' : 'Track your submitted expense claims'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list">All Claims</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="bulk" className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  Bulk Approval
                </TabsTrigger>
              )}
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Receipt
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : expenses && expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claim #</TableHead>
                        {isAdmin && <TableHead>Employee</TableHead>}
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-mono text-sm">{expense.claim_number}</TableCell>
                          {isAdmin && (
                            <TableCell>{(expense.employee as any)?.full_name}</TableCell>
                          )}
                          <TableCell className="font-medium">{expense.title}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-right font-bold">₹{Number(expense.amount).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(expense.status)}</TableCell>
                          {isAdmin && expense.status === 'pending' && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-green-600 hover:text-green-700"
                                  onClick={() => updateExpenseMutation.mutate({ id: expense.id, status: 'approved' })}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-red-600 hover:text-red-700"
                                  onClick={() => updateExpenseMutation.mutate({ id: expense.id, status: 'rejected' })}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                          {isAdmin && expense.status !== 'pending' && <TableCell>-</TableCell>}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expense claims found</p>
                  <p className="text-sm">Submit your first expense to get started</p>
                </div>
              )}
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="bulk">
                <BulkExpenseApproval expenses={(expenses || []).map(e => ({
                  id: e.id,
                  claim_number: e.claim_number || '',
                  title: e.title,
                  category: e.category,
                  amount: Number(e.amount),
                  expense_date: e.expense_date,
                  status: e.status,
                  employee: e.employee as any
                }))} />
              </TabsContent>
            )}
            
            <TabsContent value="upload">
              <ReceiptUpload 
                onUpload={(urls) => {
                  toast({ title: 'Receipt uploaded', description: 'You can now attach it to an expense claim' });
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
