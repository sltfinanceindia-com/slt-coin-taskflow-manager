import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useChangeRequests, ChangeRequest } from '@/hooks/useChangeRequests';
import { 
  CheckCircle2, XCircle, AlertTriangle, Calendar, 
  DollarSign, Users, Loader2, FileText, TrendingUp
} from 'lucide-react';

interface ChangeRequestApprovalFlowProps {
  request: ChangeRequest;
  open: boolean;
  onClose: () => void;
}

export function ChangeRequestApprovalFlow({ request, open, onClose }: ChangeRequestApprovalFlowProps) {
  const { submitApproval, isUpdating } = useChangeRequests();
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approved' | 'rejected' | null>(null);

  const handleSubmit = (status: 'approved' | 'rejected') => {
    setAction(status);
    submitApproval(
      {
        changeRequestId: request.id,
        status,
        comments: comments || undefined,
      },
      {
        onSuccess: onClose,
      }
    );
  };

  const impactItems = [
    {
      icon: Calendar,
      label: 'Schedule Impact',
      value: request.schedule_impact_days 
        ? `+${request.schedule_impact_days} days` 
        : 'No impact',
      detail: request.impact_analysis?.schedule,
      severity: request.schedule_impact_days && request.schedule_impact_days > 7 ? 'warning' : 'normal',
    },
    {
      icon: DollarSign,
      label: 'Budget Impact',
      value: request.budget_impact 
        ? `+$${Number(request.budget_impact).toLocaleString()}` 
        : 'No impact',
      detail: request.impact_analysis?.budget,
      severity: request.budget_impact && request.budget_impact > 5000 ? 'warning' : 'normal',
    },
    {
      icon: Users,
      label: 'Resource Impact',
      value: request.resource_impact || 'No impact',
      detail: request.impact_analysis?.resources,
      severity: 'normal',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Change Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Details */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">{request.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                </Badge>
                <span className="text-xs text-muted-foreground">
                  by {request.requester_profile?.full_name}
                </span>
              </div>
            </CardHeader>
            <CardContent className="py-2 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Reason for Change</Label>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
              {request.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact Analysis Summary */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Impact Analysis
            </h4>
            
            <div className="grid gap-3">
              {impactItems.map((item) => (
                <Card 
                  key={item.label} 
                  className={item.severity === 'warning' ? 'border-warning/50' : ''}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.severity === 'warning' 
                          ? 'bg-warning/20 text-warning' 
                          : 'bg-muted'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className={`text-sm font-medium ${
                            item.severity === 'warning' ? 'text-warning' : ''
                          }`}>
                            {item.value}
                          </span>
                        </div>
                        {item.detail && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risks & Benefits */}
            {(request.impact_analysis?.risks || request.impact_analysis?.benefits) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {request.impact_analysis?.risks && (
                  <Card className="border-destructive/30">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground">
                        {request.impact_analysis.risks}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {request.impact_analysis?.benefits && (
                  <Card className="border-green-500/30">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground">
                        {request.impact_analysis.benefits}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Decision */}
          <div className="space-y-4">
            <h4 className="font-medium">Your Decision</h4>
            
            <div className="space-y-2">
              <Label>Comments (optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any notes or conditions for your decision..."
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit('rejected')}
                disabled={isUpdating}
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                {isUpdating && action === 'rejected' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Change
              </Button>
              <Button
                onClick={() => handleSubmit('approved')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating && action === 'approved' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve Change
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
