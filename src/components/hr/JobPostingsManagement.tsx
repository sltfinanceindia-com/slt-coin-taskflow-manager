import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Plus, Search, Eye, Users, Clock, MapPin, Building } from 'lucide-react';
import { format } from 'date-fns';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'intern';
  experience: string;
  status: 'draft' | 'open' | 'on_hold' | 'closed';
  applications: number;
  posted_on: string;
  hiring_manager: string;
}

export function JobPostingsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const postings: JobPosting[] = [
    { id: '1', title: 'Senior Software Engineer', department: 'Engineering', location: 'Bangalore', type: 'full_time', experience: '4-6 years', status: 'open', applications: 45, posted_on: '2024-03-01', hiring_manager: 'John Doe' },
    { id: '2', title: 'Product Manager', department: 'Product', location: 'Remote', type: 'full_time', experience: '3-5 years', status: 'open', applications: 32, posted_on: '2024-03-05', hiring_manager: 'Jane Smith' },
    { id: '3', title: 'UX Designer', department: 'Design', location: 'Mumbai', type: 'full_time', experience: '2-4 years', status: 'on_hold', applications: 28, posted_on: '2024-02-20', hiring_manager: 'Alice Brown' },
    { id: '4', title: 'Data Analyst Intern', department: 'Analytics', location: 'Bangalore', type: 'intern', experience: '0-1 years', status: 'open', applications: 120, posted_on: '2024-03-10', hiring_manager: 'Bob Wilson' },
    { id: '5', title: 'DevOps Engineer', department: 'Engineering', location: 'Hyderabad', type: 'full_time', experience: '3-5 years', status: 'draft', applications: 0, posted_on: '2024-03-15', hiring_manager: 'Carol White' },
  ];

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

  const stats = {
    total: postings.length,
    open: postings.filter(p => p.status === 'open').length,
    totalApplications: postings.reduce((acc, p) => acc + p.applications, 0),
    avgApplications: Math.round(postings.filter(p => p.status === 'open').reduce((acc, p) => acc + p.applications, 0) / postings.filter(p => p.status === 'open').length) || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              <Input placeholder="Job Title" className="col-span-2" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Location" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Internship</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Experience Required" />
              <Textarea placeholder="Job Description" className="col-span-2" rows={4} />
              <Textarea placeholder="Requirements" className="col-span-2" rows={3} />
              <Input placeholder="Salary Range (Optional)" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Hiring Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Save as Draft</Button>
                <Button onClick={() => setIsDialogOpen(false)}>Publish</Button>
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
              <Input
                placeholder="Search postings..."
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
                      <p className="text-xs text-muted-foreground">{posting.experience}</p>
                    </div>
                  </TableCell>
                  <TableCell>{posting.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {posting.location}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(posting.type)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{posting.applications}</span>
                  </TableCell>
                  <TableCell>{format(new Date(posting.posted_on), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(posting.status)}</TableCell>
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
