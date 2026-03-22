import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Plus, ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useShiftSwaps } from '@/hooks/useShiftSwaps';

export function ShiftSwapManagement() {
  const { profile } = useAuth();
  const { shiftSwaps, isLoading, createShiftSwap, approveShiftSwap, rejectShiftSwap, isCreating } = useShiftSwaps();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    target_id: '',
    original_shift: '',
    requested_shift: '',
    swap_date: format(new Date(), 'yyyy-MM-dd'),
    reason: ''
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-shift-swap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .neq('id', profile?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });

  const handleSubmit = async () => {
    if (!formData.target_id || !formData.original_shift || !formData.requested_shift) return;
    
    await createShiftSwap({
      target_id: formData.target_id,
      requester_id: profile?.id || '',
      original_shift: formData.original_shift,
      requested_shift: formData.requested_shift,
      swap_date: formData.swap_date,
      reason: formData.reason || null,
    });
    
    setIsDialogOpen(false);
    setFormData({ target_id: '', original_shift: '', requested_shift: '', swap_date: format(new Date(), 'yyyy-MM-dd'), reason: '' });
  };

  const handleApprove = (id: string) => {
    approveShiftSwap(id);
  };

  const handleReject = (id: string) => {
    rejectShiftSwap(id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const shifts = [
    'Morning (6AM-2PM)',
    'Day (9AM-5PM)',
    'Evening (2PM-10PM)',
    'Night (10PM-6AM)'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            Shift Swapping
          </h2>
          <p className="text-muted-foreground">Request and manage shift swap with colleagues</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Swap
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Shift Swap</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Swap With</Label>
                <Select value={formData.target_id} onValueChange={(v) => setFormData({ ...formData, target_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Swap Date</Label>
                <Input
                  type="date"
                  value={formData.swap_date}
                  onChange={(e) => setFormData({ ...formData, swap_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Your Current Shift</Label>
                <Select value={formData.original_shift} onValueChange={(v) => setFormData({ ...formData, original_shift: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Requested Shift</Label>
                <Select value={formData.requested_shift} onValueChange={(v) => setFormData({ ...formData, requested_shift: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select desired shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why you need this swap..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>
                {isCreating ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {shiftSwaps?.filter(r => r.status === 'pending').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {shiftSwaps?.filter(r => r.status === 'approved').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {shiftSwaps?.filter(r => r.status === 'rejected').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swap Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Swap With</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Original Shift</TableHead>
                <TableHead>Requested Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : shiftSwaps?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No swap requests found
                  </TableCell>
                </TableRow>
              ) : (
                shiftSwaps?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.requester?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{request.target?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{request.swap_date ? format(new Date(request.swap_date), 'MMM d, yyyy') : '-'}</TableCell>
                    <TableCell>{request.original_shift}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        {request.requested_shift}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(request.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
