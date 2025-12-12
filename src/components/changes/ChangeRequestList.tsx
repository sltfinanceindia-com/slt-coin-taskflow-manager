import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChangeRequests, ChangeRequest } from '@/hooks/useChangeRequests';
import { useUserRole } from '@/hooks/useUserRole';
import { ChangeRequestForm } from './ChangeRequestForm';
import { ImpactAnalysisForm } from './ImpactAnalysisForm';
import { ChangeRequestApprovalFlow } from './ChangeRequestApprovalFlow';
import { 
  FileEdit, Search, Clock, CheckCircle2, XCircle, 
  AlertTriangle, Loader2, FolderOpen, Calendar, User
} from 'lucide-react';
import { format } from 'date-fns';

interface ChangeRequestListProps {
  projectId?: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileEdit },
  submitted: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-500', icon: Clock },
  analyzing: { label: 'Analyzing', color: 'bg-yellow-500/20 text-yellow-500', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-destructive/20 text-destructive', icon: XCircle },
  implemented: { label: 'Implemented', color: 'bg-primary/20 text-primary', icon: CheckCircle2 },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-500' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-500' },
  critical: { label: 'Critical', color: 'bg-destructive/20 text-destructive' },
};

export function ChangeRequestList({ projectId }: ChangeRequestListProps) {
  const { changeRequests, stats, isLoading } = useChangeRequests(projectId);
  const { isAdmin } = useUserRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [showImpactForm, setShowImpactForm] = useState(false);
  const [showApprovalFlow, setShowApprovalFlow] = useState(false);

  const filteredRequests = changeRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="p-3">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground capitalize">{key}</div>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ChangeRequestForm projectId={projectId} />
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Change Requests</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'all' 
              ? 'No requests match your filters'
              : 'Submit your first change request to get started'}
          </p>
          {!search && statusFilter === 'all' && (
            <ChangeRequestForm projectId={projectId} />
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => {
            const StatusIcon = statusConfig[request.status].icon;
            return (
              <Card 
                key={request.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig[request.status].color}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{request.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {request.reason}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className={priorityConfig[request.priority].color}>
                              {priorityConfig[request.priority].label}
                            </Badge>
                            <Badge variant="outline" className={statusConfig[request.status].color}>
                              {statusConfig[request.status].label}
                            </Badge>
                            {request.project && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <FolderOpen className="h-3 w-3" />
                                {request.project.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {request.requester_profile?.full_name || 'Unknown'}
                      </span>
                      {request.schedule_impact_days !== null && request.schedule_impact_days > 0 && (
                        <span className="text-warning flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          +{request.schedule_impact_days} days
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (request.status === 'submitted' || request.status === 'analyzing') && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {request.status === 'submitted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                            setShowImpactForm(true);
                          }}
                        >
                          Analyze Impact
                        </Button>
                      )}
                      {request.status === 'analyzing' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                            setShowApprovalFlow(true);
                          }}
                        >
                          Review & Approve
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Impact Analysis Dialog */}
      {selectedRequest && showImpactForm && (
        <ImpactAnalysisForm
          request={selectedRequest}
          open={showImpactForm}
          onClose={() => {
            setShowImpactForm(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Approval Flow Dialog */}
      {selectedRequest && showApprovalFlow && (
        <ChangeRequestApprovalFlow
          request={selectedRequest}
          open={showApprovalFlow}
          onClose={() => {
            setShowApprovalFlow(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
