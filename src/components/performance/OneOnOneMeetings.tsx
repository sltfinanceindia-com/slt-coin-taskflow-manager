import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOneOnOneMeetings, useMeetingDetails } from '@/hooks/usePerformanceManagement';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { Plus, Calendar, Clock, Video, MapPin, CheckCircle, ListTodo, FileText, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function OneOnOneMeetings() {
  const { meetings, isLoading, createMeeting, updateMeeting } = useOneOnOneMeetings();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    employee_id: '',
    scheduled_at: '',
    duration_minutes: 30,
    is_recurring: false,
    recurrence_pattern: '',
    location: '',
    meeting_url: '',
  });

  const handleSubmit = async () => {
    await createMeeting.mutateAsync({
      ...formData,
      manager_id: profile?.id || '',
    });
    setDialogOpen(false);
    setFormData({
      employee_id: '',
      scheduled_at: '',
      duration_minutes: 30,
      is_recurring: false,
      recurrence_pattern: '',
      location: '',
      meeting_url: '',
    });
  };

  const upcomingMeetings = meetings.filter((m: any) => isFuture(new Date(m.scheduled_at)) || isToday(new Date(m.scheduled_at)));
  const pastMeetings = meetings.filter((m: any) => isPast(new Date(m.scheduled_at)) && !isToday(new Date(m.scheduled_at)));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">1:1 Meetings</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Schedule and manage one-on-one meetings with your team
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule 1:1 Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee</Label>
                  <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter((e: any) => e.id !== profile?.id).map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Select 
                    value={formData.duration_minutes.toString()} 
                    onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  />
                  <Label>Recurring Meeting</Label>
                </div>
                {formData.is_recurring && (
                  <div>
                    <Label>Recurrence Pattern</Label>
                    <Select 
                      value={formData.recurrence_pattern} 
                      onValueChange={(v) => setFormData({ ...formData, recurrence_pattern: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Location (optional)</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Conference Room A"
                  />
                </div>
                <div>
                  <Label>Meeting URL (optional)</Label>
                  <Input
                    value={formData.meeting_url}
                    onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <Button onClick={handleSubmit} disabled={createMeeting.isPending} className="w-full">
                  Schedule Meeting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="h-4 w-4" />
            Past ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Upcoming Meetings</h3>
                <p className="text-muted-foreground">Schedule a 1:1 meeting to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting: any) => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  profile={profile}
                  onSelect={() => setSelectedMeeting(meeting.id)}
                  isSelected={selectedMeeting === meeting.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Past Meetings</h3>
                <p className="text-muted-foreground">Your completed meetings will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map((meeting: any) => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  profile={profile}
                  onSelect={() => setSelectedMeeting(meeting.id)}
                  isSelected={selectedMeeting === meeting.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedMeeting && (
        <MeetingDetailsPanel 
          meetingId={selectedMeeting} 
          onClose={() => setSelectedMeeting(null)} 
        />
      )}
    </div>
  );
}

function MeetingCard({ meeting, profile, onSelect, isSelected }: any) {
  const otherPerson = meeting.manager?.id === profile?.id ? meeting.employee : meeting.manager;
  const isManager = meeting.manager?.id === profile?.id;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { variant: 'default' },
      completed: { variant: 'outline' },
      cancelled: { variant: 'destructive' },
      rescheduled: { variant: 'secondary' },
    };
    return <Badge variant={variants[status]?.variant || 'secondary'}>{status}</Badge>;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
      onClick={onSelect}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherPerson?.avatar_url} />
              <AvatarFallback>{otherPerson?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{otherPerson?.full_name}</span>
                {getStatusBadge(meeting.status)}
                {meeting.is_recurring && <Badge variant="outline">Recurring</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(meeting.scheduled_at), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(meeting.scheduled_at), 'h:mm a')} ({meeting.duration_minutes} min)
                </span>
                {meeting.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {meeting.location}
                  </span>
                )}
                {meeting.meeting_url && (
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    Video call
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline">{isManager ? 'Manager' : 'Employee'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function MeetingDetailsPanel({ meetingId, onClose }: { meetingId: string; onClose: () => void }) {
  const { agendaItems, notes, actionItems, isLoading, addAgendaItem, addNote, addActionItem } = useMeetingDetails(meetingId);
  const [newAgenda, setNewAgenda] = useState('');
  const [newNote, setNewNote] = useState('');

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Meeting Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agenda">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agenda" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Agenda ({agendaItems.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Actions ({actionItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add agenda item..."
                value={newAgenda}
                onChange={(e) => setNewAgenda(e.target.value)}
              />
              <Button 
                onClick={() => {
                  if (newAgenda.trim()) {
                    addAgendaItem.mutate({ topic: newAgenda });
                    setNewAgenda('');
                  }
                }}
                disabled={addAgendaItem.isPending}
              >
                Add
              </Button>
            </div>
            {agendaItems.map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <CheckCircle className={`h-4 w-4 ${item.is_discussed ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={item.is_discussed ? 'line-through text-muted-foreground' : ''}>{item.topic}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add meeting notes..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <Button 
              onClick={() => {
                if (newNote.trim()) {
                  addNote.mutate({ content: newNote });
                  setNewNote('');
                }
              }}
              disabled={addNote.isPending}
              className="w-full"
            >
              Save Note
            </Button>
            {notes.map((note: any) => (
              <div key={note.id} className="p-3 bg-muted/50 rounded">
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {note.created_by_profile?.full_name} • {format(new Date(note.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="mt-4 space-y-4">
            {actionItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No action items yet.</p>
            ) : (
              actionItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {item.assigned_to_profile?.full_name}
                      {item.due_date && ` • Due: ${format(new Date(item.due_date), 'MMM d')}`}
                    </p>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
