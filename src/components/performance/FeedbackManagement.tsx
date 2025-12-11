import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFeedbackCycles, useFeedbackRequests } from '@/hooks/usePerformanceManagement';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Plus, Users, MessageSquare, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function FeedbackManagement() {
  const [activeTab, setActiveTab] = useState('cycles');
  const { isAdmin } = useUserRole();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">360° Feedback</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Collect and manage comprehensive feedback from multiple sources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="cycles" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Cycles</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="received" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Received</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cycles">
          <FeedbackCycles />
        </TabsContent>

        <TabsContent value="requests">
          <PendingFeedbackRequests />
        </TabsContent>

        <TabsContent value="received">
          <ReceivedFeedback />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeedbackCycles() {
  const { cycles, isLoading, createCycle } = useFeedbackCycles();
  const { isAdmin } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_anonymous: false,
  });

  const handleSubmit = async () => {
    await createCycle.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({ name: '', description: '', start_date: '', end_date: '', is_anonymous: false });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Cycle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Feedback Cycle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Q4 2024 Review"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Annual performance review cycle"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                  />
                  <Label>Anonymous Feedback</Label>
                </div>
                <Button onClick={handleSubmit} disabled={createCycle.isPending} className="w-full">
                  Create Cycle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {cycles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Feedback Cycles</h3>
            <p className="text-muted-foreground">Create a feedback cycle to start collecting 360° feedback.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cycles.map((cycle: any) => (
            <Card key={cycle.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {cycle.name}
                      {getStatusBadge(cycle.status)}
                    </CardTitle>
                    <CardDescription>{cycle.description}</CardDescription>
                  </div>
                  {cycle.is_anonymous && (
                    <Badge variant="outline">Anonymous</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(cycle.start_date), 'MMM d')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PendingFeedbackRequests() {
  const { profile } = useAuth();
  const { requests, isLoading, updateRequest } = useFeedbackRequests();

  const myRequests = requests.filter((r: any) => r.reviewer?.id === profile?.id && r.status !== 'completed');

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending Feedback Requests</h2>
      
      {myRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">You have no pending feedback requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {myRequests.map((request: any) => (
            <Card key={request.id}>
              <CardContent className="p-3 sm:p-4 pt-3 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src={request.subject?.avatar_url} />
                      <AvatarFallback className="text-xs sm:text-sm">{request.subject?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Feedback for {request.subject?.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                        {request.feedback_type} review • {request.cycle?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-12 sm:ml-0">
                    {request.due_date && (
                      <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        Due: {format(new Date(request.due_date), 'MMM d')}
                      </span>
                    )}
                    <Button size="sm" className="min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm">Give Feedback</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReceivedFeedback() {
  const { profile } = useAuth();
  const { requests, isLoading } = useFeedbackRequests();

  const receivedRequests = requests.filter((r: any) => r.subject?.id === profile?.id && r.status === 'completed');

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Received Feedback</h2>
      
      {receivedRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Feedback Yet</h3>
            <p className="text-muted-foreground">You haven't received any feedback yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {receivedRequests.map((request: any) => (
            <Card key={request.id}>
              <CardContent className="p-3 sm:p-4 pt-3 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src={request.reviewer?.avatar_url} />
                      <AvatarFallback className="text-xs sm:text-sm">{request.reviewer?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">From {request.reviewer?.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                        {request.feedback_type} review
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-12 sm:ml-0 min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm w-fit">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
