import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Shield, Plus, Search, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Verification {
  id: string;
  employee_name: string;
  verification_type: string;
  status: 'pending' | 'in_progress' | 'verified' | 'failed';
  vendor: string;
  initiated_on: string;
  completed_on: string | null;
  progress: number;
}

export function VerificationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-verification'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      return data || [];
    }
  });

  // Mock data
  const verifications: Verification[] = [
    { id: '1', employee_name: 'John Doe', verification_type: 'Education', status: 'verified', vendor: 'AuthBridge', initiated_on: '2024-01-15', completed_on: '2024-01-20', progress: 100 },
    { id: '2', employee_name: 'John Doe', verification_type: 'Employment History', status: 'in_progress', vendor: 'AuthBridge', initiated_on: '2024-01-15', completed_on: null, progress: 60 },
    { id: '3', employee_name: 'Jane Smith', verification_type: 'Criminal Background', status: 'pending', vendor: 'SpringVerify', initiated_on: '2024-02-01', completed_on: null, progress: 0 },
    { id: '4', employee_name: 'Bob Wilson', verification_type: 'Address', status: 'failed', vendor: 'AuthBridge', initiated_on: '2024-01-10', completed_on: '2024-01-18', progress: 100 },
  ];

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = v.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.verification_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Verification['status']) => {
    const config: Record<Verification['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
      in_progress: { variant: 'outline', icon: <Clock className="h-3 w-3" />, label: 'In Progress' },
      verified: { variant: 'default', icon: <CheckCircle className="h-3 w-3" />, label: 'Verified' },
      failed: { variant: 'destructive', icon: <XCircle className="h-3 w-3" />, label: 'Failed' },
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
    total: verifications.length,
    verified: verifications.filter(v => v.status === 'verified').length,
    inProgress: verifications.filter(v => v.status === 'in_progress').length,
    failed: verifications.filter(v => v.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Background Verification</h2>
          <p className="text-muted-foreground">Track background verification status for employees</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Initiate Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Initiate Background Verification</DialogTitle>
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
                  <SelectValue placeholder="Verification Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="employment">Employment History</SelectItem>
                  <SelectItem value="criminal">Criminal Background</SelectItem>
                  <SelectItem value="address">Address Verification</SelectItem>
                  <SelectItem value="reference">Reference Check</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Verification Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authbridge">AuthBridge</SelectItem>
                  <SelectItem value="springverify">SpringVerify</SelectItem>
                  <SelectItem value="internal">Internal Team</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Initiate Verification</Button>
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
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
                placeholder="Search verifications..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Initiated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell className="font-medium">{verification.employee_name}</TableCell>
                  <TableCell>{verification.verification_type}</TableCell>
                  <TableCell>{verification.vendor}</TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={verification.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">{verification.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(verification.status)}</TableCell>
                  <TableCell>{verification.initiated_on}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
