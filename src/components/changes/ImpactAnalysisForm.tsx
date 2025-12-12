import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChangeRequests, ChangeRequest } from '@/hooks/useChangeRequests';
import { 
  Calendar, DollarSign, Users, AlertTriangle, 
  TrendingUp, CheckCircle2, Loader2 
} from 'lucide-react';

interface ImpactAnalysisFormProps {
  request: ChangeRequest;
  open: boolean;
  onClose: () => void;
}

export function ImpactAnalysisForm({ request, open, onClose }: ImpactAnalysisFormProps) {
  const { updateChangeRequest, isUpdating } = useChangeRequests();
  
  const [analysis, setAnalysis] = useState({
    schedule_impact_days: request.schedule_impact_days || 0,
    budget_impact: request.budget_impact || 0,
    resource_impact: request.resource_impact || '',
    impact_analysis: {
      schedule: request.impact_analysis?.schedule || '',
      budget: request.impact_analysis?.budget || '',
      resources: request.impact_analysis?.resources || '',
      risks: request.impact_analysis?.risks || '',
      benefits: request.impact_analysis?.benefits || '',
    },
  });

  const handleSubmit = () => {
    updateChangeRequest(
      {
        id: request.id,
        data: {
          ...analysis,
          status: 'analyzing',
        },
      },
      {
        onSuccess: onClose,
      }
    );
  };

  const impactSeverity = () => {
    const days = analysis.schedule_impact_days;
    const budget = analysis.budget_impact;
    
    if (days > 14 || budget > 10000) return { level: 'High', color: 'text-destructive' };
    if (days > 7 || budget > 5000) return { level: 'Medium', color: 'text-warning' };
    return { level: 'Low', color: 'text-green-500' };
  };

  const severity = impactSeverity();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Impact Analysis: {request.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Change Request</h4>
              <p className="text-sm text-muted-foreground">{request.reason}</p>
              {request.description && (
                <p className="text-sm mt-2">{request.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Quantitative Impact */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Schedule Impact (days)
              </Label>
              <Input
                type="number"
                value={analysis.schedule_impact_days}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  schedule_impact_days: parseInt(e.target.value) || 0,
                }))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Additional days needed to complete
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Budget Impact
              </Label>
              <Input
                type="number"
                value={analysis.budget_impact}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  budget_impact: parseFloat(e.target.value) || 0,
                }))}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Additional cost in your currency
              </p>
            </div>
          </div>

          {/* Impact Summary Card */}
          <Card className="border-2">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Impact Severity</span>
                <span className={severity.color}>{severity.level}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="ml-2 font-medium">
                    {analysis.schedule_impact_days > 0 ? `+${analysis.schedule_impact_days} days` : 'No change'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="ml-2 font-medium">
                    {analysis.budget_impact > 0 ? `+$${analysis.budget_impact.toLocaleString()}` : 'No change'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="space-y-4">
            <h4 className="font-medium">Detailed Analysis</h4>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Schedule Analysis
              </Label>
              <Textarea
                value={analysis.impact_analysis.schedule}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  impact_analysis: { ...prev.impact_analysis, schedule: e.target.value },
                }))}
                placeholder="How will this affect the project timeline? Which milestones are impacted?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Budget Analysis
              </Label>
              <Textarea
                value={analysis.impact_analysis.budget}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  impact_analysis: { ...prev.impact_analysis, budget: e.target.value },
                }))}
                placeholder="What are the cost implications? Additional resources, tools, or services needed?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Resource Impact
              </Label>
              <Textarea
                value={analysis.resource_impact || ''}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  resource_impact: e.target.value,
                }))}
                placeholder="Which team members are affected? Do we need additional resources?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Risks
              </Label>
              <Textarea
                value={analysis.impact_analysis.risks}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  impact_analysis: { ...prev.impact_analysis, risks: e.target.value },
                }))}
                placeholder="What are the risks if we implement this change? What about if we don't?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Benefits
              </Label>
              <Textarea
                value={analysis.impact_analysis.benefits}
                onChange={(e) => setAnalysis(prev => ({
                  ...prev,
                  impact_analysis: { ...prev.impact_analysis, benefits: e.target.value },
                }))}
                placeholder="What are the expected benefits? Business value, efficiency gains, etc."
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
