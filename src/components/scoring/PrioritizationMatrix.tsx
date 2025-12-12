import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useScoringModels, useProjectScores } from '@/hooks/useScoringModels';
import { Crosshair } from 'lucide-react';

interface MatrixProject {
  id: string;
  name: string;
  impact: number;
  effort: number;
  score: number;
}

export function PrioritizationMatrix() {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [impactCriterion, setImpactCriterion] = useState<string>('impact');
  const [effortCriterion, setEffortCriterion] = useState<string>('effort');

  const { models } = useScoringModels();
  const { scores } = useProjectScores(selectedModelId);

  const selectedModel = models.find(m => m.id === selectedModelId);
  const criteria = selectedModel?.criteria || [];

  // Set default model
  useEffect(() => {
    const defaultModel = models.find(m => m.is_default);
    if (defaultModel && !selectedModelId) {
      setSelectedModelId(defaultModel.id);
    }
  }, [models]);

  // Map scores to matrix format
  const matrixProjects = useMemo<MatrixProject[]>(() => {
    return scores
      .filter(s => s.project)
      .map(s => ({
        id: s.project_id,
        name: s.project?.name || 'Unknown',
        impact: s.criteria_scores[impactCriterion] || 0,
        effort: s.criteria_scores[effortCriterion] || 0,
        score: s.total_score,
      }));
  }, [scores, impactCriterion, effortCriterion]);

  const getQuadrant = (impact: number, effort: number, maxScale: number) => {
    const midPoint = maxScale / 2;
    if (impact >= midPoint && effort < midPoint) return 'quick-wins';
    if (impact >= midPoint && effort >= midPoint) return 'major-projects';
    if (impact < midPoint && effort < midPoint) return 'fill-ins';
    return 'thankless';
  };

  const maxScale = criteria.find(c => c.name === impactCriterion)?.scale_max || 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Prioritization Matrix</h2>
        <p className="text-muted-foreground">
          Visual 2x2 matrix for quick prioritization decisions
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scoring Model</label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Y-Axis (Impact)</label>
              <Select value={impactCriterion} onValueChange={setImpactCriterion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criteria.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">X-Axis (Effort)</label>
              <Select value={effortCriterion} onValueChange={setEffortCriterion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criteria.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="h-5 w-5" />
            Impact vs Effort Matrix
          </CardTitle>
          <CardDescription>
            {matrixProjects.length} projects plotted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full max-w-2xl mx-auto border-2 rounded-lg overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {/* Quick Wins - High Impact, Low Effort */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border-r border-b flex items-start justify-end p-2">
                <Badge variant="default" className="bg-emerald-500">Quick Wins</Badge>
              </div>
              {/* Major Projects - High Impact, High Effort */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border-b flex items-start justify-end p-2">
                <Badge variant="default" className="bg-blue-500">Major Projects</Badge>
              </div>
              {/* Fill-ins - Low Impact, Low Effort */}
              <div className="bg-gray-50 dark:bg-gray-950/30 border-r flex items-start justify-end p-2">
                <Badge variant="secondary">Fill-ins</Badge>
              </div>
              {/* Thankless Tasks - Low Impact, High Effort */}
              <div className="bg-red-50 dark:bg-red-950/30 flex items-start justify-end p-2">
                <Badge variant="destructive">Avoid</Badge>
              </div>
            </div>

            {/* Axis Labels */}
            <div className="absolute -left-8 top-1/2 -rotate-90 text-sm font-medium text-muted-foreground whitespace-nowrap">
              ← Low Impact | High Impact →
            </div>
            <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground whitespace-nowrap">
              ← Low Effort | High Effort →
            </div>

            {/* Project Dots */}
            {matrixProjects.map((project) => {
              const x = (project.effort / maxScale) * 100;
              const y = 100 - (project.impact / maxScale) * 100;
              const quadrant = getQuadrant(project.impact, project.effort, maxScale);

              return (
                <div
                  key={project.id}
                  className="absolute group"
                  style={{
                    left: `${Math.min(Math.max(x, 5), 95)}%`,
                    top: `${Math.min(Math.max(y, 5), 95)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-background shadow-md cursor-pointer transition-transform hover:scale-150 ${
                      quadrant === 'quick-wins' ? 'bg-emerald-500' :
                      quadrant === 'major-projects' ? 'bg-blue-500' :
                      quadrant === 'fill-ins' ? 'bg-gray-400' : 'bg-red-500'
                    }`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg px-3 py-2 text-sm whitespace-nowrap">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-muted-foreground">
                        Score: {project.score} | I:{project.impact} E:{project.effort}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuadrantLegend
              color="bg-emerald-500"
              title="Quick Wins"
              description="High impact, low effort - Do first"
              count={matrixProjects.filter(p => getQuadrant(p.impact, p.effort, maxScale) === 'quick-wins').length}
            />
            <QuadrantLegend
              color="bg-blue-500"
              title="Major Projects"
              description="High impact, high effort - Plan carefully"
              count={matrixProjects.filter(p => getQuadrant(p.impact, p.effort, maxScale) === 'major-projects').length}
            />
            <QuadrantLegend
              color="bg-gray-400"
              title="Fill-ins"
              description="Low impact, low effort - If time permits"
              count={matrixProjects.filter(p => getQuadrant(p.impact, p.effort, maxScale) === 'fill-ins').length}
            />
            <QuadrantLegend
              color="bg-red-500"
              title="Avoid"
              description="Low impact, high effort - Reconsider"
              count={matrixProjects.filter(p => getQuadrant(p.impact, p.effort, maxScale) === 'thankless').length}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuadrantLegend({
  color,
  title,
  description,
  count,
}: {
  color: string;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-4 h-4 rounded-full ${color} mt-0.5`} />
      <div>
        <p className="font-medium">{title} ({count})</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
