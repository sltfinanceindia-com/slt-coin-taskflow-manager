import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBaselines, VarianceMetrics } from '@/hooks/useBaselines';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { 
  Activity, 
  Shield, 
  TrendingUp, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface HealthScore {
  overall: number;
  schedule: number;
  effort: number;
  scope: number;
  level: 'healthy' | 'at-risk' | 'critical';
}

export function ProjectHealthScorecard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [variance, setVariance] = useState<VarianceMetrics | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { projects } = useEnhancedProjects();
  const { baselines, calculateVariance } = useBaselines(selectedProjectId);

  useEffect(() => {
    if (selectedProjectId) {
      loadHealth();
    }
  }, [selectedProjectId]);

  const loadHealth = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    const data = await calculateVariance(selectedProjectId);
    setVariance(data);
    
    if (data) {
      setHealthScore(calculateHealthScore(data));
    }
    setIsLoading(false);
  };

  const calculateHealthScore = (v: VarianceMetrics): HealthScore => {
    // Schedule score: 100 = on time, decreases with delays
    const scheduleScore = Math.max(0, 100 - Math.abs(v.schedule_variance_days) * 5);
    
    // Effort score: 100 = on budget, decreases with variance
    const effortScore = Math.max(0, 100 - Math.abs(v.effort_variance_pct) * 2);
    
    // Scope score: based on task health
    const totalTasks = v.tasks_on_track + v.tasks_behind + v.tasks_ahead;
    const scopeScore = totalTasks > 0 
      ? ((v.tasks_on_track + v.tasks_ahead) / totalTasks) * 100
      : 100;
    
    // Overall: weighted average
    const overall = (scheduleScore * 0.4) + (effortScore * 0.35) + (scopeScore * 0.25);
    
    let level: 'healthy' | 'at-risk' | 'critical';
    if (overall >= 70) level = 'healthy';
    else if (overall >= 40) level = 'at-risk';
    else level = 'critical';
    
    return { overall, schedule: scheduleScore, effort: effortScore, scope: scopeScore, level };
  };

  const getHealthIcon = (level: string) => {
    switch (level) {
      case 'healthy':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-8 w-8 text-destructive" />;
      default:
        return <Activity className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getHealthBadge = (level: string) => {
    switch (level) {
      case 'healthy':
        return <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>;
      case 'at-risk':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">At Risk</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Health Scorecard</h2>
        <p className="text-muted-foreground">
          Aggregated health indicators based on baseline variance
        </p>
      </div>

      {/* Project Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm">
            <label className="text-sm font-medium mb-2 block">Select Project</label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
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
        </CardContent>
      </Card>

      {healthScore && variance && (
        <>
          {/* Overall Health */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  {getHealthIcon(healthScore.level)}
                  <div>
                    <h3 className="text-4xl font-bold">{healthScore.overall.toFixed(0)}</h3>
                    <p className="text-muted-foreground">Overall Health Score</p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    {getHealthBadge(healthScore.level)}
                    <span className="text-sm text-muted-foreground">
                      {variance.completion_rate.toFixed(0)}% complete
                    </span>
                  </div>
                  <Progress 
                    value={healthScore.overall} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard
              title="Schedule Health"
              score={healthScore.schedule}
              icon={Clock}
              description={variance.schedule_variance_days === 0 
                ? 'On schedule' 
                : variance.schedule_variance_days > 0 
                  ? `${variance.schedule_variance_days} days behind`
                  : `${Math.abs(variance.schedule_variance_days)} days ahead`
              }
            />
            
            <ScoreCard
              title="Effort Health"
              score={healthScore.effort}
              icon={TrendingUp}
              description={variance.effort_variance_pct === 0
                ? 'On budget'
                : variance.effort_variance_pct > 0
                  ? `${variance.effort_variance_pct.toFixed(1)}% over budget`
                  : `${Math.abs(variance.effort_variance_pct).toFixed(1)}% under budget`
              }
            />
            
            <ScoreCard
              title="Scope Health"
              score={healthScore.scope}
              icon={Target}
              description={`${variance.tasks_on_track + variance.tasks_ahead} of ${variance.tasks_on_track + variance.tasks_behind + variance.tasks_ahead} tasks on track`}
            />
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Health Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {healthScore.schedule < 70 && (
                  <li className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Schedule at risk</p>
                      <p className="text-sm text-muted-foreground">
                        Consider re-prioritizing tasks or adding resources to critical path items.
                      </p>
                    </div>
                  </li>
                )}
                {healthScore.effort < 70 && (
                  <li className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Effort variance detected</p>
                      <p className="text-sm text-muted-foreground">
                        Review time logs and adjust estimates for remaining tasks.
                      </p>
                    </div>
                  </li>
                )}
                {variance.tasks_behind > 0 && (
                  <li className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">{variance.tasks_behind} task(s) behind schedule</p>
                      <p className="text-sm text-muted-foreground">
                        Focus on completing overdue tasks or update their deadlines.
                      </p>
                    </div>
                  </li>
                )}
                {healthScore.level === 'healthy' && (
                  <li className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Project is on track</p>
                      <p className="text-sm text-muted-foreground">
                        Continue monitoring and maintain current pace.
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {selectedProjectId && baselines.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Baseline Available</h3>
            <p className="text-muted-foreground">
              Create a baseline to enable health scoring.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreCard({ 
  title, 
  score, 
  icon: Icon, 
  description 
}: { 
  title: string; 
  score: number; 
  icon: any; 
  description: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-destructive';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(0)}
          </span>
        </div>
        <Progress value={score} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
