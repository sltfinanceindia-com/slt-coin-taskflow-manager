import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Download, Send, CheckCircle, Clock, Mail, Loader2, FileX, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useConfirmations, Confirmation } from '@/hooks/useConfirmations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ConfirmationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    confirmation_date: '',
    salary_revision: false,
    previous_salary: '',
    revised_salary: '',
  });

  const { confirmations, isLoading, error, createConfirmation, updateConfirmation } = useConfirmations();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-confirmations'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, email, department').order('full_name');
      return data || [];
    }
  });

  const handleSubmit = () => {
    createConfirmation.mutate({
      employee_id: formData.employee_id || null,
      probation_id: null,
      confirmation_date: formData.confirmation_date || null,
      letter_status: 'generated',
      salary_revision: formData.salary_revision,
      previous_salary: formData.previous_salary ? Number(formData.previous_salary) : null,
      revised_salary: formData.revised_salary ? Number(formData.revised_salary) : null,
      letter_url: null,
      generated_by: null,
      organization_id: null,
    });
    setIsDialogOpen(false);
    setFormData({ employee_id: '', confirmation_date: '', salary_revision: false, previous_salary: '', revised_salary: '' });
  };

  const handleSendLetter = (id: string) => {
    updateConfirmation.mutate({ id, letter_status: 'sent' });
  };

  const filteredConfirmations = confirmations.filter(c => {
    const employeeName = c.employee?.full_name || '';
    const department = c.employee?.department || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.letter_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Confirmation['letter_status']) => {
    const config: Record<Confirmation['letter_status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
      generated: { variant: 'outline', icon: <FileText className="h-3 w-3" />, label: 'Generated' },
      sent: { variant: 'outline', icon: <Mail className="h-3 w-3" />, label: 'Sent' },
      acknowledged: { variant: 'default', icon: <CheckCircle className="h-3 w-3" />, label: 'Acknowledged' },
    };
    const { variant, icon, label } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
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
        <h3 className="mt-4 font-semibold">Error loading confirmations</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const stats = {
    total: confirmations.length,
    pending: confirmations.filter(c => c.letter_status === 'pending').length,
    sent: confirmations.filter(c => c.letter_status === 'sent' || c.letter_status === 'generated').length,
    acknowledged: confirmations.filter(c => c.letter_status === 'acknowledged').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Confirmation Letters</h2>
          <p className="text-muted-foreground">Auto-generate and manage confirmation letters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Letter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Confirmation Letter</DialogTitle>
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
                <Label>Confirmation Date</Label>
                <Input type="date" value={formData.confirmation_date} onChange={(e) => setFormData({...formData, confirmation_date: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="salary_revision" checked={formData.salary_revision} onChange={(e) => setFormData({...formData, salary_revision: e.target.checked})} />
                <label htmlFor="salary_revision" className="text-sm">Include salary revision</label>
              </div>
              {formData.salary_revision && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Previous Salary</Label>
                    <Input type="number" value={formData.previous_salary} onChange={(e) => setFormData({...formData, previous_salary: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Revised Salary</Label>
                    <Input type="number" value={formData.revised_salary} onChange={(e) => setFormData({...formData, revised_salary: e.target.value})} />
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={handleSubmit} disabled={createConfirmation.isPending || !formData.employee_id}>
                {createConfirmation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generate Letter'}
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
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
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
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmation Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConfirmations.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No confirmation records found</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Generate Letter
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Confirmation Date</TableHead>
                  <TableHead>Salary Revision</TableHead>
                  <TableHead>Letter Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfirmations.map((confirmation) => (
                  <TableRow key={confirmation.id}>
                    <TableCell className="font-medium">{confirmation.employee?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{confirmation.employee?.department || 'N/A'}</TableCell>
                    <TableCell>{confirmation.confirmation_date ? format(new Date(confirmation.confirmation_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={confirmation.salary_revision ? 'default' : 'secondary'}>
                        {confirmation.salary_revision ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(confirmation.letter_status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                        {confirmation.letter_status === 'generated' && (
                          <Button size="sm" variant="ghost" onClick={() => handleSendLetter(confirmation.id)} disabled={updateConfirmation.isPending}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
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
