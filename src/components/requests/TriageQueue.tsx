import React, { useState } from 'react';
import { useWorkRequests, WorkRequest } from '@/hooks/useWorkRequests';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox, Clock, CheckCircle, XCircle, ArrowRight, Filter, Search, AlertTriangle, User } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-600', icon: Inbox },
  triaging: { label: 'Triaging', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600', icon: XCircle },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-600', icon: ArrowRight },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/10 text-gray-600', icon: XCircle },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function TriageQueue() {
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null);
  const [triageNotes, setTriageNotes] = useState('');
  const [assignTo, setAssignTo] = useState('');

  const { requests, isLoading, triageRequest, isTriaging, stats } = useWorkRequests(statusFilter);

  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-triage', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredRequests = requests.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requester?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTriage = (status: WorkRequest['status']) => {
    if (!selectedRequest) return;
    triageRequest({
      id: selectedRequest.id,
      status,
      notes: triageNotes,
      assignedTo: assignTo || undefined,
    }, {
      onSuccess: () => {
        setSelectedRequest(null);
        setTriageNotes('');
        setAssignTo('');
      },
    });
  };

  const getSLAStatus = (request: WorkRequest) => {
    if (request.resolved_at) return null;
    
    const responseDue = request.sla_response_due ? new Date(request.sla_response_due) : null;
    const resolutionDue = request.sla_resolution_due ? new Date(request.sla_resolution_due) : null;
    
    if (!request.first_response_at && responseDue && isPast(responseDue)) {
      return { type: 'response', breached: true };
    }
    if (resolutionDue && isPast(resolutionDue)) {
      return { type: 'resolution', breached: true };
    }
    if (responseDue && !request.first_response_at) {
      return { type: 'response', breached: false, due: responseDue };
    }
    if (resolutionDue) {
      return { type: 'resolution', breached: false, due: resolutionDue };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('submitted')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.submitted}</p>
                <p className="text-xs text-muted-foreground">Pending Triage</p>
              </div>
              <Inbox className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('in_progress')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <ArrowRight className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('completed')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.breaches}</p>
                <p className="text-xs text-muted-foreground">SLA Breaches</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5 text-primary" />
              Triage Queue
            </CardTitle>
            <CardDescription>Review and process incoming requests</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="submitted">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No Requests"
              description={statusFilter === 'submitted' ? 'No pending requests to triage' : 'No requests match your filters'}
            />
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(request => {
                const statusConfig = STATUS_CONFIG[request.status];
                const slaStatus = getSLAStatus(request);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{request.request_number}</span>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        <Badge className={PRIORITY_COLORS[request.priority]}>{request.priority}</Badge>
                        {slaStatus?.breached && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            SLA Breach
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium truncate">{request.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{request.request_type?.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    {/* Requester */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requester?.avatar_url || ''} />
                        <AvatarFallback>
                          {request.requester?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{request.requester?.full_name}</p>
                        {slaStatus && !slaStatus.breached && slaStatus.due && (
                          <p className="text-xs text-muted-foreground">
                            Due {formatDistanceToNow(slaStatus.due, { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Triage Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Triage Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono">{selectedRequest.request_number}</span>
                    <Badge className={PRIORITY_COLORS[selectedRequest.priority]}>
                      {selectedRequest.priority}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{selectedRequest.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Requester</p>
                    <p className="font-medium">{selectedRequest.requester?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedRequest.request_type?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">{format(new Date(selectedRequest.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Due</p>
                    <p className="font-medium">
                      {selectedRequest.sla_response_due 
                        ? format(new Date(selectedRequest.sla_response_due), 'MMM d, h:mm a')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Triage Notes</Label>
                  <Textarea
                    value={triageNotes}
                    onChange={(e) => setTriageNotes(e.target.value)}
                    placeholder="Add notes about this request..."
                    rows={3}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  <Button
                    onClick={() => handleTriage('approved')}
                    disabled={isTriaging}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleTriage('in_progress')}
                    disabled={isTriaging}
                    variant="secondary"
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Work
                  </Button>
                  <Button
                    onClick={() => handleTriage('rejected')}
                    disabled={isTriaging}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
