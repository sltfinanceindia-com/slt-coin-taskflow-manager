import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Coins, Plus, CheckCircle, Clock, Users, IndianRupee, Trash2, Award } from 'lucide-react';

interface Bonus {
  id: string;
  employee_id: string;
  employee_name?: string;
  bonus_type: 'performance' | 'festival' | 'referral' | 'retention' | 'spot';
  amount: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  payout_date: string | null;
  created_at: string;
}

export function BonusManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newBonus, setNewBonus] = useState({
    employee_id: '',
    bonus_type: 'performance',
    amount: 0,
    reason: '',
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-list', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: bonuses, isLoading } = useQuery({
    queryKey: ['bonuses', profile?.organization_id, filter],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('employee_bonuses')
        .select(`
          id, employee_id, bonus_type, amount, reason, status, payout_date, created_at,
          profiles(full_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((b: any) => ({
        ...b,
        employee_name: b.profiles?.full_name,
      })) as Bonus[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (bonus: typeof newBonus) => {
      const { data, error } = await (supabase as any)
        .from('employee_bonuses')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: bonus.employee_id,
          bonus_type: bonus.bonus_type,
          amount: bonus.amount,
          reason: bonus.reason,
          status: 'pending',
          created_by: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      setIsCreateOpen(false);
      setNewBonus({ employee_id: '', bonus_type: 'performance', amount: 0, reason: '' });
      toast({ title: 'Bonus created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating bonus', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, payout_date }: { id: string; status: string; payout_date?: string }) => {
      const updates: any = { status };
      if (payout_date) updates.payout_date = payout_date;
      const { error } = await (supabase as any).from('employee_bonuses').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      toast({ title: 'Bonus updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('employee_bonuses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      toast({ title: 'Bonus deleted' });
    },
  });

  const getTypeBadge = (type: string) => {
    const badges: Record<string, JSX.Element> = {
      performance: <Badge className="bg-purple-100 text-purple-800"><Award className="h-3 w-3 mr-1" />Performance</Badge>,
      festival: <Badge className="bg-orange-100 text-orange-800">Festival</Badge>,
      referral: <Badge className="bg-blue-100 text-blue-800">Referral</Badge>,
      retention: <Badge className="bg-green-100 text-green-800">Retention</Badge>,
      spot: <Badge className="bg-yellow-100 text-yellow-800">Spot</Badge>,
    };
    return badges[type] || <Badge variant="secondary">{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>,
      approved: <Badge className="bg-blue-100 text-blue-800">Approved</Badge>,
      paid: <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
    };
    return badges[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const filteredBonuses = bonuses?.filter(b => filter === 'all' || b.status === filter) || [];
  
  const stats = {
    total: bonuses?.length || 0,
    pending: bonuses?.filter(b => b.status === 'pending').length || 0,
    approved: bonuses?.filter(b => b.status === 'approved').length || 0,
    totalAmount: bonuses?.filter(b => b.status === 'approved' || b.status === 'paid').reduce((sum, b) => sum + b.amount, 0) || 0,
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Coins className="h-6 w-6 text-primary" />Bonus Management</h1>
          <p className="text-muted-foreground">Manage employee bonuses and incentives</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Bonus</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Bonus</DialogTitle><DialogDescription>Add a new bonus for an employee</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Employee</Label>
                  <Select value={newBonus.employee_id} onValueChange={(v) => setNewBonus(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Bonus Type</Label>
                  <Select value={newBonus.bonus_type} onValueChange={(v) => setNewBonus(p => ({ ...p, bonus_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance Bonus</SelectItem>
                      <SelectItem value="festival">Festival Bonus</SelectItem>
                      <SelectItem value="referral">Referral Bonus</SelectItem>
                      <SelectItem value="retention">Retention Bonus</SelectItem>
                      <SelectItem value="spot">Spot Award</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (₹)</Label><Input type="number" placeholder="50000" value={newBonus.amount || ''} onChange={(e) => setNewBonus(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
                <div><Label>Reason</Label><Textarea placeholder="Reason for bonus..." value={newBonus.reason} onChange={(e) => setNewBonus(p => ({ ...p, reason: e.target.value }))} rows={2} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate(newBonus)} disabled={!newBonus.employee_id || !newBonus.amount || createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Bonus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Bonuses</CardTitle><Coins className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><Clock className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.approved}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Amount</CardTitle><IndianRupee className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Bonuses</CardTitle><CardDescription>Manage employee bonuses and incentives</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredBonuses.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredBonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell className="font-medium">{bonus.employee_name}</TableCell>
                    <TableCell>{getTypeBadge(bonus.bonus_type)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(bonus.amount)}</TableCell>
                    <TableCell><span className="text-sm text-muted-foreground line-clamp-1">{bonus.reason || '-'}</span></TableCell>
                    <TableCell>{getStatusBadge(bonus.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {bonus.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: bonus.id, status: 'approved' })}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: bonus.id, status: 'rejected' })}>Reject</Button>
                          </>
                        )}
                        {bonus.status === 'approved' && <Button size="sm" onClick={() => updateMutation.mutate({ id: bonus.id, status: 'paid', payout_date: new Date().toISOString() })}>Mark Paid</Button>}
                        {bonus.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(bonus.id)}><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><Coins className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No bonuses found</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
