import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChangeRequests } from '@/hooks/useChangeRequests';
import { 
  FileEdit, CheckCircle2, XCircle, Clock, 
  AlertTriangle, Calendar, User, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface ScopeChangeLogProps {
  projectId: string;
}

const statusConfig = {
  draft: { label: 'Draft', icon: FileEdit, color: 'text-muted-foreground' },
  submitted: { label: 'Submitted', icon: Clock, color: 'text-blue-500' },
  analyzing: { label: 'Analyzing', icon: AlertTriangle, color: 'text-yellow-500' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-green-500' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-destructive' },
  implemented: { label: 'Implemented', icon: CheckCircle2, color: 'text-primary' },
};

export function ScopeChangeLog({ projectId }: ScopeChangeLogProps) {
  const { changeRequests } = useChangeRequests(projectId);
  
  // Only show non-draft requests
  const logEntries = changeRequests
    .filter(r => r.status !== 'draft')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const totalApproved = changeRequests.filter(r => r.status === 'approved' || r.status === 'implemented').length;
  const totalRejected = changeRequests.filter(r => r.status === 'rejected').length;
  const totalScheduleImpact = changeRequests
    .filter(r => r.status === 'approved' || r.status === 'implemented')
    .reduce((sum, r) => sum + (r.schedule_impact_days || 0), 0);
  const totalBudgetImpact = changeRequests
    .filter(r => r.status === 'approved' || r.status === 'implemented')
    .reduce((sum, r) => sum + (Number(r.budget_impact) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{totalApproved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <div>
              <div className="text-2xl font-bold">{totalRejected}</div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            <div>
              <div className="text-2xl font-bold">+{totalScheduleImpact}</div>
              <div className="text-xs text-muted-foreground">Days Added</div>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <span className="text-warning">$</span>
            <div>
              <div className="text-2xl font-bold">{totalBudgetImpact.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Budget Added</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Change Log Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scope Change History</CardTitle>
        </CardHeader>
        <CardContent>
          {logEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No scope changes recorded yet
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                
                <div className="space-y-6">
                  {logEntries.map((entry, index) => {
                    const StatusIcon = statusConfig[entry.status].icon;
                    return (
                      <div key={entry.id} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center ${statusConfig[entry.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                        </div>
                        
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-sm">{entry.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {entry.reason}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`shrink-0 ${statusConfig[entry.status].color}`}
                            >
                              {statusConfig[entry.status].label}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {entry.requester_profile?.full_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(entry.updated_at), 'MMM d, yyyy')}
                            </span>
                            {(entry.status === 'approved' || entry.status === 'implemented') && (
                              <>
                                {entry.schedule_impact_days !== null && entry.schedule_impact_days > 0 && (
                                  <span className="text-warning">
                                    +{entry.schedule_impact_days} days
                                  </span>
                                )}
                                {entry.budget_impact !== null && Number(entry.budget_impact) > 0 && (
                                  <span className="text-warning">
                                    +${Number(entry.budget_impact).toLocaleString()}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {entry.approver_profile && (
                            <div className="flex items-center gap-1 mt-2 text-xs">
                              <span className="text-muted-foreground">
                                {entry.status === 'approved' ? 'Approved' : 'Reviewed'} by:
                              </span>
                              <span>{entry.approver_profile.full_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
