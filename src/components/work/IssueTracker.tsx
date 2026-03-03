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
import { Bug, Plus, CheckCircle, Clock, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reported_by: string | null;
  assigned_to: string | null;
  project_id: string;
  project_name?: string;
  created_at: string;
  resolution: string | null;
}

export function IssueTracker() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    severity: 'medium',
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

  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues', profile?.organization_id, filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_issues')
        .select(`
          id, title, description, severity, status, reported_by, assigned_to, project_id, created_at, resolution,
          projects(name)
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((i: any) => ({
        ...i,
        project_name: i.projects?.name,
      })) as Issue[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (issue: typeof newIssue) => {
      const { data, error } = await supabase
        .from('project_issues')
        .insert({
          organization_id: profile?.organization_id,
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          project_id: issue.project_id,
          status: 'open',
          reported_by: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setIsCreateOpen(false);
      setNewIssue({ title: '', description: '', severity: 'medium', project_id: '' });
      toast({ title: 'Issue reported successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error reporting issue', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('project_issues').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Issue updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_issues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Issue deleted' });
    },
  });

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, JSX.Element> = {
      critical: <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>,
      high: <Badge className="bg-orange-100 text-orange-800">High</Badge>,
      medium: <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>,
      low: <Badge className="bg-green-100 text-green-800">Low</Badge>,
    };
    return badges[severity] || <Badge variant="secondary">{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      open: <Badge variant="destructive">Open</Badge>,
      in_progress: <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>,
      resolved: <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>,
      closed: <Badge variant="secondary">Closed</Badge>,
    };
    return badges[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const filteredIssues = issues?.filter(i => filter === 'all' || i.status === filter) || [];
  
  const stats = {
    total: issues?.length || 0,
    open: issues?.filter(i => i.status === 'open').length || 0,
    critical: issues?.filter(i => i.severity === 'critical' && i.status !== 'closed').length || 0,
    resolved: issues?.filter(i => i.status === 'resolved' || i.status === 'closed').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bug className="h-6 w-6 text-primary" />Issue Tracker</h1>
          <p className="text-muted-foreground">Track and resolve project issues</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Report Issue</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Report Issue</DialogTitle><DialogDescription>Log a new project issue</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Project</Label>
                  <Select value={newIssue.project_id} onValueChange={(v) => setNewIssue(p => ({ ...p, project_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Issue Title</Label><Input placeholder="Login button not working" value={newIssue.title} onChange={(e) => setNewIssue(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea placeholder="Describe the issue in detail..." value={newIssue.description} onChange={(e) => setNewIssue(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                <div><Label>Severity</Label>
                  <Select value={newIssue.severity} onValueChange={(v) => setNewIssue(p => ({ ...p, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate(newIssue)} disabled={!newIssue.title || !newIssue.project_id || createMutation.isPending}>
                  {createMutation.isPending ? 'Reporting...' : 'Report Issue'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Issues</CardTitle><Bug className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Open</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.open}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Critical</CardTitle><AlertTriangle className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.critical}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Resolved</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.resolved}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Issues</CardTitle><CardDescription>Project issue log</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredIssues.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Issue</TableHead><TableHead>Project</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Reported</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell><div className="font-medium">{issue.title}</div>{issue.description && <div className="text-sm text-muted-foreground line-clamp-1">{issue.description}</div>}</TableCell>
                    <TableCell><Badge variant="outline">{issue.project_name}</Badge></TableCell>
                    <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                    <TableCell>{getStatusBadge(issue.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(issue.created_at), 'MMM dd')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {issue.status === 'open' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: issue.id, status: 'in_progress' })}>Start</Button>}
                        {issue.status === 'in_progress' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: issue.id, status: 'resolved' })}><CheckCircle className="h-3 w-3 mr-1" />Resolve</Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(issue.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><Bug className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No issues reported</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
