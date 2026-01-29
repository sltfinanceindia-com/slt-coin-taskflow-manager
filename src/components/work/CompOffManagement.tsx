import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarDays, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

export function CompOffManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    worked_date: format(new Date(), 'yyyy-MM-dd'),
    requested_date: '',
    reason: '',
  });

  // Fetch the Comp-Off leave type
  const { data: compOffLeaveType } = useQuery({
    queryKey: ['comp-off-leave-type', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('id, name')
        .eq('organization_id', profile?.organization_id)
        .or('name.ilike.%comp-off%,name.ilike.%comp off%,name.ilike.%compensatory%')
        .limit(1)
        .single();

      if (error) {
        console.error('Comp-Off leave type not found:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Use leave_requests table with type 'comp_off'
  const { data: compOffRequests, isLoading } = useQuery({
    queryKey: ['comp-off', profile?.organization_id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('leave_requests')
        .select(`
          id, employee_id, start_date, end_date, reason, status, created_at, total_days
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      // Filter by leave_type_id if available, otherwise fall back to reason text
      if (compOffLeaveType?.id) {
        query = query.eq('leave_type_id', compOffLeaveType.id);
      } else {
        query = query.ilike('reason', '%comp%off%');
      }

      if (!isAdmin) {
        query = query.eq('employee_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set((data || []).map(d => d.employee_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (data || []).map(d => ({
        ...d,
        user_profile: profileMap.get(d.employee_id),
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!compOffLeaveType) {
        throw new Error('Comp-Off leave type not configured. Please contact your administrator.');
      }

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: profile?.id,
          organization_id: profile?.organization_id,
          leave_type_id: compOffLeaveType.id,
          start_date: newRequest.requested_date,
          end_date: newRequest.requested_date,
          total_days: 1, // Required field
          reason: `Comp-Off for working on ${newRequest.worked_date}: ${newRequest.reason}`,
          status: 'pending',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comp-off'] });
      setIsCreateOpen(false);
      setNewRequest({ worked_date: format(new Date(), 'yyyy-MM-dd'), requested_date: '', reason: '' });
      toast({ title: 'Comp-off request submitted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status, approved_by: profile?.id, approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comp-off'] });
      toast({ title: 'Request updated' });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const pendingCount = compOffRequests?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = compOffRequests?.filter(r => r.status === 'approved').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Comp-Off Management
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage compensatory off requests' : 'Request time off for extra work'}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Request Comp-Off</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Comp-Off</DialogTitle>
              <DialogDescription>Request time off for overtime/holiday work</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Date Worked (Overtime/Holiday)</Label>
                <Input 
                  type="date" 
                  value={newRequest.worked_date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, worked_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Requested Off Date</Label>
                <Input 
                  type="date" 
                  value={newRequest.requested_date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, requested_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea 
                  placeholder="Describe the work done..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => createMutation.mutate()}
                disabled={!newRequest.requested_date || !newRequest.reason || createMutation.isPending}
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compOffRequests?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comp-Off Requests</CardTitle>
          <CardDescription>View and manage compensatory time off</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : compOffRequests && compOffRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Off Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {compOffRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    {isAdmin && (
                      <TableCell className="font-medium">
                        {request.user_profile?.full_name || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell>{format(new Date(request.start_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'approved' })}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'rejected' })}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comp-off requests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
