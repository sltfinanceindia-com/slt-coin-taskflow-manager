import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Download, Send, CheckCircle, Clock, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Confirmation {
  id: string;
  employee_name: string;
  department: string;
  probation_end_date: string;
  confirmation_date: string;
  letter_status: 'pending' | 'generated' | 'sent' | 'acknowledged';
  salary_revision: boolean;
  new_designation: string | null;
}

export function ConfirmationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const confirmations: Confirmation[] = [
    { id: '1', employee_name: 'Jane Smith', department: 'Marketing', probation_end_date: '2024-05-15', confirmation_date: '2024-05-15', letter_status: 'acknowledged', salary_revision: true, new_designation: 'Senior Marketing Executive' },
    { id: '2', employee_name: 'Tom Wilson', department: 'Engineering', probation_end_date: '2024-04-01', confirmation_date: '2024-04-01', letter_status: 'sent', salary_revision: true, new_designation: null },
    { id: '3', employee_name: 'Emily Davis', department: 'Sales', probation_end_date: '2024-05-20', confirmation_date: '2024-05-20', letter_status: 'generated', salary_revision: false, new_designation: null },
    { id: '4', employee_name: 'Chris Lee', department: 'HR', probation_end_date: '2024-06-01', confirmation_date: '2024-06-01', letter_status: 'pending', salary_revision: false, new_designation: null },
  ];

  const filteredConfirmations = confirmations.filter(c => {
    const matchesSearch = c.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.department.toLowerCase().includes(searchTerm.toLowerCase());
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
              <FileText className="mr-2 h-4 w-4" />
              Generate Letters
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Confirmation Letter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {confirmations.filter(c => c.letter_status === 'pending').map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.employee_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Letter Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Confirmation</SelectItem>
                  <SelectItem value="promotion">Confirmation with Promotion</SelectItem>
                  <SelectItem value="revision">Confirmation with Salary Revision</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" placeholder="Effective Date" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Preview</Button>
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>Generate</Button>
              </div>
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
              <Input
                placeholder="Search..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Confirmation Date</TableHead>
                <TableHead>Salary Revision</TableHead>
                <TableHead>New Designation</TableHead>
                <TableHead>Letter Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfirmations.map((confirmation) => (
                <TableRow key={confirmation.id}>
                  <TableCell className="font-medium">{confirmation.employee_name}</TableCell>
                  <TableCell>{confirmation.department}</TableCell>
                  <TableCell>{format(new Date(confirmation.confirmation_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={confirmation.salary_revision ? 'default' : 'secondary'}>
                      {confirmation.salary_revision ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>{confirmation.new_designation || '-'}</TableCell>
                  <TableCell>{getStatusBadge(confirmation.letter_status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                      {confirmation.letter_status === 'generated' && (
                        <Button size="sm" variant="ghost"><Send className="h-4 w-4" /></Button>
                      )}
                    </div>
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
