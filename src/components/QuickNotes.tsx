import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  StickyNote, Plus, Pin, Trash2, Check, Clock, 
  Edit2, MoreVertical, Palette
} from 'lucide-react';
import { useQuickNotes } from '@/hooks/useQuickNotes';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const noteColors = [
  { value: '#FBBF24', label: 'Yellow' },
  { value: '#34D399', label: 'Green' },
  { value: '#60A5FA', label: 'Blue' },
  { value: '#F472B6', label: 'Pink' },
  { value: '#A78BFA', label: 'Purple' },
  { value: '#FB923C', label: 'Orange' },
];

export function QuickNotes() {
  const { notes, isLoading, createNote, updateNote, deleteNote, togglePin, toggleComplete } = useQuickNotes();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FBBF24');
  const [reminderAt, setReminderAt] = useState('');

  const handleCreate = () => {
    createNote.mutate({
      title: title.trim() || null,
      content,
      color,
      reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingNote) return;
    updateNote.mutate({
      id: editingNote.id,
      title: title.trim() || null,
      content,
      color,
      reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
    }, {
      onSuccess: () => {
        setEditingNote(null);
        resetForm();
      },
    });
  };

  const startEdit = (note: any) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content);
    setColor(note.color);
    setReminderAt(note.reminder_at ? format(new Date(note.reminder_at), "yyyy-MM-dd'T'HH:mm") : '');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor('#FBBF24');
    setReminderAt('');
  };

  const pinnedNotes = notes.filter(n => n.is_pinned);
  const regularNotes = notes.filter(n => !n.is_pinned);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Quick Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse h-32 rounded-lg bg-muted/50" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const NoteForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <Input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Title (optional)"
      />
      <Textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Write your note..."
        rows={4}
      />
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Color</label>
        <div className="flex gap-2">
          {noteColors.map((c) => (
            <button
              key={c.value}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                color === c.value ? 'border-foreground scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: c.value }}
              onClick={() => setColor(c.value)}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Reminder (optional)</label>
        <Input 
          type="datetime-local" 
          value={reminderAt} 
          onChange={(e) => setReminderAt(e.target.value)} 
        />
      </div>
      <Button 
        onClick={onSubmit} 
        className="w-full"
        disabled={!content.trim()}
      >
        {submitLabel}
      </Button>
    </div>
  );

  const NoteCard = ({ note }: { note: any }) => {
    const hasReminder = note.reminder_at && !note.is_completed;
    const isOverdue = hasReminder && isPast(new Date(note.reminder_at));

    return (
      <div
        className={cn(
          'relative p-3 rounded-lg border transition-all group',
          note.is_completed && 'opacity-60'
        )}
        style={{ 
          backgroundColor: note.color + '20',
          borderColor: note.color + '50'
        }}
      >
        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => togglePin.mutate({ id: note.id, is_pinned: note.is_pinned })}>
                <Pin className="h-4 w-4 mr-2" />
                {note.is_pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleComplete.mutate({ id: note.id, is_completed: note.is_completed })}>
                <Check className="h-4 w-4 mr-2" />
                {note.is_completed ? 'Mark incomplete' : 'Mark complete'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startEdit(note)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteNote.mutate(note.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className={cn(note.is_completed && 'line-through')}>
          {note.title && (
            <h4 className="font-semibold text-sm mb-1 pr-6">{note.title}</h4>
          )}
          <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {note.is_pinned && (
            <Pin className="h-3 w-3" style={{ color: note.color }} />
          )}
          {hasReminder && (
            <Badge 
              variant={isOverdue ? 'destructive' : 'secondary'} 
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(note.reminder_at), { addSuffix: true })}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Quick Notes
              <Badge variant="secondary">{notes.length}</Badge>
            </CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Note</DialogTitle>
                </DialogHeader>
                <NoteForm onSubmit={handleCreate} submitLabel="Create Note" />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Pin className="h-3 w-3" /> Pinned
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pinnedNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes */}
              {regularNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Others</h4>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {regularNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {notes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notes yet</p>
                  <p className="text-sm">Create your first note to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => { setEditingNote(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <NoteForm onSubmit={handleUpdate} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </>
  );
}
