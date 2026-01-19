import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Send, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Offer {
  id: string;
  candidate_name: string;
  position: string;
  department: string;
  salary_offered: number;
  joining_date: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'negotiating' | 'withdrawn';
  created_at: string;
  expires_at: string;
}

export function OffersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const offers: Offer[] = [
    { id: '1', candidate_name: 'Rahul Kumar', position: 'Senior Software Engineer', department: 'Engineering', salary_offered: 2500000, joining_date: '2024-04-01', status: 'sent', created_at: '2024-03-10', expires_at: '2024-03-20' },
    { id: '2', candidate_name: 'Priya Sharma', position: 'Product Manager', department: 'Product', salary_offered: 2000000, joining_date: '2024-04-15', status: 'accepted', created_at: '2024-03-05', expires_at: '2024-03-15' },
    { id: '3', candidate_name: 'Amit Patel', position: 'UX Designer', department: 'Design', salary_offered: 1500000, joining_date: '2024-04-01', status: 'negotiating', created_at: '2024-03-08', expires_at: '2024-03-18' },
    { id: '4', candidate_name: 'Sneha Gupta', position: 'Data Analyst', department: 'Analytics', salary_offered: 1200000, joining_date: '2024-05-01', status: 'draft', created_at: '2024-03-15', expires_at: '2024-03-25' },
    { id: '5', candidate_name: 'Vikram Singh', position: 'DevOps Engineer', department: 'Engineering', salary_offered: 1800000, joining_date: '2024-04-15', status: 'rejected', created_at: '2024-03-01', expires_at: '2024-03-11' },
  ];

  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Offer['status']) => {
    const config: Record<Offer['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      sent: { variant: 'outline', label: 'Sent' },
      accepted: { variant: 'default', label: 'Accepted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      negotiating: { variant: 'secondary', label: 'Negotiating' },
      withdrawn: { variant: 'outline', label: 'Withdrawn' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const stats = {
    total: offers.length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    pending: offers.filter(o => o.status === 'sent' || o.status === 'negotiating').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offer Management</h2>
          <p className="text-muted-foreground">Create and track job offers to candidates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Offer Letter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Candidate Name" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swe">Senior Software Engineer</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="ux">UX Designer</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Annual CTC (₹)" />
              <Input type="date" placeholder="Proposed Joining Date" />
              <Input type="date" placeholder="Offer Expiry Date" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Save Draft</Button>
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>Send Offer</Button>
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
                <p className="text-sm text-muted-foreground">Total Offers</p>
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
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
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
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Letters</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.candidate_name}</TableCell>
                  <TableCell>{offer.position}</TableCell>
                  <TableCell>{offer.department}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(offer.salary_offered)}</TableCell>
                  <TableCell>{format(new Date(offer.joining_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <span className={new Date(offer.expires_at) < new Date() ? 'text-red-600' : ''}>
                      {format(new Date(offer.expires_at), 'MMM dd')}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                      {offer.status === 'draft' && (
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
