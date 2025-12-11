import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePerformanceImprovementPlans, usePIPDetails } from '@/hooks/usePerformanceManagement';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { Plus, AlertTriangle, Target, Calendar, ChevronDown, ChevronRight, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PIPManagement() {
  const { pips, isLoading, createPIP, updatePIP } = usePerformanceImprovementPlans();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPIP, setSelectedPIP] = useState<string | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    employee_id: '',
    title: '',
    reason: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async () => {
    await createPIP.mutateAsync({
      ...formData,
      manager_id: profile?.id || '',
    });
    setDialogOpen(false);
    setFormData({
      employee_id: '',
      title: '',
      reason: '',
      start_date: '',
      end_date: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      active: { variant: 'default', label: 'Active', className: 'bg-yellow-500' },
      extended: { variant: 'default', label: 'Extended', className: 'bg-orange-500' },
      completed_success: { variant: 'default', label: 'Success', className: 'bg-green-500' },
      completed_failure: { variant: 'destructive', label: 'Failed' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const activePIPs = pips.filter((p: any) => ['active', 'extended'].includes(p.status));
  const completedPIPs = pips.filter((p: any) => ['completed_success', 'completed_failure', 'cancelled'].includes(p.status));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Performance Improvement Plans</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Create and manage structured improvement plans for employees
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New PIP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Performance Improvement Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee</Label>
                  <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter((e: any) => e.id !== profile?.id).map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Plan Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Performance Improvement Plan - Q4 2024"
                  />
                </div>
                <div>
                  <Label>Reason for PIP</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Detailed explanation of performance concerns..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={createPIP.isPending} className="w-full">
                  Create PIP
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active PIPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{activePIPs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {pips.filter((p: any) => p.status === 'completed_success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PIPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pips.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active ({activePIPs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedPIPs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activePIPs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Active PIPs</h3>
                <p className="text-muted-foreground">All team members are performing well.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePIPs.map((pip: any) => (
                <PIPCard 
                  key={pip.id} 
                  pip={pip} 
                  onSelect={() => setSelectedPIP(pip.id === selectedPIP ? null : pip.id)}
                  isSelected={selectedPIP === pip.id}
                  onUpdate={updatePIP.mutateAsync}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedPIPs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Completed PIPs</h3>
                <p className="text-muted-foreground">Completed PIPs will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedPIPs.map((pip: any) => (
                <PIPCard 
                  key={pip.id} 
                  pip={pip} 
                  onSelect={() => setSelectedPIP(pip.id === selectedPIP ? null : pip.id)}
                  isSelected={selectedPIP === pip.id}
                  onUpdate={updatePIP.mutateAsync}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PIPCard({ pip, onSelect, isSelected, onUpdate, isAdmin }: any) {
  const daysRemaining = differenceInDays(new Date(pip.end_date), new Date());
  const totalDays = differenceInDays(new Date(pip.end_date), new Date(pip.start_date));
  const daysElapsed = totalDays - daysRemaining;
  const progressPercentage = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      draft: { variant: 'secondary' },
      active: { variant: 'default', className: 'bg-yellow-500' },
      extended: { variant: 'default', className: 'bg-orange-500' },
      completed_success: { variant: 'default', className: 'bg-green-500' },
      completed_failure: { variant: 'destructive' },
      cancelled: { variant: 'outline' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant} className={config.className}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <Card>
      <Collapsible open={isSelected} onOpenChange={onSelect}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isSelected ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={pip.employee?.avatar_url} />
                  <AvatarFallback>{pip.employee?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {pip.title}
                    {getStatusBadge(pip.status)}
                  </CardTitle>
                  <CardDescription>
                    {pip.employee?.full_name} • Manager: {pip.manager?.full_name}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                {pip.status === 'active' && (
                  <>
                    <div className="text-lg font-bold">
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </div>
                    <Progress value={progressPercentage} className="w-24 h-2" />
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t pt-4">
            <PIPDetailsPanel pipId={pip.id} pip={pip} onUpdate={onUpdate} isAdmin={isAdmin} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function PIPDetailsPanel({ pipId, pip, onUpdate, isAdmin }: { pipId: string; pip: any; onUpdate: any; isAdmin: boolean }) {
  const { goals, checkIns, isLoading, addGoal, updateGoal, addCheckIn } = usePIPDetails(pipId);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    success_criteria: '',
    target_date: '',
  });
  const [checkInFormData, setCheckInFormData] = useState({
    check_in_date: format(new Date(), 'yyyy-MM-dd'),
    manager_notes: '',
    overall_progress: '' as string,
    next_steps: '',
  });

  const handleAddGoal = async () => {
    await addGoal.mutateAsync(goalFormData);
    setGoalDialogOpen(false);
    setGoalFormData({ title: '', description: '', success_criteria: '', target_date: '' });
  };

  const handleAddCheckIn = async () => {
    await addCheckIn.mutateAsync(checkInFormData);
    setCheckInDialogOpen(false);
    setCheckInFormData({ check_in_date: format(new Date(), 'yyyy-MM-dd'), manager_notes: '', overall_progress: '', next_steps: '' });
  };

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'meeting_expectations': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-2">Reason for PIP</h4>
        <p className="text-muted-foreground">{pip.reason}</p>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Start: {format(new Date(pip.start_date), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>End: {format(new Date(pip.end_date), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins ({checkIns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-4 space-y-4">
          {isAdmin && (
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Improvement Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Title</Label>
                    <Input
                      value={goalFormData.title}
                      onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                      placeholder="Improve code quality"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={goalFormData.description}
                      onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                      placeholder="Detailed description of the goal..."
                    />
                  </div>
                  <div>
                    <Label>Success Criteria</Label>
                    <Textarea
                      value={goalFormData.success_criteria}
                      onChange={(e) => setGoalFormData({ ...goalFormData, success_criteria: e.target.value })}
                      placeholder="How will success be measured..."
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={goalFormData.target_date}
                      onChange={(e) => setGoalFormData({ ...goalFormData, target_date: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddGoal} disabled={addGoal.isPending} className="w-full">
                    Add Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {goals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No goals defined yet.</p>
          ) : (
            goals.map((goal: any) => (
              <div key={goal.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{goal.title}</span>
                  <Badge variant={goal.status === 'achieved' ? 'default' : 'secondary'}>
                    {goal.status}
                  </Badge>
                </div>
                {goal.description && <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>}
                <p className="text-sm"><strong>Success Criteria:</strong> {goal.success_criteria}</p>
                {goal.target_date && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="checkins" className="mt-4 space-y-4">
          {isAdmin && (
            <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Check-in
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Check-in</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Check-in Date</Label>
                    <Input
                      type="date"
                      value={checkInFormData.check_in_date}
                      onChange={(e) => setCheckInFormData({ ...checkInFormData, check_in_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Overall Progress</Label>
                    <Select 
                      value={checkInFormData.overall_progress} 
                      onValueChange={(v) => setCheckInFormData({ ...checkInFormData, overall_progress: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select progress status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="improving">Improving</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="declining">Declining</SelectItem>
                        <SelectItem value="meeting_expectations">Meeting Expectations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Manager Notes</Label>
                    <Textarea
                      value={checkInFormData.manager_notes}
                      onChange={(e) => setCheckInFormData({ ...checkInFormData, manager_notes: e.target.value })}
                      placeholder="Observations and feedback..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Next Steps</Label>
                    <Textarea
                      value={checkInFormData.next_steps}
                      onChange={(e) => setCheckInFormData({ ...checkInFormData, next_steps: e.target.value })}
                      placeholder="Action items for next period..."
                    />
                  </div>
                  <Button onClick={handleAddCheckIn} disabled={addCheckIn.isPending} className="w-full">
                    Record Check-in
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {checkIns.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No check-ins recorded yet.</p>
          ) : (
            checkIns.map((checkIn: any) => (
              <div key={checkIn.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {format(new Date(checkIn.check_in_date), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-2">
                    {getProgressIcon(checkIn.overall_progress)}
                    <span className="capitalize">{checkIn.overall_progress?.replace('_', ' ')}</span>
                  </div>
                </div>
                {checkIn.manager_notes && (
                  <p className="text-sm mb-2"><strong>Notes:</strong> {checkIn.manager_notes}</p>
                )}
                {checkIn.next_steps && (
                  <p className="text-sm text-muted-foreground"><strong>Next Steps:</strong> {checkIn.next_steps}</p>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {isAdmin && pip.status === 'active' && (
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onUpdate({ id: pip.id, status: 'completed_success' })}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark as Success
          </Button>
          <Button 
            variant="destructive"
            onClick={() => onUpdate({ id: pip.id, status: 'completed_failure' })}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Mark as Failed
          </Button>
          <Button 
            variant="outline"
            onClick={() => onUpdate({ id: pip.id, status: 'extended' })}
          >
            Extend PIP
          </Button>
        </div>
      )}
    </div>
  );
}
