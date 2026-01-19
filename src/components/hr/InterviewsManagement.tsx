import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Search, Video, Clock, User, Star, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Interview {
  id: string;
  candidate_name: string;
  position: string;
  round: string;
  interviewer: string;
  scheduled_at: string;
  duration: number;
  mode: 'video' | 'in_person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback: string | null;
  rating: number | null;
}

export function InterviewsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const interviews: Interview[] = [
    { id: '1', candidate_name: 'Rahul Kumar', position: 'Senior Software Engineer', round: 'Technical Round 1', interviewer: 'John Doe', scheduled_at: '2024-03-20T10:00:00', duration: 60, mode: 'video', status: 'scheduled', feedback: null, rating: null },
    { id: '2', candidate_name: 'Priya Sharma', position: 'Product Manager', round: 'HR Round', interviewer: 'Jane Smith', scheduled_at: '2024-03-19T14:00:00', duration: 45, mode: 'video', status: 'completed', feedback: 'Strong communication skills', rating: 4 },
    { id: '3', candidate_name: 'Amit Patel', position: 'UX Designer', round: 'Portfolio Review', interviewer: 'Alice Brown', scheduled_at: '2024-03-18T11:00:00', duration: 90, mode: 'in_person', status: 'completed', feedback: 'Excellent portfolio', rating: 5 },
    { id: '4', candidate_name: 'Sneha Gupta', position: 'Data Analyst', round: 'Technical Round 2', interviewer: 'Bob Wilson', scheduled_at: '2024-03-21T15:00:00', duration: 60, mode: 'video', status: 'scheduled', feedback: null, rating: null },
    { id: '5', candidate_name: 'Vikram Singh', position: 'DevOps Engineer', round: 'Hiring Manager', interviewer: 'Carol White', scheduled_at: '2024-03-17T09:00:00', duration: 45, mode: 'phone', status: 'no_show', feedback: 'Candidate did not attend', rating: null },
  ];

  const filteredInterviews = interviews.filter(i => {
    const matchesSearch = i.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         i.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Interview['status']) => {
    const config: Record<Interview['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
      no_show: { variant: 'destructive', label: 'No Show' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getModeBadge = (mode: Interview['mode']) => {
    const icons = {
      video: <Video className="h-3 w-3" />,
      in_person: <User className="h-3 w-3" />,
      phone: <Clock className="h-3 w-3" />,
    };
    const labels = { video: 'Video', in_person: 'In-Person', phone: 'Phone' };
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {icons[mode]}
        {labels[mode]}
      </Badge>
    );
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return '-';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const stats = {
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    noShow: interviews.filter(i => i.status === 'no_show').length,
    avgRating: (interviews.filter(i => i.rating).reduce((acc, i) => acc + (i.rating || 0), 0) / interviews.filter(i => i.rating).length).toFixed(1) || '0',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Scheduling</h2>
          <p className="text-muted-foreground">Schedule and track candidate interviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
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
                  <SelectValue placeholder="Interview Round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="tech1">Technical Round 1</SelectItem>
                  <SelectItem value="tech2">Technical Round 2</SelectItem>
                  <SelectItem value="hr">HR Round</SelectItem>
                  <SelectItem value="hiring">Hiring Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Interviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Smith</SelectItem>
                  <SelectItem value="3">Alice Brown</SelectItem>
                </SelectContent>
              </Select>
              <Input type="datetime-local" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Schedule</Button>
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
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Shows</p>
                <p className="text-2xl font-bold text-red-600">{stats.noShow}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="font-medium">{interview.candidate_name}</TableCell>
                  <TableCell>{interview.position}</TableCell>
                  <TableCell>{interview.round}</TableCell>
                  <TableCell>{interview.interviewer}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(interview.scheduled_at), 'MMM dd, yyyy')}</p>
                      <p className="text-muted-foreground">{format(new Date(interview.scheduled_at), 'hh:mm a')} ({interview.duration} min)</p>
                    </div>
                  </TableCell>
                  <TableCell>{getModeBadge(interview.mode)}</TableCell>
                  <TableCell>{renderRating(interview.rating)}</TableCell>
                  <TableCell>{getStatusBadge(interview.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
