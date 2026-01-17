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
import { Clock, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface OvertimeRequest {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  reason: string;
  status: string;
  approved_by: string | null;
  created_at: string;
  user_profile?: { full_name: string };
}

export function OvertimeManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 2,
    reason: '',
  });

  // Fetch overtime data from time_logs with overtime hours
  const { data: overtimeRequests, isLoading } = useQuery({
    queryKey: ['overtime', profile?.organization_id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('time_logs')
        .select(`
          id, user_id, date_logged, hours_worked, description, created_at
        `)
        .gt('hours_worked', 8)
        .order('date_logged', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set((data || []).map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        date: d.date_logged,
        hours: d.hours_worked - 8, // Overtime is hours beyond 8
        reason: d.description || 'No reason provided',
        status: 'approved', // Time logs are already logged
        approved_by: null,
        created_at: d.created_at,
        user_profile: profileMap.get(d.user_id),
      })) as OvertimeRequest[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('time_logs')
        .insert({
          user_id: profile?.id,
          organization_id: profile?.organization_id,
          date_logged: newRequest.date,
          hours_worked: 8 + newRequest.hours, // Regular + overtime
          description: `Overtime: ${newRequest.reason}`,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
      setIsCreateOpen(false);
      setNewRequest({ date: format(new Date(), 'yyyy-MM-dd'), hours: 2, reason: '' });
      toast({ title: 'Overtime logged successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const totalOvertimeHours = overtimeRequests?.reduce((sum, r) => sum + r.hours, 0) || 0;
  const thisMonthOvertime = overtimeRequests?.filter(r => 
    new Date(r.date).getMonth() === new Date().getMonth()
  ).reduce((sum, r) => sum + r.hours, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Overtime Tracking
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage overtime hours and approvals' : 'Track your overtime hours'}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Log Overtime</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Overtime Hours</DialogTitle>
              <DialogDescription>Record your overtime work</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={newRequest.date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Overtime Hours</Label>
                <Input 
                  type="number" 
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={newRequest.hours}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, hours: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea 
                  placeholder="Explain the overtime work..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => createMutation.mutate()}
                disabled={!newRequest.reason || createMutation.isPending}
              >
                {createMutation.isPending ? 'Logging...' : 'Log Overtime'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOvertimeHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{thisMonthOvertime}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overtimeRequests?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Records</CardTitle>
          <CardDescription>
            {isAdmin ? 'All overtime entries in your organization' : 'Your overtime history'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : overtimeRequests && overtimeRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overtimeRequests.map((record) => (
                  <TableRow key={record.id}>
                    {isAdmin && (
                      <TableCell className="font-medium">
                        {record.user_profile?.full_name || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.hours}h</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.reason}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Logged
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No overtime records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
