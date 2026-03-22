import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLeaveManagement, LeaveRequest } from '@/hooks/useLeaveManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Calendar, X, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportDropdown } from '@/components/ExportDropdown';

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'outline' as const, icon: X },
};

export const LeaveRequests: React.FC = () => {
  const { myRequests, allRequests, isLoading, isAdminLoading, reviewRequest, cancelRequest } = useLeaveManagement();
  const { isAdmin } = useUserRole();
  
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
          <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 sm:h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
          </CardTitle>
          <ExportDropdown
            data={requests.map(r => ({
              Employee: r.employee?.full_name || '',
              'Leave Type': r.leave_type?.name || '',
              'Start Date': format(new Date(r.start_date), 'yyyy-MM-dd'),
              'End Date': format(new Date(r.end_date), 'yyyy-MM-dd'),
              'Total Days': r.total_days,
              Status: r.status,
              Reason: r.reason || '',
            }))}
            columns={[
              { key: 'Employee', label: 'Employee' },
              { key: 'Leave Type', label: 'Leave Type' },
              { key: 'Start Date', label: 'Start Date' },
              { key: 'End Date', label: 'End Date' },
              { key: 'Total Days', label: 'Total Days' },
              { key: 'Status', label: 'Status' },
              { key: 'Reason', label: 'Reason' },
            ]}
            filename="leave_requests"
            title="Leave Requests Report"
          />
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
            No leave requests found
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {requests.map((request) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={request.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3"
                >
                  {/* Main Content */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {isAdmin && request.employee && (
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={request.employee.avatar_url || undefined} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {request.employee.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      {isAdmin && request.employee && (
                        <p className="font-medium text-sm sm:text-base truncate">{request.employee.full_name}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: request.leave_type?.color, color: request.leave_type?.color }}
                        >
                          {request.leave_type?.name}
                        </Badge>
                        <span className="text-muted-foreground">
                          {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d')}
                        </span>
                        <span className="text-muted-foreground">
                          ({request.total_days}d)
                        </span>
                        {request.is_half_day && (
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">Half</Badge>
                        )}
                      </div>
                      {request.reason && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{request.reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
                    <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                      {isAdmin && request.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewAction('approve');
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewAction('reject');
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </>
                      )}

                      {!isAdmin && request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCancel(request.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {reviewAction ? `${reviewAction === 'approve' ? 'Approve' : 'Reject'} Leave Request` : 'Leave Request Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {isAdmin && selectedRequest.employee && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRequest.employee.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedRequest.employee.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{selectedRequest.employee.full_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{selectedRequest.employee.email}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                  <p className="text-xs sm:text-sm text-muted-foreground">Reason</p>
                  <p className="text-xs sm:text-sm">{selectedRequest.reason}</p>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.reviewer && (
                <div className="border-t pt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Reviewed by {selectedRequest.reviewer.full_name}</p>
                  {selectedRequest.review_notes && (
                    <p className="text-xs sm:text-sm mt-1">{selectedRequest.review_notes}</p>
                  )}
                </div>
              )}

              {reviewAction && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {reviewAction && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setReviewAction(null)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                onClick={() => handleReview(reviewAction === 'approve' ? 'approved' : 'rejected')}
                disabled={reviewRequest.isPending}
                className="w-full sm:w-auto"
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