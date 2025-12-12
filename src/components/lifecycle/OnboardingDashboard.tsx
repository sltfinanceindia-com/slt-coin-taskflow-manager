import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlaybooks, LifecycleInstance } from '@/hooks/usePlaybooks';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { PlaybookInstanceView } from './PlaybookInstanceView';
import { 
  UserPlus, Calendar, Clock, CheckCircle2, AlertCircle, 
  Play, Eye, MoreHorizontal, User
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

export const OnboardingDashboard: React.FC = () => {
  const { playbooks, instances, instancesLoading, startInstance, useInstanceItems } = usePlaybooks();
  const { employees = [] } = useEmployeeDirectory();
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<LifecycleInstance | null>(null);
  const [newOnboarding, setNewOnboarding] = useState({
    playbookId: '',
    employeeId: '',
    targetDate: ''
  });

  const onboardingPlaybooks = playbooks.filter(p => p.type === 'onboarding' && p.is_active);
  const onboardingInstances = instances.filter(i => i.playbook?.type === 'onboarding');
  
  const activeOnboardings = onboardingInstances.filter(i => i.status === 'in_progress');
  const completedOnboardings = onboardingInstances.filter(i => i.status === 'completed');

  const handleStartOnboarding = () => {
    if (!newOnboarding.playbookId || !newOnboarding.employeeId) return;
    
    startInstance.mutate({
      playbookId: newOnboarding.playbookId,
      employeeId: newOnboarding.employeeId,
      targetDate: newOnboarding.targetDate || undefined
    });
    
    setIsStartDialogOpen(false);
    setNewOnboarding({ playbookId: '', employeeId: '', targetDate: '' });
  };

  const OnboardingCard = ({ instance }: { instance: LifecycleInstance }) => {
    const { data: items = [] } = useInstanceItems(instance.id);
    const completedCount = items.filter(i => i.completed_at).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    const daysRemaining = instance.target_completion_date 
      ? differenceInDays(new Date(instance.target_completion_date), new Date())
      : null;
    
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    const isNearDeadline = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;

    return (
      <Card className={cn(
        "transition-all hover:shadow-md",
        isOverdue && "border-destructive/50",
        isNearDeadline && !isOverdue && "border-yellow-500/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={instance.employee?.avatar_url} />
                <AvatarFallback>
                  {instance.employee?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {instance.employee?.full_name || 'Unknown Employee'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {instance.playbook?.name}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={instance.status === 'completed' ? 'default' : 'secondary'}
              className={cn(
                instance.status === 'in_progress' && isOverdue && "bg-destructive/10 text-destructive",
                instance.status === 'in_progress' && isNearDeadline && !isOverdue && "bg-yellow-500/10 text-yellow-600"
              )}
            >
              {instance.status === 'completed' ? (
                <><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</>
              ) : isOverdue ? (
                <><AlertCircle className="mr-1 h-3 w-3" /> Overdue</>
              ) : (
                <><Clock className="mr-1 h-3 w-3" /> In Progress</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount}/{totalCount} tasks</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Started {formatDistanceToNow(new Date(instance.started_at), { addSuffix: true })}</span>
            </div>
            {instance.target_completion_date && (
              <span className={cn(
                "text-xs",
                isOverdue ? "text-destructive" : isNearDeadline ? "text-yellow-600" : "text-muted-foreground"
              )}>
                {isOverdue 
                  ? `${Math.abs(daysRemaining!)} days overdue`
                  : daysRemaining === 0 
                    ? 'Due today'
                    : `${daysRemaining} days left`
                }
              </span>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setSelectedInstance(instance)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Onboarding Dashboard
          </h2>
          <p className="text-muted-foreground">Track and manage new employee onboarding</p>
        </div>
        
        <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={onboardingPlaybooks.length === 0}>
              <Play className="mr-2 h-4 w-4" />
              Start Onboarding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Onboarding</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select
                  value={newOnboarding.employeeId}
                  onValueChange={(value) => setNewOnboarding(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={emp.avatar_url} />
                            <AvatarFallback>{emp.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {emp.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Select Playbook</Label>
                <Select
                  value={newOnboarding.playbookId}
                  onValueChange={(value) => setNewOnboarding(prev => ({ ...prev, playbookId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose playbook..." />
                  </SelectTrigger>
                  <SelectContent>
                    {onboardingPlaybooks.map(pb => (
                      <SelectItem key={pb.id} value={pb.id}>
                        <div>
                          <span>{pb.name}</span>
                          {pb.role && (
                            <span className="ml-2 text-xs text-muted-foreground">({pb.role})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Target Completion Date (Optional)</Label>
                <Input
                  type="date"
                  value={newOnboarding.targetDate}
                  onChange={(e) => setNewOnboarding(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartOnboarding}
                  disabled={!newOnboarding.playbookId || !newOnboarding.employeeId || startInstance.isPending}
                >
                  Start Onboarding
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activeOnboardings.length}</p>
                <p className="text-sm text-muted-foreground">Active Onboardings</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{completedOnboardings.length}</p>
                <p className="text-sm text-muted-foreground">Completed This Month</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{onboardingPlaybooks.length}</p>
                <p className="text-sm text-muted-foreground">Active Playbooks</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <User className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Onboardings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Active Onboardings</h3>
        {instancesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeOnboardings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <UserPlus className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No active onboardings</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start a new onboarding process for a new hire
              </p>
              <Button onClick={() => setIsStartDialogOpen(true)} disabled={onboardingPlaybooks.length === 0}>
                <Play className="mr-2 h-4 w-4" />
                Start Onboarding
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeOnboardings.map(instance => (
              <OnboardingCard key={instance.id} instance={instance} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {completedOnboardings.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recently Completed</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedOnboardings.slice(0, 6).map(instance => (
              <OnboardingCard key={instance.id} instance={instance} />
            ))}
          </div>
        </div>
      )}

      {/* Instance Detail Dialog */}
      {selectedInstance && (
        <PlaybookInstanceView
          instance={selectedInstance}
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </div>
  );
};
