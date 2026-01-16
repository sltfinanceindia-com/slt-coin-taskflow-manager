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
import { AlertTriangle, Plus, CheckCircle, Shield, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  description: string | null;
  category: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'analyzing' | 'mitigating' | 'resolved' | 'accepted';
  mitigation_plan: string | null;
  owner_id: string | null;
  project_id: string;
  project_name?: string;
  created_at: string;
}

export function RiskManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    category: 'technical',
    probability: 'medium',
    impact: 'medium',
    mitigation_plan: '',
    project_id: '',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-list', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: risks, isLoading } = useQuery({
    queryKey: ['risks', profile?.organization_id, filter],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('project_risks')
        .select(`
          id, title, description, category, probability, impact, status, mitigation_plan, owner_id, project_id, created_at,
          projects(name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r: any) => ({
        ...r,
        project_name: r.projects?.name,
      })) as Risk[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (risk: typeof newRisk) => {
      const { data, error } = await (supabase as any)
        .from('project_risks')
        .insert({
          organization_id: profile?.organization_id,
          title: risk.title,
          description: risk.description,
          category: risk.category,
          probability: risk.probability,
          impact: risk.impact,
          mitigation_plan: risk.mitigation_plan,
          project_id: risk.project_id,
          status: 'identified',
          owner_id: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      setIsCreateOpen(false);
      setNewRisk({ title: '', description: '', category: 'technical', probability: 'medium', impact: 'medium', mitigation_plan: '', project_id: '' });
      toast({ title: 'Risk logged successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error logging risk', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from('project_risks').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast({ title: 'Risk updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('project_risks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast({ title: 'Risk deleted' });
    },
  });

  const getRiskScore = (probability: string, impact: string) => {
    const scores: Record<string, number> = { low: 1, medium: 2, high: 3 };
    return scores[probability] * scores[impact];
  };

  const getRiskBadge = (score: number) => {
    if (score >= 6) return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    if (score >= 4) return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
    if (score >= 2) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      identified: <Badge variant="secondary">Identified</Badge>,
      analyzing: <Badge className="bg-blue-100 text-blue-800">Analyzing</Badge>,
      mitigating: <Badge className="bg-purple-100 text-purple-800">Mitigating</Badge>,
      resolved: <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>,
      accepted: <Badge className="bg-gray-100 text-gray-800">Accepted</Badge>,
    };
    return badges[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const filteredRisks = risks?.filter(r => filter === 'all' || r.status === filter) || [];
  
  const stats = {
    total: risks?.length || 0,
    critical: risks?.filter(r => getRiskScore(r.probability, r.impact) >= 6).length || 0,
    mitigating: risks?.filter(r => r.status === 'mitigating').length || 0,
    resolved: risks?.filter(r => r.status === 'resolved').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-primary" />Risk Register</h1>
          <p className="text-muted-foreground">Identify and manage project risks</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="identified">Identified</SelectItem>
              <SelectItem value="analyzing">Analyzing</SelectItem>
              <SelectItem value="mitigating">Mitigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Log Risk</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Log New Risk</DialogTitle><DialogDescription>Document a project risk</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                <div><Label>Project</Label>
                  <Select value={newRisk.project_id} onValueChange={(v) => setNewRisk(p => ({ ...p, project_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Risk Title</Label><Input placeholder="Data loss risk" value={newRisk.title} onChange={(e) => setNewRisk(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea placeholder="Describe the risk..." value={newRisk.description} onChange={(e) => setNewRisk(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Category</Label>
                    <Select value={newRisk.category} onValueChange={(v) => setNewRisk(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="schedule">Schedule</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Probability</Label>
                    <Select value={newRisk.probability} onValueChange={(v) => setNewRisk(p => ({ ...p, probability: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Impact</Label>
                    <Select value={newRisk.impact} onValueChange={(v) => setNewRisk(p => ({ ...p, impact: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Mitigation Plan</Label><Textarea placeholder="How to mitigate..." value={newRisk.mitigation_plan} onChange={(e) => setNewRisk(p => ({ ...p, mitigation_plan: e.target.value }))} rows={2} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate(newRisk)} disabled={!newRisk.title || !newRisk.project_id || createMutation.isPending}>
                  {createMutation.isPending ? 'Logging...' : 'Log Risk'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Risks</CardTitle><AlertTriangle className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Critical</CardTitle><TrendingUp className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.critical}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Mitigating</CardTitle><Shield className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.mitigating}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Resolved</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.resolved}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Risk Register</CardTitle><CardDescription>All identified project risks</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredRisks.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Risk</TableHead><TableHead>Project</TableHead><TableHead>Risk Score</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredRisks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell><div className="font-medium">{risk.title}</div>{risk.description && <div className="text-sm text-muted-foreground line-clamp-1">{risk.description}</div>}</TableCell>
                    <TableCell><Badge variant="outline">{risk.project_name}</Badge></TableCell>
                    <TableCell>{getRiskBadge(getRiskScore(risk.probability, risk.impact))}</TableCell>
                    <TableCell><span className="capitalize">{risk.category}</span></TableCell>
                    <TableCell>{getStatusBadge(risk.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {risk.status === 'identified' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: risk.id, status: 'mitigating' })}>Mitigate</Button>}
                        {risk.status === 'mitigating' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: risk.id, status: 'resolved' })}><CheckCircle className="h-3 w-3 mr-1" />Resolve</Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(risk.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No risks logged</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
