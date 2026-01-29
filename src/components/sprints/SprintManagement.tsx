import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useSprints } from '@/hooks/useSprints';
import { format, differenceInDays, addDays } from 'date-fns';
import { 
  Target, Plus, Play, CheckCircle, Clock, 
  BarChart3, Calendar, Trash2
} from 'lucide-react';

export function SprintManagement() {
  const { 
    sprints, 
    isLoading, 
    createSprint, 
    updateSprint, 
    deleteSprint 
  } = useSprints();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
  });

  // Create sprint mutation handler
  const handleCreateSprint = async () => {
    try {
      await createSprint.mutateAsync({
        name: newSprint.name,
        goal: newSprint.goal || null,
        start_date: newSprint.start_date,
        end_date: newSprint.end_date,
        status: 'planning',
        velocity: null,
        total_story_points: null,
        completed_story_points: null,
        created_by: null,
        project_id: null,
      });
      setIsCreateOpen(false);
      setNewSprint({ 
        name: '', 
        goal: '', 
        start_date: format(new Date(), 'yyyy-MM-dd'), 
        end_date: format(addDays(new Date(), 14), 'yyyy-MM-dd') 
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateStatus = async (id: string, status: 'planning' | 'active' | 'completed' | 'cancelled') => {
    try {
      await updateSprint.mutateAsync({ id, status });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSprint.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800"><Play className="h-3 w-3 mr-1" />Active</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled': return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default: return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Planning</Badge>;
    }
  };

  const getSprintProgress = (sprint: typeof sprints[0]) => {
    const total = sprint.total_story_points || 0;
    const completed = sprint.completed_story_points || 0;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };
  
  const getDaysRemaining = (endDate: string) => differenceInDays(new Date(endDate), new Date());
  const filteredSprints = sprints?.filter(s => filter === 'all' || s.status === filter) || [];
  const activeSprints = sprints?.filter(s => s.status === 'active').length || 0;
  const completedSprints = sprints?.filter(s => s.status === 'completed').length || 0;
  const totalPoints = sprints?.reduce((sum, s) => sum + (s.total_story_points || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-primary" />Sprint Planning</h1>
          <p className="text-muted-foreground">Manage agile sprints and track velocity</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Sprint</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Sprint</DialogTitle><DialogDescription>Plan a new sprint</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Sprint Name</Label><Input placeholder="Sprint 1" value={newSprint.name} onChange={(e) => setNewSprint(prev => ({ ...prev, name: e.target.value }))} /></div>
                <div><Label>Sprint Goal</Label><Textarea placeholder="Define the objective..." value={newSprint.goal} onChange={(e) => setNewSprint(prev => ({ ...prev, goal: e.target.value }))} rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Start Date</Label><Input type="date" value={newSprint.start_date} onChange={(e) => setNewSprint(prev => ({ ...prev, start_date: e.target.value }))} /></div>
                  <div><Label>End Date</Label><Input type="date" value={newSprint.end_date} onChange={(e) => setNewSprint(prev => ({ ...prev, end_date: e.target.value }))} /></div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateSprint} 
                  disabled={!newSprint.name || createSprint.isPending}
                >
                  {createSprint.isPending ? 'Creating...' : 'Create Sprint'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle><Play className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{activeSprints}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle><CheckCircle className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{completedSprints}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Points</CardTitle><BarChart3 className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalPoints}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Velocity</CardTitle><Target className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{sprints?.reduce((sum, s) => sum + (s.completed_story_points || 0), 0) || 0}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Sprints</CardTitle><CardDescription>View and manage your team's sprints</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredSprints.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Sprint</TableHead><TableHead>Duration</TableHead><TableHead>Progress</TableHead><TableHead>Status</TableHead><TableHead>Days Left</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredSprints.map((sprint) => (
                  <TableRow key={sprint.id}>
                    <TableCell><div className="font-medium">{sprint.name}</div>{sprint.goal && <div className="text-sm text-muted-foreground line-clamp-1">{sprint.goal}</div>}</TableCell>
                    <TableCell><div className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3" />{format(new Date(sprint.start_date), 'MMM dd')} - {format(new Date(sprint.end_date), 'MMM dd')}</div></TableCell>
                    <TableCell><div className="space-y-1"><div className="flex justify-between text-sm"><span>{sprint.completed_story_points || 0}/{sprint.total_story_points || 0} pts</span><span>{getSprintProgress(sprint)}%</span></div><Progress value={getSprintProgress(sprint)} className="h-2" /></div></TableCell>
                    <TableCell>{getStatusBadge(sprint.status)}</TableCell>
                    <TableCell>{sprint.status === 'active' ? <Badge variant={getDaysRemaining(sprint.end_date) <= 2 ? 'destructive' : 'outline'}>{getDaysRemaining(sprint.end_date)} days</Badge> : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {sprint.status === 'planning' && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(sprint.id, 'active')}><Play className="h-3 w-3 mr-1" />Start</Button>}
                        {sprint.status === 'active' && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(sprint.id, 'completed')}><CheckCircle className="h-3 w-3 mr-1" />Complete</Button>}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(sprint.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No sprints found</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
