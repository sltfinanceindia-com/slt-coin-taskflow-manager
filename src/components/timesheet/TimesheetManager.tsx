import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle, XCircle, Send, Plus, FileText, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface Timesheet {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  overtime_hours: number;
  status: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  employee?: { full_name: string; email: string };
}

interface TimesheetEntry {
  id: string;
  timesheet_id: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  project_id: string | null;
  task_id: string | null;
  description: string | null;
}

export function TimesheetManager() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [newEntries, setNewEntries] = useState<Record<string, { regular: number; overtime: number; description: string }>>({});
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch timesheets
  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['timesheets', profile?.id],
    queryFn: async () => {
      const query = supabase
        .from('timesheets')
        .select(`
          *,
          employee:profiles!timesheets_employee_id_fkey(full_name, email)
        `)
        .order('period_start', { ascending: false });

      if (!isAdmin) {
        query.eq('employee_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Timesheet[];
    },
    enabled: !!profile?.id
  });

  // Fetch entries for selected timesheet
  const { data: entries } = useQuery({
    queryKey: ['timesheet-entries', selectedTimesheet?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_id', selectedTimesheet!.id)
        .order('work_date');
      if (error) throw error;
      return data as TimesheetEntry[];
    },
    enabled: !!selectedTimesheet?.id
  });

  // Create new timesheet
  const createTimesheet = useMutation({
    mutationFn: async () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          employee_id: profile?.id,
          organization_id: profile?.organization_id,
          period_start: format(weekStart, 'yyyy-MM-dd'),
          period_end: format(weekEnd, 'yyyy-MM-dd'),
          status: 'draft'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      setSelectedTimesheet(data);
      toast.success('Timesheet created for this week');
    },
    onError: () => toast.error('Failed to create timesheet')
  });

  // Submit timesheet
  const submitTimesheet = useMutation({
    mutationFn: async (timesheetId: string) => {
      const { error } = await supabase
        .from('timesheets')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', timesheetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      toast.success('Timesheet submitted for approval');
    }
  });

  // Approve/Reject timesheet
  const reviewTimesheet = useMutation({
    mutationFn: async ({ id, approved, reason }: { id: string; approved: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('timesheets')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      toast.success(approved ? 'Timesheet approved' : 'Timesheet rejected');
      setRejectionReason('');
    }
  });

  // Save entry
  const saveEntry = useMutation({
    mutationFn: async ({ date, regular, overtime, description }: { date: string; regular: number; overtime: number; description: string }) => {
      const { error } = await supabase
        .from('timesheet_entries')
        .upsert({
          timesheet_id: selectedTimesheet!.id,
          organization_id: profile?.organization_id,
          work_date: date,
          regular_hours: regular,
          overtime_hours: overtime,
          description
        }, { onConflict: 'timesheet_id,work_date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-entries'] });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
      draft: { variant: 'secondary', icon: FileText },
      submitted: { variant: 'default', icon: Send },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle }
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getWeekDays = (start: string) => {
    const startDate = parseISO(start);
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  };

  const pendingApprovals = timesheets?.filter(t => t.status === 'submitted') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Timesheet Management</h2>
          <p className="text-muted-foreground">Submit and track weekly timesheets</p>
        </div>
        {!isAdmin && (
          <Button onClick={() => createTimesheet.mutate()} disabled={createTimesheet.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            New Timesheet
          </Button>
        )}
      </div>

      <Tabs defaultValue={isAdmin ? "approvals" : "my-timesheets"}>
        <TabsList>
          {!isAdmin && <TabsTrigger value="my-timesheets">My Timesheets</TabsTrigger>}
          {isAdmin && (
            <TabsTrigger value="approvals" className="relative">
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="all">All Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="my-timesheets" className="space-y-4">
          {isLoading ? (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">Loading timesheets...</div>
              </CardContent>
            </Card>
          ) : timesheets?.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Timesheets Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first weekly timesheet</p>
                <Button onClick={() => createTimesheet.mutate()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Timesheet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {timesheets?.map((timesheet) => (
                <Card key={timesheet.id} className="card-gradient hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {format(parseISO(timesheet.period_start), 'MMM d')} - {format(parseISO(timesheet.period_end), 'MMM d, yyyy')}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timesheet.total_hours || 0}h regular
                            </span>
                            {timesheet.overtime_hours > 0 && (
                              <span className="text-amber-600">+{timesheet.overtime_hours}h OT</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(timesheet.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedTimesheet(timesheet)}>
                              {timesheet.status === 'draft' ? 'Edit' : 'View'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Timesheet: {format(parseISO(timesheet.period_start), 'MMM d')} - {format(parseISO(timesheet.period_end), 'MMM d, yyyy')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Regular Hours</TableHead>
                                    <TableHead>Overtime</TableHead>
                                    <TableHead>Description</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getWeekDays(timesheet.period_start).map((day) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const entry = entries?.find(e => e.work_date === dateStr);
                                    const localEntry = newEntries[dateStr] || { 
                                      regular: entry?.regular_hours || 0, 
                                      overtime: entry?.overtime_hours || 0,
                                      description: entry?.description || ''
                                    };
                                    
                                    return (
                                      <TableRow key={dateStr}>
                                        <TableCell className="font-medium">{format(day, 'EEEE')}</TableCell>
                                        <TableCell>{format(day, 'MMM d')}</TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={localEntry.regular}
                                            onChange={(e) => setNewEntries(prev => ({
                                              ...prev,
                                              [dateStr]: { ...localEntry, regular: parseFloat(e.target.value) || 0 }
                                            }))}
                                            onBlur={() => saveEntry.mutate({ 
                                              date: dateStr, 
                                              regular: localEntry.regular,
                                              overtime: localEntry.overtime,
                                              description: localEntry.description
                                            })}
                                            disabled={timesheet.status !== 'draft'}
                                            className="w-20"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={localEntry.overtime}
                                            onChange={(e) => setNewEntries(prev => ({
                                              ...prev,
                                              [dateStr]: { ...localEntry, overtime: parseFloat(e.target.value) || 0 }
                                            }))}
                                            onBlur={() => saveEntry.mutate({ 
                                              date: dateStr, 
                                              regular: localEntry.regular,
                                              overtime: localEntry.overtime,
                                              description: localEntry.description
                                            })}
                                            disabled={timesheet.status !== 'draft'}
                                            className="w-20"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            value={localEntry.description}
                                            onChange={(e) => setNewEntries(prev => ({
                                              ...prev,
                                              [dateStr]: { ...localEntry, description: e.target.value }
                                            }))}
                                            onBlur={() => saveEntry.mutate({ 
                                              date: dateStr, 
                                              regular: localEntry.regular,
                                              overtime: localEntry.overtime,
                                              description: localEntry.description
                                            })}
                                            disabled={timesheet.status !== 'draft'}
                                            placeholder="Work description..."
                                          />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>

                              {timesheet.status === 'draft' && (
                                <div className="flex justify-end">
                                  <Button onClick={() => submitTimesheet.mutate(timesheet.id)}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Approval
                                  </Button>
                                </div>
                              )}

                              {timesheet.status === 'rejected' && timesheet.rejection_reason && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                  <div className="flex items-center gap-2 text-destructive font-medium mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Rejection Reason
                                  </div>
                                  <p className="text-sm text-muted-foreground">{timesheet.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold">All Caught Up!</h3>
                <p className="text-muted-foreground">No timesheets pending approval</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApprovals.map((timesheet) => (
                <Card key={timesheet.id} className="card-gradient border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{timesheet.employee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(timesheet.period_start), 'MMM d')} - {format(parseISO(timesheet.period_end), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm">
                            {timesheet.total_hours || 0}h regular
                            {timesheet.overtime_hours > 0 && ` + ${timesheet.overtime_hours}h OT`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => reviewTimesheet.mutate({ id: timesheet.id, approved: true })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Timesheet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <Button 
                                variant="destructive"
                                onClick={() => reviewTimesheet.mutate({ 
                                  id: timesheet.id, 
                                  approved: false, 
                                  reason: rejectionReason 
                                })}
                                disabled={!rejectionReason}
                              >
                                Confirm Rejection
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>All Timesheets</CardTitle>
              <CardDescription>Complete timesheet history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead>Employee</TableHead>}
                    <TableHead>Period</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheets?.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      {isAdmin && <TableCell>{timesheet.employee?.full_name}</TableCell>}
                      <TableCell>
                        {format(parseISO(timesheet.period_start), 'MMM d')} - {format(parseISO(timesheet.period_end), 'MMM d')}
                      </TableCell>
                      <TableCell>{timesheet.total_hours || 0}h</TableCell>
                      <TableCell>{timesheet.overtime_hours || 0}h</TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell>
                        {timesheet.submitted_at 
                          ? format(parseISO(timesheet.submitted_at), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
