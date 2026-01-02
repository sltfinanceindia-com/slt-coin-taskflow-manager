import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Expense {
  id: string;
  claim_number: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  status: string;
  employee?: { full_name: string };
}

interface BulkExpenseApprovalProps {
  expenses: Expense[];
}

export function BulkExpenseApproval({ expenses }: BulkExpenseApprovalProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');

  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status, notes }: { ids: string[]; status: string; notes: string }) => {
      const { error } = await supabase
        .from('expense_claims')
        .update({
          status,
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null,
        })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      setSelectedIds([]);
      setIsConfirmOpen(false);
      setNotes('');
      toast({ 
        title: `${selectedIds.length} expense(s) ${action === 'approve' ? 'approved' : 'rejected'}` 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Bulk action failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingExpenses.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleBulkAction = (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setIsConfirmOpen(true);
  };

  const confirmAction = () => {
    bulkUpdateMutation.mutate({
      ids: selectedIds,
      status: action === 'approve' ? 'approved' : 'rejected',
      notes,
    });
  };

  const selectedTotal = pendingExpenses
    .filter(e => selectedIds.includes(e.id))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  if (pendingExpenses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Select multiple expenses for bulk approval or rejection
            </CardDescription>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-3 w-3" />
                ₹{selectedTotal.toLocaleString()}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                className="text-green-600 hover:text-green-700"
                onClick={() => handleBulkAction('approve')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve ({selectedIds.length})
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleBulkAction('reject')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === pendingExpenses.length && pendingExpenses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Claim #</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingExpenses.map((expense) => (
              <TableRow 
                key={expense.id}
                className={selectedIds.includes(expense.id) ? 'bg-muted/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(expense.id)}
                    onCheckedChange={(checked) => handleSelectOne(expense.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">{expense.claim_number}</TableCell>
                <TableCell>{expense.employee?.full_name}</TableCell>
                <TableCell className="font-medium">{expense.title}</TableCell>
                <TableCell className="capitalize">{expense.category}</TableCell>
                <TableCell>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-right font-bold">₹{Number(expense.amount).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} {selectedIds.length} Expense(s)
            </DialogTitle>
            <DialogDescription>
              Total amount: ₹{selectedTotal.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Add notes for this ${action}...`}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? 'Processing...' : `Confirm ${action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
