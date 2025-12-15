import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useApprovals } from '@/hooks/useApprovals';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ApprovalTimeline } from './ApprovalTimeline';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck, 
  Eye,
  MessageSquare
} from 'lucide-react';

export const ApprovalCenter: React.FC = () => {
  const { myPendingApprovals, instances, isLoading, approveStep, rejectStep } = useApprovals();
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [comments, setComments] = useState('');

  const handleAction = async () => {
    if (!selectedStepId) return;
    
    if (actionType === 'approve') {
      await approveStep.mutateAsync({ stepId: selectedStepId, comments });
    } else {
      await rejectStep.mutateAsync({ stepId: selectedStepId, comments });
    }
    
    setActionDialogOpen(false);
    setComments('');
    setSelectedStepId('');
  };

  const openActionDialog = (stepId: string, type: 'approve' | 'reject') => {
    setSelectedStepId(stepId);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Approval Center</h2>
        <p className="text-muted-foreground">
          Review and manage approval requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pending" className="gap-1.5 px-2 sm:px-3">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Pending ({myPendingApprovals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5 px-2 sm:px-3">
            <FileCheck className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">All</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {myPendingApprovals.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No pending approvals"
              description="You're all caught up! No items need your approval."
            />
          ) : (
            <div className="grid gap-4">
              {myPendingApprovals.map((step: any) => (
                <Card key={step.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{step.instance?.entity_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Step {step.step_number} of {step.instance?.workflow?.steps?.length || 1}
                          </span>
                        </div>
                        <h4 className="font-semibold">{step.instance?.workflow?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.instance?.workflow?.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested {formatDistanceToNow(new Date(step.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openActionDialog(step.id, 'approve')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openActionDialog(step.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {instances.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No approval requests"
              description="No approval workflows have been started yet."
            />
          ) : (
            <div className="grid gap-4">
              {instances.map((instance) => (
                <Card key={instance.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(instance.status)}
                          <Badge variant="outline">{instance.entity_type}</Badge>
                        </div>
                        <h4 className="font-semibold">{instance.workflow?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Step {instance.current_step} of {instance.workflow?.steps?.length || 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started {formatDistanceToNow(new Date(instance.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInstance(instance)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Add optional comments and confirm your approval.'
                : 'Please provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <Textarea
                placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Optional comments...'}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              disabled={approveStep.isPending || rejectStep.isPending}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={!!selectedInstance} onOpenChange={() => setSelectedInstance(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approval Timeline</DialogTitle>
            <DialogDescription>
              {selectedInstance?.workflow?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <ApprovalTimeline instance={selectedInstance} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
