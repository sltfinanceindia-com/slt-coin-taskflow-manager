import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { GitBranch, Plus, Trash2, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface TaskDependency {
  id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: string;
  predecessor_task?: { id: string; title: string; status: string };
  successor_task?: { id: string; title: string; status: string };
  created_at: string;
}

export function DependencyManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [predecessorId, setPredecessorId] = useState('');
  const [successorId, setSuccessorId] = useState('');
  const [dependencyType, setDependencyType] = useState('finish_to_start');

  // Fetch tasks for selection
  const { data: tasks } = useQuery({
    queryKey: ['tasks-for-deps', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('organization_id', profile?.organization_id)
        .order('title');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch dependencies
  const { data: dependencies, isLoading } = useQuery({
    queryKey: ['task-dependencies', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('task_dependencies')
        .select('id, task_id, depends_on_task_id, dependency_type, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch task details separately
      const taskIds = new Set<string>();
      (data || []).forEach((d: any) => {
        taskIds.add(d.task_id);
        taskIds.add(d.depends_on_task_id);
      });
      
      const { data: taskDetails } = await supabase
        .from('tasks')
        .select('id, title, status')
        .in('id', Array.from(taskIds));
      
      const taskMap = new Map((taskDetails || []).map(t => [t.id, t]));
      
      return (data || []).map((d: any) => ({
        id: d.id,
        predecessor_task_id: d.depends_on_task_id,
        successor_task_id: d.task_id,
        dependency_type: d.dependency_type || 'finish_to_start',
        created_at: d.created_at,
        predecessor_task: taskMap.get(d.depends_on_task_id),
        successor_task: taskMap.get(d.task_id),
      })) as TaskDependency[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('task_dependencies')
        .insert({
          depends_on_task_id: predecessorId,
          task_id: successorId,
          dependency_type: dependencyType,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      setIsCreateOpen(false);
      setPredecessorId('');
      setSuccessorId('');
      toast({ title: 'Dependency created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('task_dependencies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      toast({ title: 'Dependency removed' });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Done</Badge>;
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isBlocked = (dep: TaskDependency) => {
    return dep.predecessor_task?.status !== 'completed' && dep.successor_task?.status !== 'completed';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Task Dependencies
          </h1>
          <p className="text-muted-foreground">Manage task relationships and blocking issues</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Dependency</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Dependency</DialogTitle>
              <DialogDescription>Link tasks together</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Predecessor (Blocks)</Label>
                <Select value={predecessorId} onValueChange={setPredecessorId}>
                  <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                  <SelectContent>
                    {tasks?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Successor (Blocked By)</Label>
                <Select value={successorId} onValueChange={setSuccessorId}>
                  <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                  <SelectContent>
                    {tasks?.filter(t => t.id !== predecessorId).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={dependencyType} onValueChange={setDependencyType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finish_to_start">Finish to Start</SelectItem>
                    <SelectItem value="start_to_start">Start to Start</SelectItem>
                    <SelectItem value="finish_to_finish">Finish to Finish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={() => createMutation.mutate()}
                disabled={!predecessorId || !successorId || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Dependency'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dependencies?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Blocking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dependencies?.filter(isBlocked).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dependencies?.filter(d => !isBlocked(d)).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Dependencies</CardTitle>
          <CardDescription>Task relationships and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : dependencies && dependencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Predecessor</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Successor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dependencies.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell>
                      <div className="font-medium">{dep.predecessor_task?.title || 'Unknown'}</div>
                      {dep.predecessor_task && getStatusBadge(dep.predecessor_task.status)}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{dep.successor_task?.title || 'Unknown'}</div>
                      {dep.successor_task && getStatusBadge(dep.successor_task.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dep.dependency_type.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      {isBlocked(dep) ? (
                        <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Blocking</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(dep.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No dependencies defined</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
