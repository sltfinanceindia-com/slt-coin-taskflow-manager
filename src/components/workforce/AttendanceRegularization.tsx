/**
 * Attendance Regularization Component
 * Handle attendance correction requests
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: 'missed_punch' | 'wrong_time' | 'forgot_checkout';
  originalIn: string | null;
  originalOut: string | null;
  requestedIn: string;
  requestedOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverName: string | null;
  approvedAt: string | null;
  createdAt: string;
}

const mockRequests: RegularizationRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Smith',
    date: '2025-01-28',
    type: 'missed_punch',
    originalIn: null,
    originalOut: null,
    requestedIn: '09:00',
    requestedOut: '18:00',
    reason: 'Biometric device was not working',
    status: 'pending',
    approverName: null,
    approvedAt: null,
    createdAt: '2025-01-29',
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Doe',
    date: '2025-01-27',
    type: 'forgot_checkout',
    originalIn: '09:15',
    originalOut: null,
    requestedIn: '09:15',
    requestedOut: '18:30',
    reason: 'Forgot to check out while leaving',
    status: 'approved',
    approverName: 'Mike Johnson',
    approvedAt: '2025-01-28',
    createdAt: '2025-01-28',
  },
];

export function AttendanceRegularization() {
  const [requests, setRequests] = useState<RegularizationRequest[]>(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: '',
    type: 'missed_punch' as RegularizationRequest['type'],
    requestedIn: '',
    requestedOut: '',
    reason: '',
  });

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'pending') return req.status === 'pending';
    if (activeTab === 'approved') return req.status === 'approved';
    if (activeTab === 'rejected') return req.status === 'rejected';
    return true;
  });

  const handleSubmit = () => {
    if (!formData.date || !formData.requestedIn || !formData.requestedOut || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newRequest: RegularizationRequest = {
      id: Date.now().toString(),
      employeeId: '1',
      employeeName: 'Current User', // Would come from auth
      date: formData.date,
      type: formData.type,
      originalIn: null,
      originalOut: null,
      requestedIn: formData.requestedIn,
      requestedOut: formData.requestedOut,
      reason: formData.reason,
      status: 'pending',
      approverName: null,
      approvedAt: null,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRequests([newRequest, ...requests]);
    setIsDialogOpen(false);
    setFormData({
      date: '',
      type: 'missed_punch',
      requestedIn: '',
      requestedOut: '',
      reason: '',
    });

    toast({
      title: 'Request Submitted',
      description: 'Your regularization request has been submitted for approval.',
    });
  };

  const handleApprove = (id: string) => {
    setRequests(
      requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'approved' as const,
              approverName: 'Current User',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : req
      )
    );
    toast({
      title: 'Request Approved',
      description: 'The regularization request has been approved.',
    });
  };

  const handleReject = (id: string) => {
    setRequests(
      requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'rejected' as const,
              approverName: 'Current User',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : req
      )
    );
    toast({
      title: 'Request Rejected',
      description: 'The regularization request has been rejected.',
    });
  };

  const getStatusBadge = (status: RegularizationRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const getTypeLabel = (type: RegularizationRequest['type']) => {
    switch (type) {
      case 'missed_punch':
        return 'Missed Punch';
      case 'wrong_time':
        return 'Wrong Time';
      case 'forgot_checkout':
        return 'Forgot Checkout';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Attendance Regularization</h2>
          <p className="text-muted-foreground">
            Request attendance corrections and view history
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === 'rejected').length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requested Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.employeeName}
                  </TableCell>
                  <TableCell>
                    {new Date(request.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(request.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {request.requestedIn} - {request.requestedOut}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Attendance Regularization</DialogTitle>
            <DialogDescription>
              Submit a request to correct your attendance record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Request Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: RegularizationRequest['type']) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missed_punch">Missed Punch</SelectItem>
                  <SelectItem value="wrong_time">Wrong Time Recorded</SelectItem>
                  <SelectItem value="forgot_checkout">Forgot Checkout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedIn">Check-in Time *</Label>
                <Input
                  id="requestedIn"
                  type="time"
                  value={formData.requestedIn}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedIn: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedOut">Check-out Time *</Label>
                <Input
                  id="requestedOut"
                  type="time"
                  value={formData.requestedOut}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedOut: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Explain why you need this correction..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
