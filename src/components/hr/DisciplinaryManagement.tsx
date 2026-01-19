import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Plus, Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface DisciplinaryAction {
  id: string;
  employee_name: string;
  department: string;
  action_type: 'verbal_warning' | 'written_warning' | 'show_cause' | 'suspension' | 'termination';
  reason: string;
  status: 'pending' | 'issued' | 'appealed' | 'resolved' | 'withdrawn';
  issued_date: string;
  issued_by: string;
  resolution_date: string | null;
}

export function DisciplinaryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-disciplinary'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      return data || [];
    }
  });

  // Mock data
  const actions: DisciplinaryAction[] = [
    { id: '1', employee_name: 'John Doe', department: 'Engineering', action_type: 'verbal_warning', reason: 'Repeated tardiness', status: 'issued', issued_date: '2024-03-01', issued_by: 'HR Manager', resolution_date: null },
    { id: '2', employee_name: 'Jane Smith', department: 'Sales', action_type: 'written_warning', reason: 'Policy violation', status: 'appealed', issued_date: '2024-02-15', issued_by: 'HR Manager', resolution_date: null },
    { id: '3', employee_name: 'Mike Brown', department: 'Marketing', action_type: 'show_cause', reason: 'Misconduct', status: 'pending', issued_date: '2024-03-20', issued_by: 'Department Head', resolution_date: null },
    { id: '4', employee_name: 'Sarah Lee', department: 'Finance', action_type: 'suspension', reason: 'Pending investigation', status: 'resolved', issued_date: '2024-01-10', issued_by: 'HR Director', resolution_date: '2024-02-01' },
  ];

  const filteredActions = actions.filter(a => {
    const matchesSearch = a.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getActionTypeBadge = (type: DisciplinaryAction['action_type']) => {
    const config: Record<DisciplinaryAction['action_type'], { color: string; label: string }> = {
      verbal_warning: { color: 'bg-yellow-100 text-yellow-800', label: 'Verbal Warning' },
      written_warning: { color: 'bg-orange-100 text-orange-800', label: 'Written Warning' },
      show_cause: { color: 'bg-purple-100 text-purple-800', label: 'Show Cause' },
      suspension: { color: 'bg-red-100 text-red-800', label: 'Suspension' },
      termination: { color: 'bg-red-200 text-red-900', label: 'Termination' },
    };
    const { color, label } = config[type];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getStatusBadge = (status: DisciplinaryAction['status']) => {
    const config: Record<DisciplinaryAction['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      issued: { variant: 'outline', label: 'Issued' },
      appealed: { variant: 'destructive', label: 'Appealed' },
      resolved: { variant: 'default', label: 'Resolved' },
      withdrawn: { variant: 'outline', label: 'Withdrawn' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const stats = {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    appealed: actions.filter(a => a.status === 'appealed').length,
    resolved: actions.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verbal_warning">Verbal Warning</SelectItem>
                  <SelectItem value="written_warning">Written Warning</SelectItem>
                  <SelectItem value="show_cause">Show Cause Notice</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="termination">Termination</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Reason for disciplinary action..." rows={4} />
              <Input type="date" placeholder="Issue Date" />
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Record Action</Button>
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
                <p className="text-sm text-muted-foreground">Appealed</p>
                <p className="text-2xl font-bold text-red-600">{stats.appealed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="appealed">Appealed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
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
                  <TableCell className="font-medium">{action.employee_name}</TableCell>
                  <TableCell>{action.department}</TableCell>
                  <TableCell>{getActionTypeBadge(action.action_type)}</TableCell>
                  <TableCell className="max-w-xs truncate">{action.reason}</TableCell>
                  <TableCell>{format(new Date(action.issued_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{action.issued_by}</TableCell>
                  <TableCell>{getStatusBadge(action.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
