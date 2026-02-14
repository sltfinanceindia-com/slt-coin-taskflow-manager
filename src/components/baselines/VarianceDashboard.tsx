import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBaselines, VarianceMetrics } from '@/hooks/useBaselines';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { format } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function VarianceDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>('');
  const [variance, setVariance] = useState<VarianceMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { projects } = useEnhancedProjects();
  const { baselines, calculateVariance } = useBaselines(selectedProjectId);

  useEffect(() => {
    if (selectedProjectId) {
      loadVariance();
    }
  }, [selectedProjectId, selectedBaselineId]);

  const loadVariance = async () => {
    if (!selectedProjectId) return;
    
    setIsCalculating(true);
    const data = await calculateVariance(
      selectedProjectId, 
      selectedBaselineId || undefined
    );
    setVariance(data);
    setIsCalculating(false);
  };

  const getVarianceColor = (value: number) => {
    if (value > 10) return 'text-destructive';
    if (value > 0) return 'text-yellow-600';
    if (value < -10) return 'text-green-600';
    return 'text-muted-foreground';
  };

  const getVarianceBadge = (value: number) => {
    if (value > 10) return <Badge variant="destructive">Over Budget</Badge>;
    if (value > 0) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Slightly Over</Badge>;
    if (value < -10) return <Badge variant="default" className="bg-green-500">Under Budget</Badge>;
    return <Badge variant="secondary">On Track</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Variance Dashboard</h2>
        <p className="text-muted-foreground">
          Compare actual progress against baseline plan
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
                <label className="text-sm font-medium mb-2 block">Compare Against</label>
                <Select value={selectedBaselineId} onValueChange={setSelectedBaselineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Current baseline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Current Baseline</SelectItem>
                    {baselines.map((baseline) => (
                      <SelectItem key={baseline.id} value={baseline.id}>
                        {baseline.name} ({format(new Date(baseline.baseline_date), 'MMM d')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCalculating ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : variance ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Effort Variance"
              value={`${variance.effort_variance >= 0 ? '+' : ''}${variance.effort_variance.toFixed(1)}h`}
              subtitle={`${variance.effort_variance_pct >= 0 ? '+' : ''}${variance.effort_variance_pct.toFixed(1)}%`}
              icon={variance.effort_variance > 0 ? TrendingUp : TrendingDown}
              badge={getVarianceBadge(variance.effort_variance_pct)}
              valueColor={getVarianceColor(variance.effort_variance_pct)}
            />

            <MetricCard
              title="Schedule Variance"
              value={`${variance.schedule_variance_days >= 0 ? '+' : ''}${variance.schedule_variance_days} days`}
              subtitle={variance.current_end_date ? 
                `Current: ${format(new Date(variance.current_end_date), 'MMM d')}` : 
                'No end date'
              }
              icon={Calendar}
              badge={variance.schedule_variance_days > 0 ? 
                <Badge variant="destructive">Behind</Badge> : 
                <Badge variant="default" className="bg-green-500">On/Ahead</Badge>
              }
              valueColor={variance.schedule_variance_days > 0 ? 'text-destructive' : 'text-green-600'}
            />

            <MetricCard
              title="Completion Rate"
              value={`${variance.completion_rate.toFixed(0)}%`}
              subtitle={`${variance.tasks_on_track + variance.tasks_behind + variance.tasks_ahead} total tasks`}
              icon={Target}
              progress={variance.completion_rate}
            />

            <MetricCard
              title="Hours Logged"
              value={`${variance.actual_hours.toFixed(1)}h`}
              subtitle={`of ${variance.baseline_hours.toFixed(1)}h planned`}
              icon={Clock}
              progress={(variance.actual_hours / variance.baseline_hours) * 100}
            />
          </div>

          {/* Task Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Task Health</CardTitle>
              <CardDescription>Status of tasks compared to baseline schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{variance.tasks_on_track}</p>
                    <p className="text-sm text-muted-foreground">On Track</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{variance.tasks_behind}</p>
                    <p className="text-sm text-muted-foreground">Behind Schedule</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{variance.tasks_ahead}</p>
                    <p className="text-sm text-muted-foreground">Ahead of Schedule</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : selectedProjectId && baselines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Baseline Found</h3>
            <p className="text-muted-foreground">
              Create a baseline snapshot first to track variance.
            </p>
          </CardContent>
        </Card>
      ) : !selectedProjectId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a project to view variance metrics
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  valueColor,
  progress,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  badge?: React.ReactNode;
  valueColor?: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className={`text-2xl font-bold ${valueColor || ''}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {badge && <div>{badge}</div>}
          {progress !== undefined && (
            <Progress value={Math.min(progress, 100)} className="h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
