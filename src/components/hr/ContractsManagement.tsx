import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Download, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Contract {
  id: string;
  employee_name: string;
  contract_type: string;
  start_date: string;
  end_date: string | null;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'terminated';
  created_at: string;
}

export function ContractsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-contracts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      return data || [];
    }
  });

  // Mock contracts data until table is created
  const contracts: Contract[] = [
    { id: '1', employee_name: 'John Doe', contract_type: 'Employment Agreement', start_date: '2024-01-01', end_date: '2025-01-01', status: 'signed', created_at: '2024-01-01' },
    { id: '2', employee_name: 'Jane Smith', contract_type: 'NDA', start_date: '2024-02-15', end_date: null, status: 'signed', created_at: '2024-02-15' },
    { id: '3', employee_name: 'Bob Wilson', contract_type: 'Offer Letter', start_date: '2024-03-01', end_date: null, status: 'sent', created_at: '2024-02-28' },
  ];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Contract['status']) => {
    const variants: Record<Contract['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      draft: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      sent: { variant: 'outline', icon: <Send className="h-3 w-3" /> },
      signed: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      expired: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      terminated: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
    };
    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'signed').length,
    pending: contracts.filter(c => c.status === 'sent' || c.status === 'draft').length,
    expiring: contracts.filter(c => c.end_date && new Date(c.end_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Contracts</h2>
          <p className="text-muted-foreground">Manage offer letters, employment contracts, and agreements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
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
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">Offer Letter</SelectItem>
                  <SelectItem value="employment">Employment Agreement</SelectItem>
                  <SelectItem value="nda">NDA</SelectItem>
                  <SelectItem value="amendment">Contract Amendment</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" placeholder="Start Date" />
              <Input type="date" placeholder="End Date (optional)" />
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Create Contract</Button>
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
                <p className="text-sm text-muted-foreground">Total Contracts</p>
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
                <p className="text-sm text-muted-foreground">Signed</p>
                <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiring}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
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
                placeholder="Search contracts..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Contract Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.employee_name}</TableCell>
                  <TableCell>{contract.contract_type}</TableCell>
                  <TableCell>{format(new Date(contract.start_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{contract.end_date ? format(new Date(contract.end_date), 'MMM dd, yyyy') : 'Indefinite'}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Send className="h-4 w-4" /></Button>
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
