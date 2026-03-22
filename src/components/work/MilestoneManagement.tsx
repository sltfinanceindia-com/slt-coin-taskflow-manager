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
import { format, differenceInDays, isPast } from 'date-fns';
import { Target, Plus, CheckCircle, Clock, AlertTriangle, AlertCircle, Calendar, Trash2, Edit } from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  project_id: string;
  project_name?: string;
  created_at: string;
}

export function MilestoneManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    project_id: '',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-list', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile?.organization_id!);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: milestones, isLoading, error: queryError } = useQuery({
    queryKey: ['milestones', profile?.organization_id, filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select(`
          id, name, description, due_date, status, progress_percentage, project_id, created_at,
          projects(name)
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        due_date: m.due_date,
        status: isPast(new Date(m.due_date)) && m.status !== 'completed' ? 'overdue' : m.status,
        progress: m.progress_percentage || 0,
        project_id: m.project_id,
        project_name: m.projects?.name,
        created_at: m.created_at,
      })) as Milestone[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (milestone: typeof newMilestone) => {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          organization_id: profile?.organization_id,
          name: milestone.name,
          description: milestone.description,
          due_date: milestone.due_date,
          project_id: milestone.project_id,
          status: 'pending',
          progress_percentage: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      setIsCreateOpen(false);
      setNewMilestone({ name: '', description: '', due_date: format(new Date(), 'yyyy-MM-dd'), project_id: '' });
      toast({ title: 'Milestone created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating milestone', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; progress_percentage?: number }) => {
      const { error } = await supabase.from('project_milestones').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({ title: 'Milestone updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_milestones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({ title: 'Milestone deleted' });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default: return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getDaysUntil = (dueDate: string) => differenceInDays(new Date(dueDate), new Date());
  const filteredMilestones = milestones?.filter(m => filter === 'all' || m.status === filter) || [];
  
  const stats = {
    total: milestones?.length || 0,
    completed: milestones?.filter(m => m.status === 'completed').length || 0,
    overdue: milestones?.filter(m => m.status === 'overdue').length || 0,
    upcoming: milestones?.filter(m => getDaysUntil(m.due_date) <= 7 && m.status !== 'completed').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-primary" />Milestone Tracking</h1>
          <p className="text-muted-foreground">Track project milestones and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Milestone</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Milestone</DialogTitle><DialogDescription>Add a new project milestone</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Project</Label>
                  <Select value={newMilestone.project_id} onValueChange={(v) => setNewMilestone(p => ({ ...p, project_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Milestone Name</Label><Input placeholder="Q1 Release" value={newMilestone.name} onChange={(e) => setNewMilestone(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea placeholder="Milestone details..." value={newMilestone.description} onChange={(e) => setNewMilestone(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                <div><Label>Due Date</Label><Input type="date" value={newMilestone.due_date} onChange={(e) => setNewMilestone(p => ({ ...p, due_date: e.target.value }))} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate(newMilestone)} disabled={!newMilestone.name || !newMilestone.project_id || createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Milestone'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle><Target className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Overdue</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.overdue}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Due This Week</CardTitle><Calendar className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.upcoming}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Milestones</CardTitle><CardDescription>All project milestones</CardDescription></CardHeader>
        <CardContent>
          {queryError ? <div className="text-center py-12" data-testid="error-milestones"><AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" /><p className="font-medium">Failed to load milestones</p><p className="text-sm text-muted-foreground mt-1">Please try again later.</p></div> : isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredMilestones.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Milestone</TableHead><TableHead>Project</TableHead><TableHead>Due Date</TableHead><TableHead>Progress</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredMilestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell><div className="font-medium">{milestone.name}</div>{milestone.description && <div className="text-sm text-muted-foreground line-clamp-1">{milestone.description}</div>}</TableCell>
                    <TableCell><Badge variant="outline">{milestone.project_name}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3" />{format(new Date(milestone.due_date), 'MMM dd, yyyy')}</div></TableCell>
                    <TableCell><div className="space-y-1 w-24"><div className="flex justify-between text-xs"><span>{milestone.progress}%</span></div><Progress value={milestone.progress} className="h-2" /></div></TableCell>
                    <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {milestone.status !== 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: milestone.id, status: 'completed', progress_percentage: 100 })}><CheckCircle className="h-3 w-3 mr-1" />Complete</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(milestone.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No milestones found</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}