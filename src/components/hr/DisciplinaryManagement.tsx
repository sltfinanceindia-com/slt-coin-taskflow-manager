import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Plus, Search, FileText, Clock, CheckCircle, Loader2, FileX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useDisciplinaryActions, DisciplinaryAction } from '@/hooks/useDisciplinaryActions';

export function DisciplinaryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    action_type: 'verbal_warning' as DisciplinaryAction['action_type'],
    reason: '',
    description: '',
    issued_date: '',
  });

  const { actions, isLoading, error, createAction, updateAction } = useDisciplinaryActions();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-disciplinary'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, department').order('full_name');
      return data || [];
    }
  });

  const handleSubmit = () => {
    createAction.mutate({
      employee_id: formData.employee_id || null,
      action_type: formData.action_type,
      reason: formData.reason,
      description: formData.description || null,
      status: 'active',
      issued_date: formData.issued_date || new Date().toISOString().split('T')[0],
      issued_by: null,
      expiry_date: null,
      witnesses: null,
      documents: null,
      organization_id: null,
    });
    setIsDialogOpen(false);
    setFormData({ employee_id: '', action_type: 'verbal_warning', reason: '', description: '', issued_date: '' });
  };

  const filteredActions = actions.filter(a => {
    const employeeName = a.employee?.full_name || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getActionTypeBadge = (type: DisciplinaryAction['action_type']) => {
    const config: Record<DisciplinaryAction['action_type'], { color: string; label: string }> = {
      verbal_warning: { color: 'bg-yellow-100 text-yellow-800', label: 'Verbal Warning' },
      written_warning: { color: 'bg-orange-100 text-orange-800', label: 'Written Warning' },
      suspension: { color: 'bg-red-100 text-red-800', label: 'Suspension' },
      pip: { color: 'bg-purple-100 text-purple-800', label: 'PIP' },
      termination: { color: 'bg-red-200 text-red-900', label: 'Termination' },
    };
    const { color, label } = config[type];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getStatusBadge = (status: DisciplinaryAction['status']) => {
    const config: Record<DisciplinaryAction['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'destructive', label: 'Active' },
      resolved: { variant: 'default', label: 'Resolved' },
      appealed: { variant: 'secondary', label: 'Appealed' },
      expired: { variant: 'outline', label: 'Expired' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <FileX className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading disciplinary actions</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const stats = {
    total: actions.length,
    active: actions.filter(a => a.status === 'active').length,
    appealed: actions.filter(a => a.status === 'appealed').length,
    resolved: actions.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Disciplinary Actions</h2>
          <p className="text-muted-foreground">Manage warnings, suspensions, and disciplinary processes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Action
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Disciplinary Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={formData.action_type} onValueChange={(v: DisciplinaryAction['action_type']) => setFormData({...formData, action_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verbal_warning">Verbal Warning</SelectItem>
                    <SelectItem value="written_warning">Written Warning</SelectItem>
                    <SelectItem value="pip">Performance Improvement Plan</SelectItem>
                    <SelectItem value="suspension">Suspension</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Brief reason" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed description..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" value={formData.issued_date} onChange={(e) => setFormData({...formData, issued_date: e.target.value})} />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createAction.isPending || !formData.employee_id || !formData.reason}>
                {createAction.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recording...</> : 'Record Action'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appealed</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.appealed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="appealed">Appealed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Action Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActions.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No disciplinary actions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.employee?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{action.employee?.department || 'N/A'}</TableCell>
                    <TableCell>{getActionTypeBadge(action.action_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{action.reason}</TableCell>
                    <TableCell>{format(new Date(action.issued_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{action.issuer?.full_name || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(action.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
