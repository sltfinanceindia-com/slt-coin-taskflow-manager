import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBaselines, TaskBaselineSnapshot } from '@/hooks/useBaselines';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { format, differenceInDays } from 'date-fns';
import { ArrowRight, Calendar, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export function BaselineComparisonChart() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>('');
  const [snapshots, setSnapshots] = useState<TaskBaselineSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { projects } = useEnhancedProjects();
  const { baselines, fetchBaselineSnapshots } = useBaselines(selectedProjectId);

  useEffect(() => {
    if (selectedBaselineId) {
      loadSnapshots();
    }
  }, [selectedBaselineId]);

  const loadSnapshots = async () => {
    if (!selectedBaselineId) return;
    
    setIsLoading(true);
    const data = await fetchBaselineSnapshots(selectedBaselineId);
    setSnapshots(data);
    setIsLoading(false);
  };

  const getDateVariance = (baselineDate: string | null, currentDate: string | null) => {
    if (!baselineDate || !currentDate) return null;
    return differenceInDays(new Date(currentDate), new Date(baselineDate));
  };

  const getHoursVariance = (baselineHours: number, currentHours: number | null) => {
    const current = currentHours || 0;
    return current - baselineHours;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Baseline Comparison</h2>
        <p className="text-muted-foreground">
          Compare task-level details between baseline and current plan
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={selectedProjectId} onValueChange={(v) => {
                setSelectedProjectId(v);
                setSelectedBaselineId('');
                setSnapshots([]);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProjectId && baselines.length > 0 && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Baseline</label>
                <Select value={selectedBaselineId} onValueChange={setSelectedBaselineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select baseline" />
                  </SelectTrigger>
                  <SelectContent>
                    {baselines.map((baseline) => (
                      <SelectItem key={baseline.id} value={baseline.id}>
                        {baseline.name} {baseline.is_current && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedBaselineId && (
        <Card>
          <CardHeader>
            <CardTitle>Task-Level Comparison</CardTitle>
            <CardDescription>
              Showing {snapshots.length} tasks from baseline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : snapshots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found in this baseline
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {snapshots.map((snapshot) => (
                    <TaskComparisonRow key={snapshot.id} snapshot={snapshot} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {selectedProjectId && baselines.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No baselines found for this project. Create one first.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskComparisonRow({ snapshot }: { snapshot: TaskBaselineSnapshot }) {
  const task = snapshot.task;
  if (!task) return null;

  const endDateVariance = snapshot.planned_end_date && task.planned_end_date
    ? differenceInDays(new Date(task.planned_end_date), new Date(snapshot.planned_end_date))
    : null;

  const hoursVariance = (task.estimated_hours || 0) - snapshot.estimated_hours;

  const getVarianceIcon = (value: number | null) => {
    if (value === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (value > 0) return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-emerald-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <Badge variant="default" className="bg-emerald-500">Done</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{task.title}</h4>
            {getStatusBadge(task.status)}
          </div>
        </div>

        {/* Date Comparison */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">
              {snapshot.planned_end_date 
                ? format(new Date(snapshot.planned_end_date), 'MMM d')
                : '-'
              }
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className={endDateVariance && endDateVariance > 0 ? 'text-destructive font-medium' : ''}>
              {task.planned_end_date 
                ? format(new Date(task.planned_end_date), 'MMM d')
                : '-'
              }
            </span>
            {endDateVariance !== null && endDateVariance !== 0 && (
              <Badge 
                variant={endDateVariance > 0 ? 'destructive' : 'default'}
                className={endDateVariance < 0 ? 'bg-emerald-500' : ''}
              >
                {endDateVariance > 0 ? '+' : ''}{endDateVariance}d
              </Badge>
            )}
          </div>
        </div>

        {/* Hours Comparison */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">{snapshot.estimated_hours}h</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className={hoursVariance > 0 ? 'text-destructive font-medium' : ''}>
              {task.estimated_hours || 0}h
            </span>
            {hoursVariance !== 0 && (
              <span className={`text-xs ${hoursVariance > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                ({hoursVariance > 0 ? '+' : ''}{hoursVariance}h)
              </span>
            )}
          </div>
        </div>

        {/* Variance Indicator */}
        <div className="flex items-center gap-2">
          {getVarianceIcon(endDateVariance)}
        </div>
      </div>
    </div>
  );
}
