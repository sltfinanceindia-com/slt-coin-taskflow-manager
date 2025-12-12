import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Award, Layers } from 'lucide-react';
import { useScoringModels, useProjectScores } from '@/hooks/useScoringModels';
import { useProjects } from '@/hooks/useProjects';
import { useState, useMemo } from 'react';

interface ProjectScore {
  projectId: string;
  projectName: string;
  projectStatus: string;
  totalScore: number;
  criteriaScores: Record<string, number>;
}

interface ScoreComparisonChartProps {
  selectedProjectIds?: string[];
  scoringModelId?: string;
}

const CHART_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
];

function RadarChartVisual({ 
  projects, 
  criteria 
}: { 
  projects: ProjectScore[]; 
  criteria: string[];
}) {
  const maxScore = 5;
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  
  // Calculate points for each criterion
  const angleStep = (2 * Math.PI) / criteria.length;
  
  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxScore) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // Generate polygon points for each project
  const projectPolygons = projects.map((project, pIndex) => {
    const points = criteria.map((criterion, cIndex) => {
      const score = project.criteriaScores[criterion] || 0;
      return getPoint(score, cIndex);
    });
    
    return {
      project,
      points,
      color: CHART_COLORS[pIndex % CHART_COLORS.length],
      pathData: points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    };
  });

  // Generate grid lines
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map(level => {
    const points = criteria.map((_, index) => getPoint(level, index));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  });

  // Generate axis lines
  const axisLines = criteria.map((_, index) => {
    const endPoint = getPoint(maxScore, index);
    return { x1: centerX, y1: centerY, x2: endPoint.x, y2: endPoint.y };
  });

  // Generate labels
  const labels = criteria.map((criterion, index) => {
    const point = getPoint(maxScore + 0.8, index);
    return { text: criterion, x: point.x, y: point.y };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
        {/* Grid */}
        {gridPolygons.map((path, i) => (
          <path
            key={`grid-${i}`}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}
        
        {/* Axes */}
        {axisLines.map((line, i) => (
          <line
            key={`axis-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
        ))}
        
        {/* Project Polygons */}
        {projectPolygons.map((polygon, i) => (
          <path
            key={`polygon-${i}`}
            d={polygon.pathData}
            fill={`hsl(var(--chart-${(i % 5) + 1}))`}
            fillOpacity={0.2}
            stroke={`hsl(var(--chart-${(i % 5) + 1}))`}
            strokeWidth={2}
          />
        ))}
        
        {/* Data Points */}
        {projectPolygons.map((polygon, pIndex) => (
          polygon.points.map((point, cIndex) => (
            <circle
              key={`point-${pIndex}-${cIndex}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={`hsl(var(--chart-${(pIndex % 5) + 1}))`}
            />
          ))
        ))}
        
        {/* Labels */}
        {labels.map((label, i) => (
          <text
            key={`label-${i}`}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-muted-foreground"
          >
            {label.text.length > 10 ? label.text.slice(0, 10) + '...' : label.text}
          </text>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {projects.map((project, i) => (
          <div key={project.projectId} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))` }}
            />
            <span className="text-xs">{project.projectName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarComparisonChart({ 
  projects, 
  criteria 
}: { 
  projects: ProjectScore[]; 
  criteria: string[];
}) {
  const maxScore = 5;

  return (
    <div className="space-y-6">
      {criteria.map(criterion => (
        <div key={criterion} className="space-y-2">
          <h4 className="text-sm font-medium">{criterion}</h4>
          <div className="space-y-1">
            {projects.map((project, index) => {
              const score = project.criteriaScores[criterion] || 0;
              const percentage = (score / maxScore) * 100;
              
              return (
                <div key={project.projectId} className="flex items-center gap-2">
                  <div className="w-24 truncate text-xs text-muted-foreground">
                    {project.projectName}
                  </div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`
                      }}
                    />
                  </div>
                  <div className="w-8 text-xs text-right">{score.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScoreComparisonChart({ 
  selectedProjectIds,
  scoringModelId 
}: ScoreComparisonChartProps) {
  const { projects } = useProjects();
  const { models: scoringModels } = useScoringModels();
  const { scores: projectScores } = useProjectScores();
  
  const [viewMode, setViewMode] = useState<'radar' | 'bar'>('radar');
  const [modelId, setModelId] = useState(scoringModelId || '');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedProjectIds || []);
  
  const activeModel = useMemo(() => 
    scoringModels.find(m => m.id === modelId) || scoringModels.find(m => m.is_default),
    [scoringModels, modelId]
  );

  const criteria = useMemo(() => {
    if (!activeModel?.criteria) return [];
    const criteriaArray = activeModel.criteria as Array<{ name: string }>;
    return criteriaArray.map(c => c.name);
  }, [activeModel]);

  const comparisonData = useMemo(() => {
    if (!activeModel) return [];
    
    const projectsToCompare = selectedIds.length > 0 
      ? projects?.filter(p => selectedIds.includes(p.id))
      : projects?.slice(0, 5); // Default to first 5 projects
    
    return (projectsToCompare || []).map(project => {
      const score = projectScores.find(
        s => s.project_id === project.id && s.scoring_model_id === activeModel.id
      );
      
      return {
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status,
        totalScore: score?.total_score || 0,
        criteriaScores: (score?.criteria_scores as Record<string, number>) || {}
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [projects, projectScores, activeModel, selectedIds]);

  if (!activeModel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Comparison</CardTitle>
          <CardDescription>No scoring model available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create a scoring model to compare project scores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Score Comparison
            </CardTitle>
            <CardDescription>
              Compare project scores across criteria
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={modelId || activeModel.id} onValueChange={setModelId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {scoringModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-lg border overflow-hidden">
              <Button 
                variant={viewMode === 'radar' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode('radar')}
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'bar' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {comparisonData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects to compare</p>
            <p className="text-sm">Score some projects to see the comparison</p>
          </div>
        ) : (
          <>
            {/* Overall Ranking */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overall Ranking
              </h4>
              <div className="space-y-2">
                {comparisonData.map((project, index) => (
                  <div 
                    key={project.projectId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        index === 1 ? 'bg-slate-400/20 text-slate-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.projectName}</p>
                      <Badge variant="outline" className="text-xs">
                        {project.projectStatus}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{project.totalScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">/ 100</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-4">Criteria Breakdown</h4>
              {viewMode === 'radar' ? (
                <RadarChartVisual projects={comparisonData} criteria={criteria} />
              ) : (
                <BarComparisonChart projects={comparisonData} criteria={criteria} />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
