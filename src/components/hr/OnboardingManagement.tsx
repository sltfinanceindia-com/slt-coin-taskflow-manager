import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding, type OnboardingRecord } from '@/hooks/useOnboarding';
import { format } from 'date-fns';
import { 
  UserPlus, Plus, CheckCircle, Clock, AlertCircle, 
  Users, Calendar, Loader2
} from 'lucide-react';

export function OnboardingManagement() {
  const { profile } = useAuth();
  const { 
    onboardingRecords, 
    isLoading, 
    createOnboarding, 
    toggleTask 
  } = useOnboarding();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newOnboarding, setNewOnboarding] = useState({
    employee_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    buddy_id: '',
    notes: '',
  });

  // Fetch new employees (recently joined or pending onboarding)
  const { data: newEmployees } = useQuery({
    queryKey: ['new-employees', profile?.organization_id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, department, start_date, created_at')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch all employees for buddy selection
  const { data: allEmployees } = useQuery({
    queryKey: ['all-employees', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const handleCreateOnboarding = async () => {
    if (!newOnboarding.employee_id) return;
    
    await createOnboarding.mutateAsync({
      employee_id: newOnboarding.employee_id,
      start_date: newOnboarding.start_date,
      buddy_id: newOnboarding.buddy_id || undefined,
      notes: newOnboarding.notes || undefined,
    });
    
    setIsCreateOpen(false);
    setNewOnboarding({
      employee_id: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      buddy_id: '',
      notes: '',
    });
  };

  const handleTaskToggle = async (taskId: string, currentValue: boolean) => {
    await toggleTask.mutateAsync({ taskId, isCompleted: !currentValue });
  };

  const getProgressPercentage = (record: OnboardingRecord) => {
    const tasks = record.tasks || [];
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRecords = onboardingRecords.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  // Stats
  const totalOnboarding = onboardingRecords.length;
  const inProgress = onboardingRecords.filter(r => r.status === 'in_progress').length;
  const completed = onboardingRecords.filter(r => r.status === 'completed').length;
  const newJoinees = newEmployees?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Employee Onboarding
          </h1>
          <p className="text-muted-foreground">Manage onboarding checklists and new hire setup</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initiate Onboarding</DialogTitle>
                <DialogDescription>Start the onboarding process for a new employee</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>New Employee</Label>
                  <Select 
                    value={newOnboarding.employee_id} 
                    onValueChange={(v) => setNewOnboarding(prev => ({ ...prev, employee_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {newEmployees?.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name} - {e.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={newOnboarding.start_date}
                    onChange={(e) => setNewOnboarding(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Assign Buddy (Optional)</Label>
                  <Select 
                    value={newOnboarding.buddy_id} 
                    onValueChange={(v) => setNewOnboarding(prev => ({ ...prev, buddy_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select buddy" />
                    </SelectTrigger>
                    <SelectContent>
                      {allEmployees?.filter(e => e.id !== newOnboarding.employee_id).map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Any special instructions or notes..."
                    value={newOnboarding.notes}
                    onChange={(e) => setNewOnboarding(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateOnboarding}
                  disabled={!newOnboarding.employee_id || createOnboarding.isPending}
                >
                  {createOnboarding.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Start Onboarding'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Joinees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newJoinees}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
            <p className="text-xs text-muted-foreground">Ongoing onboarding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <p className="text-xs text-muted-foreground">Successfully onboarded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnboarding}</div>
            <p className="text-xs text-muted-foreground">All onboarding records</p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Records */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>Track and manage employee onboarding checklists</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="border">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={record.employee?.avatar_url || undefined} />
                          <AvatarFallback>{record.employee?.full_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{record.employee?.full_name || 'Unknown'}</CardTitle>
                          <CardDescription>{record.employee?.email}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(record.status)}
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(record.start_date), 'MMM dd, yyyy')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{getProgressPercentage(record)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(record)} />
                      </div>
                      
                      {record.buddy && (
                        <div className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Buddy: {record.buddy.full_name}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {record.tasks?.map(task => (
                          <div 
                            key={task.id} 
                            className="flex items-center gap-2 p-2 rounded border bg-muted/30"
                          >
                            <Checkbox 
                              checked={task.is_completed}
                              onCheckedChange={() => handleTaskToggle(task.id, task.is_completed)}
                              disabled={toggleTask.isPending}
                            />
                            <div className="flex-1">
                              <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                                {task.name}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">{task.category}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No onboarding records found</p>
              <p className="text-sm">Start onboarding for new employees</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
