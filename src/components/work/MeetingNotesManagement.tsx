import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Users, Calendar, CheckSquare, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface MeetingNote {
  id: string;
  title: string;
  meeting_date: string;
  attendees: string[];
  notes: string;
  action_items: { task: string; assignee: string; completed: boolean }[];
  decisions: string[];
  created_by: string;
  created_at: string;
}

export function MeetingNotesManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    meeting_date: format(new Date(), 'yyyy-MM-dd'),
    attendees: '',
    notes: '',
    action_items: '',
    decisions: ''
  });

  const { data: meetingNotes, isLoading } = useQuery({
    queryKey: ['meeting-notes'],
    queryFn: async () => {
      return [
        {
          id: '1',
          title: 'Weekly Sprint Planning',
          meeting_date: format(new Date(), 'yyyy-MM-dd'),
          attendees: ['John Doe', 'Jane Smith', 'Bob Wilson'],
          notes: 'Discussed upcoming sprint goals and prioritized backlog items.',
          action_items: [
            { task: 'Create wireframes for new feature', assignee: 'Jane Smith', completed: false },
            { task: 'Review API documentation', assignee: 'Bob Wilson', completed: true }
          ],
          decisions: ['Prioritize mobile responsiveness', 'Defer admin dashboard to next sprint'],
          created_by: profile?.id || '',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Q1 Planning Review',
          meeting_date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          attendees: ['Leadership Team', 'Product Managers'],
          notes: 'Reviewed Q1 objectives and set quarterly KPIs.',
          action_items: [
            { task: 'Finalize budget allocation', assignee: 'Finance', completed: false },
            { task: 'Update roadmap document', assignee: 'Product', completed: false }
          ],
          decisions: ['Increase hiring by 20%', 'Launch new product in March'],
          created_by: profile?.id || '',
          created_at: new Date().toISOString()
        }
      ] as MeetingNote[];
    }
  });

  const handleSubmit = () => {
    toast.success('Meeting notes saved successfully');
    setIsDialogOpen(false);
    setFormData({
      title: '',
      meeting_date: format(new Date(), 'yyyy-MM-dd'),
      attendees: '',
      notes: '',
      action_items: '',
      decisions: ''
    });
  };

  const handleDelete = (id: string) => {
    toast.success('Meeting notes deleted');
    queryClient.invalidateQueries({ queryKey: ['meeting-notes'] });
  };

  const filteredNotes = meetingNotes?.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Meeting Notes
          </h2>
          <p className="text-muted-foreground">Document meetings with action items tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Meeting Notes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Meeting Notes</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meeting Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Weekly Sprint Planning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting Date</Label>
                    <Input
                      type="date"
                      value={formData.meeting_date}
                      onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Attendees (comma separated)</Label>
                  <Input
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    placeholder="John Doe, Jane Smith, Bob Wilson"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meeting Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter meeting notes and discussion points..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Action Items (one per line, format: "Task - Assignee")</Label>
                  <Textarea
                    value={formData.action_items}
                    onChange={(e) => setFormData({ ...formData, action_items: e.target.value })}
                    placeholder="Create wireframes - Jane Smith&#10;Review documentation - Bob Wilson"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decisions Made (one per line)</Label>
                  <Textarea
                    value={formData.decisions}
                    onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                    placeholder="Decision 1&#10;Decision 2"
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">Save Meeting Notes</Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meeting notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{meetingNotes?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {meetingNotes?.reduce((acc, note) => 
                  acc + note.action_items.filter(a => !a.completed).length, 0
                ) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {meetingNotes?.filter(n => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(n.meeting_date) >= weekAgo;
                }).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <Card className="col-span-2">
            <CardContent className="py-8 text-center">Loading meeting notes...</CardContent>
          </Card>
        ) : filteredNotes?.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              No meeting notes found
            </CardContent>
          </Card>
        ) : (
          filteredNotes?.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(note.meeting_date), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4" />
                    Attendees
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {note.attendees.map((attendee, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{attendee}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{note.notes}</p>
                </div>
                {note.action_items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Action Items</p>
                    <ul className="space-y-1">
                      {note.action_items.map((item, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <CheckSquare className={`h-4 w-4 ${item.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                            {item.task}
                          </span>
                          <span className="text-muted-foreground">({item.assignee})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {note.decisions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Decisions</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {note.decisions.map((decision, i) => (
                        <li key={i}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
