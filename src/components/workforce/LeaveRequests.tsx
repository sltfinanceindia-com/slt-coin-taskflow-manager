import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLeaveManagement, LeaveRequest } from '@/hooks/useLeaveManagement';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Calendar, X, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'outline' as const, icon: X },
};

export const LeaveRequests: React.FC = () => {
  const { profile } = useAuth();
  const { myRequests, allRequests, isLoading, isAdminLoading, reviewRequest, cancelRequest } = useLeaveManagement();
  const isAdmin = profile?.role === 'admin';
  
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  const requests = isAdmin ? allRequests : myRequests;
  const loading = isAdmin ? isAdminLoading : isLoading;

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    await reviewRequest.mutateAsync({
      id: selectedRequest.id,
      status,
      review_notes: reviewNotes || undefined,
    });
    setSelectedRequest(null);
    setReviewNotes('');
    setReviewAction(null);
  };

  const handleCancel = async (id: string) => {
    await cancelRequest.mutateAsync(id);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leave requests found
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isAdmin && request.employee && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.employee.avatar_url || undefined} />
                        <AvatarFallback>
                          {request.employee.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-1">
                      {isAdmin && request.employee && (
                        <p className="font-medium">{request.employee.full_name}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Badge 
                          variant="outline" 
                          style={{ borderColor: request.leave_type?.color, color: request.leave_type?.color }}
                        >
                          {request.leave_type?.name}
                        </Badge>
                        <span className="text-muted-foreground">
                          {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                        </span>
                        <span className="text-muted-foreground">
                          ({request.total_days} day{request.total_days !== 1 ? 's' : ''})
                        </span>
                        {request.is_half_day && (
                          <Badge variant="secondary" className="text-xs">Half Day</Badge>
                        )}
                      </div>
                      {request.reason && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{request.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    
                    {isAdmin && request.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewAction('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewAction('reject');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {!isAdmin && request.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCancel(request.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Review/View Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setReviewNotes('');
        setReviewAction(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction ? `${reviewAction === 'approve' ? 'Approve' : 'Reject'} Leave Request` : 'Leave Request Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {isAdmin && selectedRequest.employee && (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedRequest.employee.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedRequest.employee.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedRequest.employee.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.employee.email}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Leave Type</p>
                  <p className="font-medium">{selectedRequest.leave_type?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedRequest.total_days} day(s)</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(selectedRequest.start_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(new Date(selectedRequest.end_date), 'PPP')}</p>
                </div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.reviewer && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Reviewed by {selectedRequest.reviewer.full_name}</p>
                  {selectedRequest.review_notes && (
                    <p className="text-sm mt-1">{selectedRequest.review_notes}</p>
                  )}
                </div>
              )}

              {reviewAction && (
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {reviewAction && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewAction(null)}>
                Cancel
              </Button>
              <Button 
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                onClick={() => handleReview(reviewAction === 'approve' ? 'approved' : 'rejected')}
                disabled={reviewRequest.isPending}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
