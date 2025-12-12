import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Layers
} from 'lucide-react';
import { useWorkHealth, RiskAssessment } from '@/hooks/useWorkHealth';
import { useProjects } from '@/hooks/useProjects';
import { format } from 'date-fns';

const RISK_CATEGORIES = [
  { key: 'schedule_risk', label: 'Schedule', icon: Clock, description: 'Timeline and deadline risks' },
  { key: 'budget_risk', label: 'Budget', icon: DollarSign, description: 'Cost and resource allocation' },
  { key: 'scope_risk', label: 'Scope', icon: Layers, description: 'Feature creep and requirements' },
  { key: 'resource_risk', label: 'Resource', icon: Users, description: 'Team capacity and availability' },
  { key: 'quality_risk', label: 'Quality', icon: CheckCircle, description: 'Deliverable quality concerns' },
] as const;

export const RiskScoreCard = () => {
  const { riskAssessments, isLoading, createAssessment } = useWorkHealth();
  const { projects } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [risks, setRisks] = useState({
    schedule_risk: 1,
    budget_risk: 1,
    scope_risk: 1,
    resource_risk: 1,
    quality_risk: 1,
  });
  const [riskTrend, setRiskTrend] = useState('stable');
  const [mitigationNotes, setMitigationNotes] = useState('');

  const handleSubmit = async () => {
    if (!selectedProject) return;

    await createAssessment.mutateAsync({
      project_id: selectedProject,
      ...risks,
      risk_trend: riskTrend,
      mitigation_notes: mitigationNotes || undefined,
    });

    setDialogOpen(false);
    setSelectedProject('');
    setRisks({ schedule_risk: 1, budget_risk: 1, scope_risk: 1, resource_risk: 1, quality_risk: 1 });
    setRiskTrend('stable');
    setMitigationNotes('');
  };

  const getRiskColor = (value: number) => {
    if (value >= 4) return 'text-red-500 bg-red-500';
    if (value >= 3) return 'text-orange-500 bg-orange-500';
    if (value >= 2) return 'text-yellow-500 bg-yellow-500';
    return 'text-green-500 bg-green-500';
  };

  const getRiskLabel = (value: number) => {
    if (value >= 4) return 'Critical';
    if (value >= 3) return 'High';
    if (value >= 2) return 'Medium';
    return 'Low';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Group assessments by project
  const latestAssessments = Object.values(
    riskAssessments.reduce((acc, assessment) => {
      if (!acc[assessment.project_id] || 
          new Date(assessment.assessment_date) > new Date(acc[assessment.project_id].assessment_date)) {
        acc[assessment.project_id] = assessment;
      }
      return acc;
    }, {} as Record<string, RiskAssessment>)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Risk Assessments</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Risk Assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {RISK_CATEGORIES.map(category => (
                  <div key={category.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4 text-muted-foreground" />
                        <Label>{category.label} Risk</Label>
                      </div>
                      <Badge variant="outline" className={getRiskColor(risks[category.key]).split(' ')[0]}>
                        {risks[category.key]} - {getRiskLabel(risks[category.key])}
                      </Badge>
                    </div>
                    <Slider
                      value={[risks[category.key]]}
                      onValueChange={([value]) => setRisks(r => ({ ...r, [category.key]: value }))}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>Risk Trend</Label>
                <Select value={riskTrend} onValueChange={setRiskTrend}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improving">Improving</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="worsening">Worsening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mitigation Notes (optional)</Label>
                <Textarea
                  value={mitigationNotes}
                  onChange={(e) => setMitigationNotes(e.target.value)}
                  placeholder="Describe mitigation strategies..."
                  className="mt-1.5"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={!selectedProject || createAssessment.isPending}
              >
                {createAssessment.isPending ? 'Creating...' : 'Create Assessment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[500px]">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : latestAssessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No risk assessments yet</p>
            <p className="text-sm">Create your first assessment to start tracking project risks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {latestAssessments.map(assessment => {
              const overallScore = Number(assessment.overall_risk_score);
              
              return (
                <Card key={assessment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{assessment.project?.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(assessment.risk_trend)}
                        <Badge className={`${getRiskColor(overallScore).split(' ')[1]} text-white`}>
                          {overallScore.toFixed(1)} - {getRiskLabel(overallScore)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {RISK_CATEGORIES.map(category => {
                        const value = assessment[category.key as keyof RiskAssessment] as number;
                        return (
                          <div key={category.key} className="text-center">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${getRiskColor(value).split(' ')[1]}/20`}>
                              <category.icon className={`h-4 w-4 ${getRiskColor(value).split(' ')[0]}`} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{category.label}</p>
                            <p className={`text-sm font-medium ${getRiskColor(value).split(' ')[0]}`}>{value}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(assessment.assessment_date), 'MMM d, yyyy')}
                      </div>
                      <span>by {assessment.assessor?.full_name}</span>
                    </div>

                    {assessment.mitigation_notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic border-t pt-2">
                        {assessment.mitigation_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
