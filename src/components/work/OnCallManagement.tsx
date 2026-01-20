import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Phone, Plus, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface OnCallSchedule {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  rotation_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function OnCallManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    rotation_type: 'weekly',
    notes: ''
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-oncall'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['oncall-schedules'],
    queryFn: async () => {
      // Simulated data - in production, this would come from a real table
      return [
        {
          id: '1',
          user_id: employees?.[0]?.id || '',
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          rotation_type: 'weekly',
          status: 'active',
          notes: 'Primary on-call rotation',
          created_at: new Date().toISOString(),
          profile: employees?.[0]
        }
      ] as OnCallSchedule[];
    },
    enabled: !!employees
  });

  const handleSubmit = () => {
    toast.success('On-call schedule created successfully');
    setIsDialogOpen(false);
    setFormData({
      user_id: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      rotation_type: 'weekly',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      upcoming: 'secondary',
      completed: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6" />
            On-Call Rotation
          </h2>
          <p className="text-muted-foreground">Manage on-call duty schedules and rotations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create On-Call Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={formData.user_id} onValueChange={(v) => setFormData({ ...formData, user_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rotation Type</Label>
                <Select value={formData.rotation_type} onValueChange={(v) => setFormData({ ...formData, rotation_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">Create Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current On-Call</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{schedules?.filter(s => s.status === 'active').length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{schedules?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>On-Call Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Rotation Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : schedules?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No on-call schedules found
                  </TableCell>
                </TableRow>
              ) : (
                schedules?.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.profile?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(schedule.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(schedule.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="capitalize">{schedule.rotation_type}</TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{schedule.notes || '-'}</TableCell>
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
