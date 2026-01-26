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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Plus, Search, AlertTriangle, Clock, CheckCircle, Eye, Lock, Loader2, FileX, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useGrievances, Grievance } from '@/hooks/useGrievances';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const defaultFormData = {
  category: '',
  subject: '',
  description: '',
  priority: 'medium' as Grievance['priority'],
  is_anonymous: false,
  status: 'open' as Grievance['status'],
  assigned_to: '',
};

export function GrievanceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrievance, setEditingGrievance] = useState<Grievance | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const { grievances, isLoading, error, createGrievance, updateGrievance, deleteGrievance } = useGrievances();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-grievances'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, email').order('full_name');
      return data || [];
    }
  });

  const handleEdit = (grievance: Grievance) => {
    setEditingGrievance(grievance);
    setFormData({
      category: grievance.category,
      subject: grievance.subject,
      description: grievance.description || '',
      priority: grievance.priority,
      is_anonymous: grievance.is_anonymous || false,
      status: grievance.status,
      assigned_to: grievance.assigned_to || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this grievance?')) {
      deleteGrievance.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGrievance(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    const grievanceData = {
      category: formData.category,
      subject: formData.subject,
      description: formData.description || null,
      priority: formData.priority,
      is_anonymous: formData.is_anonymous,
      status: formData.status,
      ticket_id: '',
      employee_id: formData.is_anonymous ? null : null,
      assigned_to: formData.assigned_to || null,
      resolution_date: null,
      resolution_notes: null,
      organization_id: null,
    };

    if (editingGrievance) {
      updateGrievance.mutate({ id: editingGrievance.id, ...grievanceData });
    } else {
      createGrievance.mutate(grievanceData);
    }
    handleCloseDialog();
  };

  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = g.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         g.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Grievance['status']) => {
    const config: Record<Grievance['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      open: { variant: 'destructive', label: 'Open' },
      under_investigation: { variant: 'secondary', label: 'Under Investigation' },
      resolved: { variant: 'default', label: 'Resolved' },
      closed: { variant: 'outline', label: 'Closed' },
      escalated: { variant: 'destructive', label: 'Escalated' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getPriorityBadge = (priority: Grievance['priority']) => {
    const colors: Record<Grievance['priority'], string> = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>{priority.toUpperCase()}</span>;
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
        <h3 className="mt-4 font-semibold">Error loading grievances</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const stats = {
    open: grievances.filter(g => g.status === 'open').length,
    investigating: grievances.filter(g => g.status === 'under_investigation').length,
    resolved: grievances.filter(g => g.status === 'resolved').length,
    critical: grievances.filter(g => g.priority === 'critical' && g.status !== 'closed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grievance Management</h2>
          <p className="text-muted-foreground">Employee grievance portal for complaints and resolutions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Grievance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGrievance ? 'Edit Grievance' : 'Submit Grievance'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Workplace Conduct">Workplace Conduct</SelectItem>
                    <SelectItem value="Policy Violation">Policy Violation</SelectItem>
                    <SelectItem value="Discrimination">Discrimination</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="Brief subject of your grievance" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe your grievance in detail..." rows={5} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v: Grievance['priority']) => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingGrievance && (
                <>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v: Grievance['status']) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="under_investigation">Under Investigation</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Select value={formData.assigned_to} onValueChange={(v) => setFormData({...formData, assigned_to: v})}>
                      <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {!editingGrievance && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="anonymous" className="rounded" checked={formData.is_anonymous} onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})} />
                  <label htmlFor="anonymous" className="text-sm">Submit anonymously</label>
                </div>
              )}
              <Button className="w-full" onClick={handleSubmit} disabled={createGrievance.isPending || updateGrievance.isPending || !formData.category || !formData.subject}>
                {(createGrievance.isPending || updateGrievance.isPending) ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : editingGrievance ? 'Update Grievance' : 'Submit Grievance'}
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
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-destructive">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Investigation</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.investigating}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-purple-600">{stats.critical}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
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
              <Input placeholder="Search grievances..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="under_investigation">Under Investigation</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grievance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGrievances.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No grievances found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrievances.map((grievance) => (
                  <TableRow key={grievance.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {grievance.ticket_id}
                        {grievance.is_anonymous && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell>{grievance.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{grievance.subject}</TableCell>
                    <TableCell>{getPriorityBadge(grievance.priority)}</TableCell>
                    <TableCell>{grievance.created_at ? format(new Date(grievance.created_at), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell>{grievance.assignee?.full_name || '-'}</TableCell>
                    <TableCell>{getStatusBadge(grievance.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(grievance)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(grievance.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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