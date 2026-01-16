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
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays } from 'date-fns';
import { UserMinus, Plus, CheckCircle, Clock, Calendar, FileText, Trash2, AlertTriangle } from 'lucide-react';

interface ExitRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  resignation_date: string;
  last_working_day: string;
  notice_period_days: number;
  reason: string | null;
  exit_interview_done: boolean;
  clearance_status: number;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'withdrawn';
  created_at: string;
}

export function ExitManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newExit, setNewExit] = useState({
    employee_id: '',
    resignation_date: format(new Date(), 'yyyy-MM-dd'),
    notice_period_days: 30,
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

  const { data: exits, isLoading } = useQuery({
    queryKey: ['exit-requests', profile?.organization_id, filter],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('exit_requests')
        .select(`
          id, employee_id, resignation_date, last_working_day, notice_period_days, reason, exit_interview_done, clearance_status, status, created_at,
          profiles(full_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((e: any) => ({
        ...e,
        employee_name: e.profiles?.full_name,
      })) as ExitRequest[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (exit: typeof newExit) => {
      const { data, error } = await (supabase as any)
        .from('exit_requests')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: exit.employee_id,
          resignation_date: exit.resignation_date,
          last_working_day: format(addDays(new Date(exit.resignation_date), exit.notice_period_days), 'yyyy-MM-dd'),
          notice_period_days: exit.notice_period_days,
          reason: exit.reason,
          status: 'pending',
          clearance_status: 0,
          exit_interview_done: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-requests'] });
      setIsCreateOpen(false);
      setNewExit({ employee_id: '', resignation_date: format(new Date(), 'yyyy-MM-dd'), notice_period_days: 30, reason: '' });
      toast({ title: 'Exit request created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating exit request', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; exit_interview_done?: boolean; clearance_status?: number }) => {
      const { error } = await (supabase as any).from('exit_requests').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-requests'] });
      toast({ title: 'Exit request updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('exit_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-requests'] });
      toast({ title: 'Exit request deleted' });
    },
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>,
      approved: <Badge className="bg-blue-100 text-blue-800">Approved</Badge>,
      in_progress: <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>,
      completed: <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>,
      withdrawn: <Badge variant="outline">Withdrawn</Badge>,
    };
    return badges[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const getDaysRemaining = (lwd: string) => differenceInDays(new Date(lwd), new Date());
  const filteredExits = exits?.filter(e => filter === 'all' || e.status === filter) || [];
  
  const stats = {
    total: exits?.length || 0,
    pending: exits?.filter(e => e.status === 'pending').length || 0,
    inProgress: exits?.filter(e => e.status === 'in_progress').length || 0,
    thisMonth: exits?.filter(e => {
      const lwd = new Date(e.last_working_day);
      const now = new Date();
      return lwd.getMonth() === now.getMonth() && lwd.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><UserMinus className="h-6 w-6 text-primary" />Exit Management</h1>
          <p className="text-muted-foreground">Manage resignations and offboarding</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Exit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Exit Request</DialogTitle><DialogDescription>Process employee resignation</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Employee</Label>
                  <Select value={newExit.employee_id} onValueChange={(v) => setNewExit(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Resignation Date</Label><Input type="date" value={newExit.resignation_date} onChange={(e) => setNewExit(p => ({ ...p, resignation_date: e.target.value }))} /></div>
                <div><Label>Notice Period (Days)</Label>
                  <Select value={String(newExit.notice_period_days)} onValueChange={(v) => setNewExit(p => ({ ...p, notice_period_days: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Reason for Leaving</Label><Textarea placeholder="Reason..." value={newExit.reason} onChange={(e) => setNewExit(p => ({ ...p, reason: e.target.value }))} rows={2} /></div>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="font-medium">Last Working Day: </span>
                  {format(addDays(new Date(newExit.resignation_date), newExit.notice_period_days), 'MMMM dd, yyyy')}
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate(newExit)} disabled={!newExit.employee_id || createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Exit Request'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Exits</CardTitle><UserMinus className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Approval</CardTitle><Clock className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">In Progress</CardTitle><FileText className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.inProgress}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Leaving This Month</CardTitle><Calendar className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.thisMonth}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Exit Requests</CardTitle><CardDescription>All resignation and offboarding requests</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredExits.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Resignation</TableHead><TableHead>LWD</TableHead><TableHead>Clearance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredExits.map((exit) => (
                  <TableRow key={exit.id}>
                    <TableCell>
                      <div className="font-medium">{exit.employee_name}</div>
                      {exit.reason && <div className="text-sm text-muted-foreground line-clamp-1">{exit.reason}</div>}
                    </TableCell>
                    <TableCell>{format(new Date(exit.resignation_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div>{format(new Date(exit.last_working_day), 'MMM dd, yyyy')}</div>
                      {getDaysRemaining(exit.last_working_day) > 0 && exit.status !== 'completed' && (
                        <Badge variant="outline" className="mt-1">{getDaysRemaining(exit.last_working_day)} days left</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="w-24 space-y-1">
                        <div className="text-xs text-right">{exit.clearance_status}%</div>
                        <Progress value={exit.clearance_status} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(exit.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {exit.status === 'pending' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: exit.id, status: 'approved' })}>Approve</Button>}
                        {exit.status === 'approved' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: exit.id, status: 'in_progress' })}>Start</Button>}
                        {exit.status === 'in_progress' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: exit.id, clearance_status: Math.min(100, exit.clearance_status + 25) })}>+25%</Button>
                            {exit.clearance_status >= 100 && <Button size="sm" onClick={() => updateMutation.mutate({ id: exit.id, status: 'completed' })}>Complete</Button>}
                          </>
                        )}
                        {exit.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(exit.id)}><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><UserMinus className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No exit requests found</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
