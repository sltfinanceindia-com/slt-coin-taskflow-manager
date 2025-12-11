import React, { useState } from 'react';
import { useTaskDependencies, TaskDependency, CreateDependencyData } from '@/hooks/useTaskDependencies';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2, Plus, Trash2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDependencyManagerProps {
  projectId?: string;
}

const DEPENDENCY_TYPES = [
  { value: 'finish_to_start', label: 'Finish to Start (FS)', description: 'Task B starts after Task A finishes' },
  { value: 'start_to_start', label: 'Start to Start (SS)', description: 'Task B starts when Task A starts' },
  { value: 'finish_to_finish', label: 'Finish to Finish (FF)', description: 'Task B finishes when Task A finishes' },
  { value: 'start_to_finish', label: 'Start to Finish (SF)', description: 'Task B finishes when Task A starts' },
];

export function TaskDependencyManager({ projectId }: TaskDependencyManagerProps) {
  const { dependencies, isLoading, createDependency, deleteDependency, isCreating, isDeleting } = useTaskDependencies(projectId);
  const { tasks } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDependencyData>({
    predecessor_id: '',
    successor_id: '',
    dependency_type: 'finish_to_start',
    lag_days: 0,
  });

  const projectTasks = projectId 
    ? tasks.filter(t => t.project_id === projectId)
    : tasks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.predecessor_id || !formData.successor_id) return;
    
    createDependency(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          predecessor_id: '',
          successor_id: '',
          dependency_type: 'finish_to_start',
          lag_days: 0,
        });
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'assigned':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDependencyLabel = (type: string) => {
    return DEPENDENCY_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" />
          Task Dependencies
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Dependency</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Task Dependency</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Predecessor Task (must finish/start first)</Label>
                <Select
                  value={formData.predecessor_id}
                  onValueChange={(v) => setFormData({ ...formData, predecessor_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select predecessor task" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTasks
                      .filter(t => t.id !== formData.successor_id)
                      .map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dependency Type</Label>
                <Select
                  value={formData.dependency_type}
                  onValueChange={(v) => setFormData({ ...formData, dependency_type: v as CreateDependencyData['dependency_type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPENDENCY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Successor Task (depends on predecessor)</Label>
                <Select
                  value={formData.successor_id}
                  onValueChange={(v) => setFormData({ ...formData, successor_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select successor task" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTasks
                      .filter(t => t.id !== formData.predecessor_id)
                      .map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lag Days (delay between tasks)</Label>
                <Input
                  type="number"
                  value={formData.lag_days}
                  onChange={(e) => setFormData({ ...formData, lag_days: parseInt(e.target.value) || 0 })}
                  min={-30}
                  max={365}
                />
                <p className="text-xs text-muted-foreground">
                  Positive = delay, Negative = overlap allowed
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !formData.predecessor_id || !formData.successor_id}>
                  {isCreating ? 'Creating...' : 'Create Dependency'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {dependencies.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No Dependencies"
            description="Create task dependencies to define the order of work"
            actionLabel="Add Dependency"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                {/* Predecessor */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {dep.predecessor?.title || 'Unknown Task'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(dep.predecessor?.status || '')}>
                      {dep.predecessor?.status?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                    {dep.predecessor?.planned_end_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(dep.predecessor.planned_end_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dependency indicator */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs font-medium shrink-0">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">{getDependencyLabel(dep.dependency_type)}</span>
                  <span className="sm:hidden">
                    {dep.dependency_type.split('_').map(w => w[0].toUpperCase()).join('')}
                  </span>
                  {dep.lag_days !== 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {dep.lag_days > 0 ? `+${dep.lag_days}d` : `${dep.lag_days}d`}
                    </Badge>
                  )}
                </div>

                {/* Successor */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {dep.successor?.title || 'Unknown Task'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(dep.successor?.status || '')}>
                      {dep.successor?.status?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                    {dep.successor?.planned_start_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(dep.successor.planned_start_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Dependency?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the dependency between these tasks. The tasks themselves will not be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteDependency(dep.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Removing...' : 'Remove'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
