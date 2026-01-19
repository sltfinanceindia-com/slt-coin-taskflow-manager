import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, Search, AlertTriangle, Clock, CheckCircle, Eye, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface Grievance {
  id: string;
  ticket_id: string;
  category: string;
  subject: string;
  status: 'open' | 'under_investigation' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_on: string;
  is_anonymous: boolean;
  assigned_to: string | null;
  resolution_date: string | null;
}

export function GrievanceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const grievances: Grievance[] = [
    { id: '1', ticket_id: 'GRV-001', category: 'Workplace Conduct', subject: 'Unprofessional behavior by colleague', status: 'under_investigation', priority: 'high', submitted_on: '2024-03-15', is_anonymous: true, assigned_to: 'HR Manager', resolution_date: null },
    { id: '2', ticket_id: 'GRV-002', category: 'Policy Violation', subject: 'Leave policy not being followed', status: 'resolved', priority: 'medium', submitted_on: '2024-03-10', is_anonymous: false, assigned_to: 'HR Manager', resolution_date: '2024-03-18' },
    { id: '3', ticket_id: 'GRV-003', category: 'Discrimination', subject: 'Unfair treatment', status: 'open', priority: 'critical', submitted_on: '2024-03-20', is_anonymous: true, assigned_to: null, resolution_date: null },
    { id: '4', ticket_id: 'GRV-004', category: 'Facilities', subject: 'AC not working in office', status: 'closed', priority: 'low', submitted_on: '2024-03-05', is_anonymous: false, assigned_to: 'Admin', resolution_date: '2024-03-07' },
  ];

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
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getPriorityBadge = (priority: Grievance['priority']) => {
    const colors: Record<Grievance['priority'], string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>{priority.toUpperCase()}</span>;
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Grievance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Grievance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conduct">Workplace Conduct</SelectItem>
                  <SelectItem value="policy">Policy Violation</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Subject" />
              <Textarea placeholder="Describe your grievance in detail..." rows={5} />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" className="rounded" />
                <label htmlFor="anonymous" className="text-sm">Submit anonymously</label>
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Submit Grievance</Button>
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
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
              <Input
                placeholder="Search grievances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
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
                  <TableCell>{format(new Date(grievance.submitted_on), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{grievance.assigned_to || '-'}</TableCell>
                  <TableCell>{getStatusBadge(grievance.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
