import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { useWorkHealth, EarlyWarning } from '@/hooks/useWorkHealth';
import { formatDistanceToNow } from 'date-fns';

const WARNING_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  overdue: { icon: Clock, label: 'Overdue' },
  deadline_approaching: { icon: Calendar, label: 'Deadline' },
  scope_creep: { icon: TrendingUp, label: 'Scope Creep' },
  resource_conflict: { icon: AlertCircle, label: 'Resource Conflict' },
  velocity_drop: { icon: Target, label: 'Velocity Drop' },
};

const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  critical: { color: 'bg-red-500 text-white', icon: AlertTriangle },
  high: { color: 'bg-orange-500 text-white', icon: AlertCircle },
  medium: { color: 'bg-yellow-500 text-black', icon: Info },
  low: { color: 'bg-blue-500 text-white', icon: Info },
};

interface EarlyWarningAlertsProps {
  compact?: boolean;
  limit?: number;
}

export const EarlyWarningAlerts = ({ compact = false, limit }: EarlyWarningAlertsProps) => {
  const { earlyWarnings, isLoading, acknowledgeWarning, resolveWarning } = useWorkHealth();
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<EarlyWarning | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const displayedWarnings = limit ? earlyWarnings.slice(0, limit) : earlyWarnings;

  const handleResolve = async () => {
    if (!selectedWarning) return;

    await resolveWarning.mutateAsync({
      id: selectedWarning.id,
      resolution_notes: resolutionNotes || undefined,
    });

    setResolveDialogOpen(false);
    setSelectedWarning(null);
    setResolutionNotes('');
  };

  const renderWarning = (warning: EarlyWarning) => {
    const typeConfig = WARNING_TYPE_CONFIG[warning.warning_type] || { icon: AlertCircle, label: warning.warning_type };
    const severityConfig = SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.medium;
    const TypeIcon = typeConfig.icon;
    const SeverityIcon = severityConfig.icon;

    return (
      <div
        key={warning.id}
        className={`p-3 rounded-lg border transition-colors ${
          warning.is_acknowledged ? 'bg-muted/30 border-border' : 'border-l-4 border-l-orange-500'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${severityConfig.color}`}>
            <SeverityIcon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Badge>
              <Badge className={severityConfig.color}>
                {warning.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {warning.prediction_confidence}% confidence
              </span>
            </div>

            {warning.project && (
              <p className="text-xs text-muted-foreground mb-1">
                {warning.project.name}
                {warning.task && ` / ${warning.task.title}`}
              </p>
            )}

            <p className="text-sm font-medium">{warning.description}</p>

            {warning.suggested_action && (
              <div className="flex items-start gap-2 mt-2 p-2 rounded bg-muted/50">
                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{warning.suggested_action}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(warning.created_at), { addSuffix: true })}
              </span>

              <div className="flex items-center gap-2">
                {!warning.is_acknowledged && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeWarning.mutate(warning.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedWarning(warning);
                    setResolveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Warnings</CardTitle>
            <Badge variant="outline">
              {earlyWarnings.filter(w => !w.is_acknowledged).length} new
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : displayedWarnings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                <p>No active warnings</p>
                <p className="text-sm">All systems healthy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedWarnings.map(renderWarning)}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Early Warning Alerts</CardTitle>
            <div className="flex items-center gap-2">
              {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => {
                const count = earlyWarnings.filter(w => w.severity === severity).length;
                if (count === 0) return null;
                return (
                  <Badge key={severity} className={config.color}>
                    {count} {severity}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading warnings...</div>
            ) : earlyWarnings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium">No Active Warnings</p>
                <p className="text-sm">All projects are within healthy parameters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earlyWarnings.map(renderWarning)}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Warning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWarning && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{selectedWarning.description}</p>
              </div>
            )}
            <div>
              <Label>Resolution Notes (optional)</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how this was resolved..."
                className="mt-1.5"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleResolve}
              disabled={resolveWarning.isPending}
            >
              {resolveWarning.isPending ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
