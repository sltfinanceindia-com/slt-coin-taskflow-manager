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
import { Briefcase, Plus, Search, Eye, Users, Clock, MapPin, Building, Loader2, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { useJobPostings, JobPosting } from '@/hooks/useJobPostings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function JobPostingsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full_time' as JobPosting['type'],
    experience: '',
    description: '',
    requirements: '',
    hiring_manager_id: '',
  });

  const { postings, isLoading, error, createPosting, updatePosting } = useJobPostings();

  const { data: managers = [] } = useQuery({
    queryKey: ['managers-for-postings'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').order('full_name');
      return data || [];
    }
  });

  const handleSubmit = (publish: boolean) => {
    createPosting.mutate({
      title: formData.title,
      department: formData.department,
      location: formData.location || null,
      type: formData.type,
      experience: formData.experience || null,
      description: formData.description || null,
      requirements: formData.requirements || null,
      salary_range_min: null,
      salary_range_max: null,
      status: publish ? 'open' : 'draft',
      applications_count: 0,
      hiring_manager_id: formData.hiring_manager_id || null,
      posted_on: publish ? new Date().toISOString().split('T')[0] : null,
      closes_on: null,
      organization_id: null,
    });
    setIsDialogOpen(false);
    setFormData({ title: '', department: '', location: '', type: 'full_time', experience: '', description: '', requirements: '', hiring_manager_id: '' });
  };

  const filteredPostings = postings.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: JobPosting['status']) => {
    const config: Record<JobPosting['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      open: { variant: 'default', label: 'Open' },
      on_hold: { variant: 'outline', label: 'On Hold' },
      closed: { variant: 'destructive', label: 'Closed' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getTypeBadge = (type: JobPosting['type']) => {
    const labels: Record<JobPosting['type'], string> = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      intern: 'Internship',
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
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
        <h3 className="mt-4 font-semibold">Error loading job postings</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const stats = {
    total: postings.length,
    open: postings.filter(p => p.status === 'open').length,
    totalApplications: postings.reduce((acc, p) => acc + (p.applications_count || 0), 0),
    avgApplications: postings.filter(p => p.status === 'open').length > 0 
      ? Math.round(postings.filter(p => p.status === 'open').reduce((acc, p) => acc + (p.applications_count || 0), 0) / postings.filter(p => p.status === 'open').length) 
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Job Postings</h2>
          <p className="text-muted-foreground">Manage job openings and track applications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Posting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Job Posting</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2 space-y-2">
                <Label>Job Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Senior Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g., Bangalore, Remote" />
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={formData.type} onValueChange={(v: JobPosting['type']) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Input value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} placeholder="e.g., 3-5 years" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Job description..." rows={4} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Requirements</Label>
                <Textarea value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} placeholder="Requirements..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Hiring Manager</Label>
                <Select value={formData.hiring_manager_id} onValueChange={(v) => setFormData({...formData, hiring_manager_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {managers.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleSubmit(false)} disabled={createPosting.isPending || !formData.title || !formData.department}>
                  {createPosting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save as Draft
                </Button>
                <Button onClick={() => handleSubmit(true)} disabled={createPosting.isPending || !formData.title || !formData.department}>
                  {createPosting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Publish
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
                <p className="text-sm text-muted-foreground">Total Postings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-green-600">{stats.open}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Posting</p>
                <p className="text-2xl font-bold">{stats.avgApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
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
              <Input placeholder="Search postings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPostings.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No job postings found</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Create Posting
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPostings.map((posting) => (
                  <TableRow key={posting.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{posting.title}</p>
                        <p className="text-xs text-muted-foreground">{posting.experience || 'Experience not specified'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{posting.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {posting.location || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(posting.type)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{posting.applications_count || 0}</span>
                    </TableCell>
                    <TableCell>{posting.posted_on ? format(new Date(posting.posted_on), 'MMM dd, yyyy') : 'Not posted'}</TableCell>
                    <TableCell>{getStatusBadge(posting.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
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
