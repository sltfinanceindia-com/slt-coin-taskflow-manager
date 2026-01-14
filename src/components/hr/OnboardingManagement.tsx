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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { 
  UserPlus, Plus, CheckCircle, Clock, AlertCircle, 
  FileText, Laptop, Mail, Users, Calendar
} from 'lucide-react';

interface OnboardingTask {
  id: string;
  name: string;
  category: string;
  is_completed: boolean;
}

interface OnboardingRecord {
  id: string;
  employee_id: string;
  start_date: string;
  status: string;
  tasks: OnboardingTask[];
  buddy_id: string | null;
  notes: string | null;
  employee?: { full_name: string; email: string; avatar_url: string | null; department: string | null };
  buddy?: { full_name: string } | null;
}

const DEFAULT_ONBOARDING_TASKS: OnboardingTask[] = [
  { id: '1', name: 'Complete employment documents', category: 'Documentation', is_completed: false },
  { id: '2', name: 'ID card generation', category: 'Documentation', is_completed: false },
  { id: '3', name: 'Setup email account', category: 'IT Setup', is_completed: false },
  { id: '4', name: 'Laptop/workstation setup', category: 'IT Setup', is_completed: false },
  { id: '5', name: 'Access card/biometric enrollment', category: 'Access', is_completed: false },
  { id: '6', name: 'System access provisioning', category: 'Access', is_completed: false },
  { id: '7', name: 'Introduction to team', category: 'Orientation', is_completed: false },
  { id: '8', name: 'Company policies walkthrough', category: 'Orientation', is_completed: false },
  { id: '9', name: 'Buddy assignment meeting', category: 'Orientation', is_completed: false },
  { id: '10', name: 'First week training schedule', category: 'Training', is_completed: false },
];

export function OnboardingManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingRecord | null>(null);
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

  // Mock onboarding records (would be stored in a dedicated table in production)
  const [onboardingRecords, setOnboardingRecords] = useState<OnboardingRecord[]>([]);

  // Create onboarding record
  const handleCreateOnboarding = () => {
    const employee = newEmployees?.find(e => e.id === newOnboarding.employee_id);
    const buddy = allEmployees?.find(e => e.id === newOnboarding.buddy_id);
    
    if (!employee) return;

    const newRecord: OnboardingRecord = {
      id: Date.now().toString(),
      employee_id: newOnboarding.employee_id,
      start_date: newOnboarding.start_date,
      status: 'in_progress',
      tasks: [...DEFAULT_ONBOARDING_TASKS],
      buddy_id: newOnboarding.buddy_id || null,
      notes: newOnboarding.notes || null,
      employee: {
        full_name: employee.full_name,
        email: employee.email,
        avatar_url: employee.avatar_url,
        department: employee.department,
      },
      buddy: buddy ? { full_name: buddy.full_name } : null,
    };

    setOnboardingRecords(prev => [...prev, newRecord]);
    setIsCreateOpen(false);
    setNewOnboarding({
      employee_id: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      buddy_id: '',
      notes: '',
    });
    toast({ title: 'Onboarding initiated successfully' });
  };

  // Update task completion
  const handleTaskToggle = (recordId: string, taskId: string) => {
    setOnboardingRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const updatedTasks = record.tasks.map(task => 
          task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
        );
        const completedCount = updatedTasks.filter(t => t.is_completed).length;
        const status = completedCount === updatedTasks.length ? 'completed' : 'in_progress';
        return { ...record, tasks: updatedTasks, status };
      }
      return record;
    }));
  };

  const getProgressPercentage = (tasks: OnboardingTask[]) => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
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
                  disabled={!newOnboarding.employee_id}
                >
                  Start Onboarding
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={record.employee?.avatar_url || undefined} />
                          <AvatarFallback>{record.employee?.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{record.employee?.full_name}</CardTitle>
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
                          <span>{getProgressPercentage(record.tasks)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(record.tasks)} />
                      </div>
                      
                      {record.buddy && (
                        <div className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Buddy: {record.buddy.full_name}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {record.tasks.map(task => (
                          <div 
                            key={task.id} 
                            className="flex items-center gap-2 p-2 rounded border bg-muted/30"
                          >
                            <Checkbox 
                              checked={task.is_completed}
                              onCheckedChange={() => handleTaskToggle(record.id, task.id)}
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
