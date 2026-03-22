import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Search, Video, Clock, User, Star, CheckCircle, XCircle, Loader2, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { useInterviews } from '@/hooks/useInterviews';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function InterviewsManagement() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidate_name: '',
    position: '',
    round: '',
    interviewer_id: '',
    scheduled_at: '',
    duration: 60,
    mode: 'video',
  });

  const { interviews, isLoading, error, createInterview, updateInterview } = useInterviews();

  const { data: employees } = useQuery({
    queryKey: ['interviewers', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const handleSubmit = () => {
    if (!formData.candidate_name || !formData.position || !formData.scheduled_at) return;
    
    createInterview.mutate({
      candidate_name: formData.candidate_name,
      position: formData.position,
      round: formData.round,
      interviewer_ids: formData.interviewer_id ? [formData.interviewer_id] : [],
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration,
      mode: formData.mode as 'video' | 'in_person' | 'phone',
      status: 'scheduled',
    });
    
    setIsDialogOpen(false);
    setFormData({ candidate_name: '', position: '', round: '', interviewer_id: '', scheduled_at: '', duration: 60, mode: 'video' });
  };

  const filteredInterviews = interviews.filter(i => {
    const matchesSearch = i.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         i.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
      no_show: { variant: 'destructive', label: 'No Show' },
    };
    const cfg = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const getModeBadge = (mode: string) => {
    const icons: Record<string, JSX.Element> = {
      video: <Video className="h-3 w-3" />,
      in_person: <User className="h-3 w-3" />,
      phone: <Clock className="h-3 w-3" />,
    };
    const labels: Record<string, string> = { video: 'Video', in_person: 'In-Person', phone: 'Phone' };
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {icons[mode]}
        {labels[mode] || mode}
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
    avgRating: interviews.filter(i => i.rating).length > 0
      ? (interviews.filter(i => i.rating).reduce((acc, i) => acc + (i.rating || 0), 0) / interviews.filter(i => i.rating).length).toFixed(1)
      : '0',
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
        <h3 className="mt-4 font-semibold">Error loading interviews</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <Label>Interview Round</Label>
                <Select value={formData.round} onValueChange={(v) => setFormData(p => ({ ...p, round: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Screening">Screening</SelectItem>
                    <SelectItem value="Technical Round 1">Technical Round 1</SelectItem>
                    <SelectItem value="Technical Round 2">Technical Round 2</SelectItem>
                    <SelectItem value="HR Round">HR Round</SelectItem>
                    <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interviewer</Label>
                <Select value={formData.interviewer_id} onValueChange={(v) => setFormData(p => ({ ...p, interviewer_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date & Time</Label>
                <Input 
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData(p => ({ ...p, scheduled_at: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Select value={String(formData.duration)} onValueChange={(v) => setFormData(p => ({ ...p, duration: Number(v) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select value={formData.mode} onValueChange={(v) => setFormData(p => ({ ...p, mode: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="in_person">In-Person</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createInterview.isPending}>
                {createInterview.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scheduling...</> : 'Schedule'}
              </Button>
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
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No interviews found</p>
              <p className="text-sm">Schedule your first interview to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">{interview.candidate_name}</TableCell>
                    <TableCell>{interview.position}</TableCell>
                    <TableCell>{interview.round}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(interview.scheduled_at), 'MMM dd, yyyy')}</p>
                        <p className="text-muted-foreground">{format(new Date(interview.scheduled_at), 'hh:mm a')} ({interview.duration_minutes} min)</p>
                      </div>
                    </TableCell>
                    <TableCell>{getModeBadge(interview.mode)}</TableCell>
                    <TableCell>{renderRating(interview.rating)}</TableCell>
                    <TableCell>{getStatusBadge(interview.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {interview.status === 'scheduled' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateInterview.mutate({ id: interview.id, status: 'completed' })}>
                              Complete
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateInterview.mutate({ id: interview.id, status: 'no_show' })}>
                              No Show
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
