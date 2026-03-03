import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Receipt, Plus, Calculator, FileText, Download, Users, Percent, IndianRupee } from 'lucide-react';

interface TaxDeclaration {
  id: string;
  employee_id: string;
  employee_name?: string;
  financial_year: string;
  regime: 'old' | 'new';
  section_80c: number;
  section_80d: number;
  hra: number;
  other_deductions: number;
  total_deductions: number;
  status: 'draft' | 'submitted' | 'verified' | 'approved';
  created_at: string;
}

export function TaxManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('declarations');
  const [newDeclaration, setNewDeclaration] = useState({
    employee_id: '',
    financial_year: '2024-25',
    regime: 'new',
    section_80c: 0,
    section_80d: 0,
    hra: 0,
    other_deductions: 0,
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-list', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile?.organization_id!);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: declarations, isLoading } = useQuery({
    queryKey: ['tax-declarations', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_declarations')
        .select(`
          id, employee_id, financial_year, regime, section_80c, section_80d, hra, other_deductions, status, created_at,
          profiles(full_name)
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((d: any) => ({
        ...d,
        employee_name: d.profiles?.full_name,
        total_deductions: (d.section_80c || 0) + (d.section_80d || 0) + (d.hra || 0) + (d.other_deductions || 0),
      })) as TaxDeclaration[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (declaration: typeof newDeclaration) => {
      const { data, error } = await supabase
        .from('tax_declarations')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: declaration.employee_id,
          financial_year: declaration.financial_year,
          regime: declaration.regime,
          section_80c: declaration.section_80c,
          section_80d: declaration.section_80d,
          hra: declaration.hra,
          other_deductions: declaration.other_deductions,
          status: 'draft',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-declarations'] });
      setIsCreateOpen(false);
      setNewDeclaration({ employee_id: '', financial_year: '2024-25', regime: 'new', section_80c: 0, section_80d: 0, hra: 0, other_deductions: 0 });
      toast({ title: 'Tax declaration created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating declaration', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('tax_declarations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-declarations'] });
      toast({ title: 'Declaration updated' });
    },
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      draft: <Badge variant="secondary">Draft</Badge>,
      submitted: <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>,
      verified: <Badge className="bg-purple-100 text-purple-800">Verified</Badge>,
      approved: <Badge className="bg-green-100 text-green-800">Approved</Badge>,
    };
    return badges[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const stats = {
    total: declarations?.length || 0,
    pending: declarations?.filter(d => d.status === 'draft' || d.status === 'submitted').length || 0,
    approved: declarations?.filter(d => d.status === 'approved').length || 0,
    totalDeductions: declarations?.reduce((sum, d) => sum + d.total_deductions, 0) || 0,
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6 text-primary" />Tax Management</h1>
          <p className="text-muted-foreground">Manage TDS, tax declarations, and compliance</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Declaration</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Tax Declaration</DialogTitle><DialogDescription>Add employee tax declaration</DialogDescription></DialogHeader>
            <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
              <div><Label>Employee</Label>
                <Select value={newDeclaration.employee_id} onValueChange={(v) => setNewDeclaration(p => ({ ...p, employee_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Financial Year</Label>
                  <Select value={newDeclaration.financial_year} onValueChange={(v) => setNewDeclaration(p => ({ ...p, financial_year: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tax Regime</Label>
                  <Select value={newDeclaration.regime} onValueChange={(v) => setNewDeclaration(p => ({ ...p, regime: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="old">Old Regime</SelectItem>
                      <SelectItem value="new">New Regime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Section 80C (Max ₹1.5L)</Label><Input type="number" value={newDeclaration.section_80c} onChange={(e) => setNewDeclaration(p => ({ ...p, section_80c: Number(e.target.value) }))} /></div>
              <div><Label>Section 80D - Health Insurance</Label><Input type="number" value={newDeclaration.section_80d} onChange={(e) => setNewDeclaration(p => ({ ...p, section_80d: Number(e.target.value) }))} /></div>
              <div><Label>HRA Exemption</Label><Input type="number" value={newDeclaration.hra} onChange={(e) => setNewDeclaration(p => ({ ...p, hra: Number(e.target.value) }))} /></div>
              <div><Label>Other Deductions</Label><Input type="number" value={newDeclaration.other_deductions} onChange={(e) => setNewDeclaration(p => ({ ...p, other_deductions: Number(e.target.value) }))} /></div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between font-medium">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(newDeclaration.section_80c + newDeclaration.section_80d + newDeclaration.hra + newDeclaration.other_deductions)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(newDeclaration)} disabled={!newDeclaration.employee_id || createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Declaration'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Declarations</CardTitle><FileText className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Review</CardTitle><Calculator className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle><Receipt className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.approved}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Deductions</CardTitle><IndianRupee className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats.totalDeductions)}</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="declarations">Declarations</TabsTrigger>
          <TabsTrigger value="tds">TDS Summary</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Tax Declarations</CardTitle><CardDescription>Employee investment declarations for tax saving</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : declarations && declarations.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>FY</TableHead><TableHead>Regime</TableHead><TableHead>80C</TableHead><TableHead>80D</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {declarations.map((dec) => (
                      <TableRow key={dec.id}>
                        <TableCell className="font-medium">{dec.employee_name}</TableCell>
                        <TableCell>{dec.financial_year}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{dec.regime}</Badge></TableCell>
                        <TableCell>{formatCurrency(dec.section_80c)}</TableCell>
                        <TableCell>{formatCurrency(dec.section_80d)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(dec.total_deductions)}</TableCell>
                        <TableCell>{getStatusBadge(dec.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {dec.status === 'draft' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: dec.id, status: 'submitted' })}>Submit</Button>}
                            {dec.status === 'submitted' && <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: dec.id, status: 'verified' })}>Verify</Button>}
                            {dec.status === 'verified' && <Button size="sm" onClick={() => updateMutation.mutate({ id: dec.id, status: 'approved' })}>Approve</Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <div className="text-center py-8 text-muted-foreground"><Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No tax declarations found</p></div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tds" className="mt-4">
          <Card>
            <CardHeader><CardTitle>TDS Summary</CardTitle><CardDescription>Tax deducted at source overview</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="pt-6"><div className="text-center"><Percent className="h-8 w-8 mx-auto mb-2 text-blue-500" /><div className="text-2xl font-bold">₹0</div><p className="text-sm text-muted-foreground">TDS Deducted (YTD)</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center"><Users className="h-8 w-8 mx-auto mb-2 text-green-500" /><div className="text-2xl font-bold">{employees?.length || 0}</div><p className="text-sm text-muted-foreground">Employees</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center"><Download className="h-8 w-8 mx-auto mb-2 text-purple-500" /><Button variant="outline" size="sm">Generate 24Q</Button><p className="text-sm text-muted-foreground mt-2">Quarterly TDS Return</p></div></CardContent></Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Compliance Status</CardTitle><CardDescription>Statutory compliance overview</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'PF (EPF)', status: 'compliant', due: '15th of next month' },
                  { name: 'ESI', status: 'compliant', due: '15th of next month' },
                  { name: 'Professional Tax', status: 'compliant', due: '10th of next month' },
                  { name: 'TDS (Form 24Q)', status: 'pending', due: 'End of quarter' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Due: {item.due}</div>
                    </div>
                    <Badge className={item.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.status === 'compliant' ? 'Compliant' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
