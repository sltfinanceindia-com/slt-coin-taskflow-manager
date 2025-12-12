import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScoringModels, useProjectScores, ScoringCriterion } from '@/hooks/useScoringModels';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { Target, Save, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ProjectScoreCard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const { projects } = useEnhancedProjects();
  const { models } = useScoringModels();
  const { scores, saveScore, isSaving } = useProjectScores(selectedModelId);

  const selectedModel = models.find(m => m.id === selectedModelId);
  const criteria = selectedModel?.criteria || [];

  // Set default model
  useEffect(() => {
    const defaultModel = models.find(m => m.is_default);
    if (defaultModel && !selectedModelId) {
      setSelectedModelId(defaultModel.id);
    }
  }, [models]);

  // Load existing score when project/model changes
  useEffect(() => {
    if (selectedProjectId && selectedModelId) {
      const existingScore = scores.find(
        s => s.project_id === selectedProjectId && s.scoring_model_id === selectedModelId
      );
      if (existingScore) {
        setCriteriaScores(existingScore.criteria_scores);
        setNotes(existingScore.notes || '');
        setCalculatedScore(existingScore.total_score);
      } else {
        // Initialize with middle values
        const initial: Record<string, number> = {};
        criteria.forEach(c => {
          initial[c.name] = Math.round((c.scale_min + c.scale_max) / 2);
        });
        setCriteriaScores(initial);
        setNotes('');
        setCalculatedScore(null);
      }
    }
  }, [selectedProjectId, selectedModelId, scores, criteria]);

  // Calculate score on criteria change
  useEffect(() => {
    if (criteria.length === 0) return;
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    criteria.forEach(c => {
      const score = criteriaScores[c.name] || c.scale_min;
      const normalized = (score / c.scale_max) * 100;
      weightedSum += normalized * c.weight;
      totalWeight += c.weight;
    });
    
    setCalculatedScore(totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0);
  }, [criteriaScores, criteria]);

  const handleSave = async () => {
    if (!selectedProjectId || !selectedModelId) return;
    
    await saveScore({
      projectId: selectedProjectId,
      modelId: selectedModelId,
      criteriaScores,
      notes,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Score Project</h2>
        <p className="text-muted-foreground">
          Evaluate a project against scoring criteria
        </p>
      </div>

      {/* Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Project</Label>
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

            <div className="space-y-2">
              <Label>Scoring Model</Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} {model.is_default && '(Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProjectId && selectedModelId && criteria.length > 0 && (
        <>
          {/* Score Display */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className={`text-4xl font-bold ${getScoreColor(calculatedScore || 0)}`}>
                      {calculatedScore !== null ? calculatedScore : '-'}
                    </p>
                    <p className="text-muted-foreground">Priority Score</p>
                  </div>
                </div>
                <div className="flex-1">
                  <Progress value={calculatedScore || 0} className="h-3" />
                </div>
                <Badge 
                  variant={calculatedScore && calculatedScore >= 70 ? 'default' : 'secondary'}
                  className={calculatedScore && calculatedScore >= 70 ? 'bg-emerald-500' : ''}
                >
                  {calculatedScore && calculatedScore >= 70 ? 'High Priority' : 
                   calculatedScore && calculatedScore >= 40 ? 'Medium Priority' : 'Low Priority'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Criteria Sliders */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
              <CardDescription>
                Rate the project on each criterion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TooltipProvider>
                {criteria.map((criterion) => (
                  <CriterionSlider
                    key={criterion.name}
                    criterion={criterion}
                    value={criteriaScores[criterion.name] || criterion.scale_min}
                    onChange={(value) => setCriteriaScores({
                      ...criteriaScores,
                      [criterion.name]: value,
                    })}
                  />
                ))}
              </TooltipProvider>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add scoring rationale or notes..."
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Score'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {models.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scoring Models</h3>
            <p className="text-muted-foreground">
              Create a scoring model first to evaluate projects.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CriterionSlider({
  criterion,
  value,
  onChange,
}: {
  criterion: ScoringCriterion;
  value: number;
  onChange: (value: number) => void;
}) {
  const normalized = ((value - criterion.scale_min) / (criterion.scale_max - criterion.scale_min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>{criterion.label}</Label>
          {criterion.description && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{criterion.description}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Badge variant="outline" className="text-xs">
            {criterion.weight}%
          </Badge>
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-8">{criterion.scale_min}</span>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={criterion.scale_min}
          max={criterion.scale_max}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-8">{criterion.scale_max}</span>
      </div>
      <Progress value={normalized} className="h-1" />
    </div>
  );
}
