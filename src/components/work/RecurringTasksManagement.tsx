import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useRecurringTasksData } from '@/hooks/useRecurringTasksData';

export function RecurringTasksManagement() {
  const { profile } = useAuth();
  const { recurringTasks, isLoading, createRecurringTask, deleteRecurringTask, toggleRecurringTask, isCreating } = useRecurringTasksData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly',
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

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    await createRecurringTask({
      title: formData.title,
      description: formData.description || null,
      frequency: formData.frequency,
      assigned_to: formData.assigned_to || null,
      next_occurrence: format(new Date(), 'yyyy-MM-dd'),
      last_created: null,
      is_active: formData.is_active,
      created_by: null,
    });
    
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
    toggleRecurringTask({ id, is_active: isActive });
  };

  const handleDelete = async (id: string) => {
    await deleteRecurringTask(id);
  };

  const getFrequencyBadge = (frequency: string | null) => {
    const colors: Record<string, string> = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-blue-100 text-blue-800',
      'bi-weekly': 'bg-purple-100 text-purple-800',
      monthly: 'bg-green-100 text-green-800',
      quarterly: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[frequency || 'weekly'] || 'bg-gray-100 text-gray-800'}>{frequency || 'weekly'}</Badge>;
  };

  const frequencies = ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly'] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  <Select value={formData.frequency} onValueChange={(v: typeof frequencies[number]) => setFormData({ ...formData, frequency: v })}>
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
              <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Recurring Task'}
              </Button>
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
                    No recurring tasks found. Create your first recurring task to get started.
                  </TableCell>
                </TableRow>
              ) : (
                recurringTasks?.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{getFrequencyBadge(task.frequency)}</TableCell>
                    <TableCell>{task.assignee?.full_name || 'Unassigned'}</TableCell>
                    <TableCell>
                      {task.next_occurrence ? format(new Date(task.next_occurrence), 'MMM d, yyyy') : '-'}
                    </TableCell>
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
