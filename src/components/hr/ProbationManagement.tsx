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
import { Clock, Search, CheckCircle, AlertTriangle, Calendar, Loader2, FileX } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useProbations, Probation } from '@/hooks/useProbations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ProbationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    performance_score: '',
    feedback: '',
    recommendation: '',
  });

  const { probations, isLoading, error, updateProbation } = useProbations();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-probation'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, email, department').order('full_name');
      return data || [];
    }
  });

  const handleSubmitFeedback = () => {
    if (formData.employee_id) {
      const probation = probations.find(p => p.employee_id === formData.employee_id);
      if (probation) {
        updateProbation.mutate({
          id: probation.id,
          performance_score: formData.performance_score ? Number(formData.performance_score) : null,
          feedback: formData.feedback || null,
          status: formData.recommendation === 'confirm' ? 'confirmed' : 
                  formData.recommendation === 'extend' ? 'extended' : 
                  formData.recommendation === 'terminate' ? 'terminated' : probation.status,
        });
      }
    }
    setIsDialogOpen(false);
    setFormData({ employee_id: '', performance_score: '', feedback: '', recommendation: '' });
  };

  const filteredProbations = probations.filter(p => {
    const employeeName = p.employee?.full_name || '';
    const department = p.employee?.department || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Probation['status']) => {
    const config: Record<Probation['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      ongoing: { variant: 'outline', label: 'Ongoing' },
      extended: { variant: 'secondary', label: 'Extended' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      terminated: { variant: 'destructive', label: 'Terminated' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getPerformanceColor = (score: number | null) => {
    if (!score) return '';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 ? days : 0;
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
        <h3 className="mt-4 font-semibold">Error loading probation records</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const stats = {
    ongoing: probations.filter(p => p.status === 'ongoing').length,
    endingSoon: probations.filter(p => {
      const days = getDaysRemaining(p.end_date);
      return days > 0 && days <= 30 && (p.status === 'ongoing' || p.status === 'extended');
    }).length,
    confirmed: probations.filter(p => p.status === 'confirmed').length,
    extended: probations.filter(p => p.status === 'extended').length,
  };

  const ongoingProbations = probations.filter(p => p.status === 'ongoing' || p.status === 'extended');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Probation Tracking</h2>
          <p className="text-muted-foreground">Manage probation periods and confirmation processes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Clock className="mr-2 h-4 w-4" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Probation Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>
                    {ongoingProbations.map((p) => (
                      <SelectItem key={p.employee_id} value={p.employee_id || ''}>{p.employee?.full_name || 'Unknown'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Performance Score (0-100)</Label>
                <Input type="number" min={0} max={100} value={formData.performance_score} onChange={(e) => setFormData({...formData, performance_score: e.target.value})} placeholder="75" />
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea value={formData.feedback} onChange={(e) => setFormData({...formData, feedback: e.target.value})} placeholder="Feedback comments..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Recommendation</Label>
                <Select value={formData.recommendation} onValueChange={(v) => setFormData({...formData, recommendation: v})}>
                  <SelectTrigger><SelectValue placeholder="Select recommendation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirm">Confirm Employment</SelectItem>
                    <SelectItem value="extend">Extend Probation</SelectItem>
                    <SelectItem value="terminate">Terminate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSubmitFeedback} disabled={updateProbation.isPending || !formData.employee_id}>
                {updateProbation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Feedback'}
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
                <p className="text-sm text-muted-foreground">Ongoing</p>
                <p className="text-2xl font-bold">{stats.ongoing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ending Soon</p>
                <p className="text-2xl font-bold text-orange-600">{stats.endingSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Extended</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.extended}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
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
              <Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="extended">Extended</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Probation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Probation Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProbations.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No probation records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProbations.map((probation) => {
                  const daysRemaining = getDaysRemaining(probation.end_date);
                  return (
                    <TableRow key={probation.id}>
                      <TableCell className="font-medium">{probation.employee?.full_name || 'Unknown'}</TableCell>
                      <TableCell>{probation.employee?.department || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(probation.start_date), 'MMM dd')} - {format(new Date(probation.end_date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {probation.status === 'ongoing' || probation.status === 'extended' ? (
                          <span className={daysRemaining <= 30 ? 'text-orange-600 font-medium' : ''}>
                            {daysRemaining} days
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getPerformanceColor(probation.performance_score)}`}>
                          {probation.performance_score ? `${probation.performance_score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{probation.manager?.full_name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(probation.status)}</TableCell>
                      <TableCell>
                        {(probation.status === 'ongoing' || probation.status === 'extended') && (
                          <Button size="sm" variant="outline" onClick={() => {
                            setFormData({...formData, employee_id: probation.employee_id || ''});
                            setIsDialogOpen(true);
                          }}>Review</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
