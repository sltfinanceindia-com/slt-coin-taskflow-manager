import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Search, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';

interface Probation {
  id: string;
  employee_name: string;
  department: string;
  start_date: string;
  end_date: string;
  status: 'ongoing' | 'extended' | 'confirmed' | 'terminated';
  performance_score: number;
  manager: string;
  days_remaining: number;
}

export function ProbationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const probations: Probation[] = [
    { id: '1', employee_name: 'John Doe', department: 'Engineering', start_date: '2024-01-01', end_date: '2024-07-01', status: 'ongoing', performance_score: 75, manager: 'Alice Johnson', days_remaining: 45 },
    { id: '2', employee_name: 'Jane Smith', department: 'Marketing', start_date: '2023-11-15', end_date: '2024-05-15', status: 'confirmed', performance_score: 90, manager: 'Bob Wilson', days_remaining: 0 },
    { id: '3', employee_name: 'Mike Brown', department: 'Sales', start_date: '2024-02-01', end_date: '2024-08-01', status: 'extended', performance_score: 55, manager: 'Carol White', days_remaining: 60 },
    { id: '4', employee_name: 'Sarah Lee', department: 'HR', start_date: '2024-03-01', end_date: '2024-09-01', status: 'ongoing', performance_score: 82, manager: 'David Chen', days_remaining: 90 },
  ];

  const filteredProbations = probations.filter(p => {
    const matchesSearch = p.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.department.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = {
    ongoing: probations.filter(p => p.status === 'ongoing').length,
    endingSoon: probations.filter(p => p.days_remaining > 0 && p.days_remaining <= 30).length,
    confirmed: probations.filter(p => p.status === 'confirmed').length,
    extended: probations.filter(p => p.status === 'extended').length,
  };

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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {probations.filter(p => p.status === 'ongoing').map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.employee_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Performance Score (0-100)" min={0} max={100} />
              <Textarea placeholder="Feedback comments..." rows={4} />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">Confirm Employment</SelectItem>
                  <SelectItem value="extend">Extend Probation</SelectItem>
                  <SelectItem value="terminate">Terminate</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Submit Feedback</Button>
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
              <Input
                placeholder="Search employees..."
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
              {filteredProbations.map((probation) => (
                <TableRow key={probation.id}>
                  <TableCell className="font-medium">{probation.employee_name}</TableCell>
                  <TableCell>{probation.department}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(probation.start_date), 'MMM dd')} - {format(new Date(probation.end_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {probation.status === 'ongoing' || probation.status === 'extended' ? (
                      <span className={probation.days_remaining <= 30 ? 'text-orange-600 font-medium' : ''}>
                        {probation.days_remaining} days
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPerformanceColor(probation.performance_score)}`}>
                      {probation.performance_score}%
                    </span>
                  </TableCell>
                  <TableCell>{probation.manager}</TableCell>
                  <TableCell>{getStatusBadge(probation.status)}</TableCell>
                  <TableCell>
                    {probation.status === 'ongoing' && (
                      <Button size="sm" variant="outline">Review</Button>
                    )}
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
