import React, { useMemo } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertTriangle, Route, Clock, Calendar, ArrowRight, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { format, differenceInDays, parseISO, isPast, isToday } from 'date-fns';

interface CriticalPathViewProps {
  projectId?: string;
  onCalculate?: () => void;
}

interface ExtendedTask extends Task {
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  is_milestone?: boolean;
  is_critical?: boolean;
  progress_percentage?: number;
}

export function CriticalPathView({ projectId, onCalculate }: CriticalPathViewProps) {
  const { tasks, isLoading } = useTasks();
  const { dependencies, calculateCriticalPath } = useTaskDependencies(projectId);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const projectTasks = useMemo(() => {
    return (projectId 
      ? tasks.filter(t => t.project_id === projectId)
      : tasks) as ExtendedTask[];
  }, [tasks, projectId]);

  const criticalTasks = useMemo(() => {
    return projectTasks
      .filter(t => t.is_critical)
      .sort((a, b) => {
        const aDate = a.planned_start_date || a.start_date;
        const bDate = b.planned_start_date || b.start_date;
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
  }, [projectTasks]);

  const stats = useMemo(() => {
    const total = projectTasks.length;
    const critical = criticalTasks.length;
    const overdue = criticalTasks.filter(t => {
      const endDate = t.planned_end_date || t.end_date;
      return isPast(parseISO(endDate)) && !['completed', 'verified'].includes(t.status);
    }).length;
    const completed = criticalTasks.filter(t => ['completed', 'verified'].includes(t.status)).length;
    
    // Calculate total project duration from critical path
    if (criticalTasks.length > 0) {
      const firstStart = criticalTasks.reduce((min, t) => {
        const date = t.planned_start_date || t.start_date;
        return !min || new Date(date) < new Date(min) ? date : min;
      }, '' as string);
      
      const lastEnd = criticalTasks.reduce((max, t) => {
        const date = t.planned_end_date || t.end_date;
        return !max || new Date(date) > new Date(max) ? date : max;
      }, '' as string);
      
      const duration = differenceInDays(parseISO(lastEnd), parseISO(firstStart)) + 1;
      
      return { total, critical, overdue, completed, duration, firstStart, lastEnd };
    }
    
    return { total, critical, overdue, completed, duration: 0, firstStart: '', lastEnd: '' };
  }, [projectTasks, criticalTasks]);

  const handleCalculate = async () => {
    if (!projectId) return;
    setIsCalculating(true);
    await calculateCriticalPath(projectId);
    setIsCalculating(false);
    onCalculate?.();
  };

  const getSlackDays = (task: ExtendedTask) => {
    const endDate = task.planned_end_date || task.end_date;
    return differenceInDays(parseISO(endDate), new Date());
  };

  const getTaskStatusIcon = (task: ExtendedTask) => {
    if (['completed', 'verified'].includes(task.status)) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (task.is_critical) {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Route className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.duration}</p>
                <p className="text-xs text-muted-foreground">Days Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.critical > 0 ? Math.round((stats.completed / stats.critical) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Path Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5 text-primary" />
              Critical Path
            </CardTitle>
            <CardDescription>
              Tasks that directly impact project completion date
            </CardDescription>
          </div>
          {projectId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Recalculate</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {criticalTasks.length === 0 ? (
            <EmptyState
              icon={Route}
              title="No Critical Path"
              description={projectId 
                ? "Calculate the critical path to identify tasks that impact project completion"
                : "Select a project to view its critical path"
              }
              actionLabel={projectId ? "Calculate Now" : undefined}
              onAction={projectId ? handleCalculate : undefined}
            />
          ) : (
            <div className="space-y-4">
              {/* Timeline visualization */}
              <div className="relative">
                {criticalTasks.map((task, index) => {
                  const slackDays = getSlackDays(task);
                  const isOverdue = slackDays < 0 && !['completed', 'verified'].includes(task.status);
                  const isComplete = ['completed', 'verified'].includes(task.status);
                  
                  return (
                    <div key={task.id} className="relative">
                      {/* Connector line */}
                      {index < criticalTasks.length - 1 && (
                        <div className="absolute left-[18px] top-10 w-0.5 h-8 bg-border" />
                      )}
                      
                      <div className={`flex gap-4 p-4 rounded-lg border transition-colors ${
                        isOverdue ? 'border-destructive/50 bg-destructive/5' :
                        isComplete ? 'border-green-500/30 bg-green-500/5' :
                        'border-border hover:bg-accent/5'
                      }`}>
                        {/* Status icon */}
                        <div className="shrink-0 mt-0.5">
                          {getTaskStatusIcon(task)}
                        </div>

                        {/* Task details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge variant={isComplete ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            {task.is_milestone && (
                              <Badge variant="outline">Milestone</Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {format(parseISO(task.planned_start_date || task.start_date), 'MMM d')} 
                                {' → '}
                                {format(parseISO(task.planned_end_date || task.end_date), 'MMM d')}
                              </span>
                            </div>
                            {!isComplete && (
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {isOverdue 
                                    ? `${Math.abs(slackDays)} days overdue`
                                    : slackDays === 0 
                                      ? 'Due today'
                                      : `${slackDays} days remaining`
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progress bar */}
                          {task.progress_percentage !== undefined && (
                            <div className="flex items-center gap-3">
                              <Progress value={task.progress_percentage} className="flex-1 h-2" />
                              <span className="text-xs font-medium w-10">{task.progress_percentage}%</span>
                            </div>
                          )}
                        </div>

                        {/* Arrow to next task */}
                        {index < criticalTasks.length - 1 && (
                          <div className="hidden sm:flex items-center">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              {stats.firstStart && stats.lastEnd && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 justify-between">
                    <div>
                      <span className="text-muted-foreground">Project Start: </span>
                      <span className="font-medium">{format(parseISO(stats.firstStart), 'MMMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Project End: </span>
                      <span className="font-medium">{format(parseISO(stats.lastEnd), 'MMMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Duration: </span>
                      <span className="font-medium">{stats.duration} days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
