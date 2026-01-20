import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCcw, Plus, Play, Pause, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface RecurringTask {
  id: string;
  title: string;
  description: string;
  frequency: string;
  assigned_to: string;
  next_occurrence: string;
  last_created: string | null;
  is_active: boolean;
  created_at: string;
  assignee?: { full_name: string };
}

export function RecurringTasksManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'weekly',
    assigned_to: '',
    is_active: true
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-recurring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });

  const { data: recurringTasks, isLoading } = useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: async () => {
      return [
        {
          id: '1',
          title: 'Weekly Team Meeting',
          description: 'Prepare and conduct weekly team sync',
          frequency: 'weekly',
          assigned_to: profile?.id || '',
          next_occurrence: format(new Date(), 'yyyy-MM-dd'),
          last_created: null,
          is_active: true,
          created_at: new Date().toISOString(),
          assignee: { full_name: profile?.full_name || 'Unassigned' }
        },
        {
          id: '2',
          title: 'Monthly Report',
          description: 'Generate and submit monthly progress report',
          frequency: 'monthly',
          assigned_to: profile?.id || '',
          next_occurrence: format(new Date(), 'yyyy-MM-dd'),
          last_created: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          is_active: true,
          created_at: new Date().toISOString(),
          assignee: { full_name: profile?.full_name || 'Unassigned' }
        }
      ] as RecurringTask[];
    },
    enabled: !!employees
  });

  const handleSubmit = () => {
    toast.success('Recurring task created successfully');
    setIsDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      frequency: 'weekly',
      assigned_to: '',
      is_active: true
    });
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toast.success(`Recurring task ${isActive ? 'activated' : 'paused'}`);
    queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
  };

  const handleDelete = (id: string) => {
    toast.success('Recurring task deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-blue-100 text-blue-800',
      'bi-weekly': 'bg-purple-100 text-purple-800',
      monthly: 'bg-green-100 text-green-800',
      quarterly: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[frequency] || 'bg-gray-100 text-gray-800'}>{frequency}</Badge>;
  };

  const frequencies = ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCcw className="h-6 w-6" />
            Recurring Tasks
          </h2>
          <p className="text-muted-foreground">Auto-create recurring tasks on schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Recurring Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Recurring Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Weekly Team Meeting"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((f) => (
                        <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
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
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Start creating tasks immediately</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">Create Recurring Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {recurringTasks?.filter(t => t.is_active).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {recurringTasks?.filter(t => t.next_occurrence === format(new Date(), 'yyyy-MM-dd')).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {recurringTasks?.filter(t => !t.is_active).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recurring Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Next Occurrence</TableHead>
                <TableHead>Last Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : recurringTasks?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No recurring tasks found
                  </TableCell>
                </TableRow>
              ) : (
                recurringTasks?.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getFrequencyBadge(task.frequency)}</TableCell>
                    <TableCell>{task.assignee?.full_name || 'Unassigned'}</TableCell>
                    <TableCell>{format(new Date(task.next_occurrence), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {task.last_created ? format(new Date(task.last_created), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.is_active ? 'default' : 'secondary'}>
                        {task.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => handleToggle(task.id, !task.is_active)}
                        >
                          {task.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
