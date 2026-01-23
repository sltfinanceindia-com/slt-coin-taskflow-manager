import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Send, Download, CheckCircle, XCircle, Clock, Loader2, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { useOffers } from '@/hooks/useOffers';

export function OffersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidate_name: '',
    position: '',
    department: '',
    salary_offered: 0,
    joining_date: '',
    expires_at: '',
  });

  const { offers, isLoading, error, createOffer, updateOffer } = useOffers();

  const handleSubmit = (asDraft: boolean) => {
    if (!formData.candidate_name || !formData.position) return;
    
    createOffer.mutate({
      candidate_name: formData.candidate_name,
      candidate_email: '',
      position: formData.position,
      department: formData.department,
      salary_offered: formData.salary_offered,
      joining_date: formData.joining_date || null,
      expires_at: formData.expires_at || null,
      status: asDraft ? 'draft' : 'sent',
    } as any);
    
    setIsDialogOpen(false);
    setFormData({ candidate_name: '', position: '', department: '', salary_offered: 0, joining_date: '', expires_at: '' });
  };

  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      sent: { variant: 'outline', label: 'Sent' },
      accepted: { variant: 'default', label: 'Accepted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      negotiating: { variant: 'secondary', label: 'Negotiating' },
      withdrawn: { variant: 'outline', label: 'Withdrawn' },
    };
    const cfg = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
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
        <h3 className="mt-4 font-semibold">Error loading offers</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

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
              <div>
                <Label>Candidate Name</Label>
                <Input 
                  placeholder="Enter candidate name"
                  value={formData.candidate_name}
                  onChange={(e) => setFormData(p => ({ ...p, candidate_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Select value={formData.position} onValueChange={(v) => setFormData(p => ({ ...p, position: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Senior Software Engineer">Senior Software Engineer</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="UX Designer">UX Designer</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Annual CTC (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="Enter CTC"
                  value={formData.salary_offered || ''}
                  onChange={(e) => setFormData(p => ({ ...p, salary_offered: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Proposed Joining Date</Label>
                <Input 
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData(p => ({ ...p, joining_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Offer Expiry Date</Label>
                <Input 
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(p => ({ ...p, expires_at: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleSubmit(true)} disabled={createOffer.isPending}>
                  Save Draft
                </Button>
                <Button className="flex-1" onClick={() => handleSubmit(false)} disabled={createOffer.isPending}>
                  {createOffer.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /></> : 'Send Offer'}
                </Button>
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
          {filteredOffers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No offers found</p>
              <p className="text-sm">Create your first offer to get started</p>
            </div>
          ) : (
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
                    <TableCell>{offer.joining_date ? format(new Date(offer.joining_date), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell>
                      {offer.expires_at && (
                        <span className={new Date(offer.expires_at) < new Date() ? 'text-red-600' : ''}>
                          {format(new Date(offer.expires_at), 'MMM dd')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(offer.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                        {offer.status === 'draft' && (
                          <Button size="sm" variant="ghost" onClick={() => updateOffer.mutate({ id: offer.id, status: 'sent' })}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {offer.status === 'sent' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateOffer.mutate({ id: offer.id, status: 'accepted' })}>
                              Accept
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateOffer.mutate({ id: offer.id, status: 'rejected' })}>
                              Reject
                            </Button>
                          </>
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
