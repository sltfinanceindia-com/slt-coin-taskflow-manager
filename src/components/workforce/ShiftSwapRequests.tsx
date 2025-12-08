import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useShiftSwapRequests } from '@/hooks/useShifts';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { Check, X, ArrowLeftRight, Loader2, Clock } from 'lucide-react';

export function ShiftSwapRequests() {
  const { swapRequests, isLoading, respondToSwap } = useShiftSwapRequests();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseAction, setResponseAction] = useState<'approved' | 'rejected' | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleOpenResponse = (requestId: string, action: 'approved' | 'rejected') => {
    setSelectedRequest(requestId);
    setResponseAction(action);
    setResponseText('');
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest || !responseAction) return;

    try {
      await respondToSwap.mutateAsync({
        id: selectedRequest,
        status: responseAction,
        response: responseText,
      });
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseAction(null);
      setResponseText('');
    } catch (error) {
      // Error handled in mutation
    }
  };

  const pendingRequests = swapRequests.filter(r => r.status === 'pending');
  const processedRequests = swapRequests.filter(r => r.status !== 'pending');

  // Filter requests relevant to the current user
  const myPendingRequests = pendingRequests.filter(
    r => r.target_employee_id === profile?.id || isAdmin
  );

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Pending Swap Requests
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Review and manage shift swap requests'
              : 'Requests awaiting your response'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myPendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pending requests</h3>
              <p className="text-muted-foreground">
                There are no shift swap requests awaiting your action
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myPendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.requester?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.requester?.full_name}</p>
                        <p className="text-sm text-muted-foreground">Requesting</p>
                      </div>
                    </div>

                    <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />

                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.target_employee?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.target_employee?.full_name}</p>
                        <p className="text-sm text-muted-foreground">Target</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </p>
                      {request.requester_reason && (
                        <p className="text-sm italic">"{request.requester_reason}"</p>
                      )}
                    </div>
                    {getStatusBadge(request.status)}

                    {request.status === 'pending' &&
                      (request.target_employee_id === profile?.id || isAdmin) && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleOpenResponse(request.id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleOpenResponse(request.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Previously processed swap requests</CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No processed requests yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {request.requester?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {request.requester?.full_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {request.target_employee?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {request.target_employee?.full_name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {request.requester_reason || '-'}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {request.target_response || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseAction === 'approved' ? 'Approve' : 'Reject'} Swap Request
            </DialogTitle>
            <DialogDescription>
              Add an optional response message
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Optional response message..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={responseAction === 'approved' ? 'default' : 'destructive'}
              onClick={handleSubmitResponse}
              disabled={respondToSwap.isPending}
            >
              {respondToSwap.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {responseAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
