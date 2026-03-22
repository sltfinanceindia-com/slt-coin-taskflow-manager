import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Megaphone, Plus, Pin, Clock, Trash2, Edit2, 
  Eye, EyeOff, AlertCircle, Info, AlertTriangle
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const priorityConfig = {
  low: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  normal: { icon: Megaphone, color: 'text-green-500', bg: 'bg-green-500/10' },
  high: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  urgent: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function Announcements() {
  const { 
    announcements, isLoading, createAnnouncement, 
    updateAnnouncement, deleteAnnouncement, markAsRead, isRead, unreadCount 
  } = useAnnouncements();
  const { isAdmin } = useUserRole();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isPinned, setIsPinned] = useState(false);

  const handleCreate = () => {
    createAnnouncement.mutate({
      title,
      content,
      priority,
      is_pinned: isPinned,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('normal');
    setIsPinned(false);
  };

  const handleView = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    if (!isRead(announcement.id)) {
      markAsRead.mutate(announcement.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg bg-muted/50">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Announcement title..."
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="Write your announcement..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch 
                          checked={isPinned} 
                          onCheckedChange={setIsPinned} 
                          id="pinned"
                        />
                        <Label htmlFor="pinned">Pin to top</Label>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreate} 
                      className="w-full"
                      disabled={!title.trim() || !content.trim() || createAnnouncement.isPending}
                    >
                      {createAnnouncement.isPending ? 'Creating...' : 'Create Announcement'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const config = priorityConfig[announcement.priority as keyof typeof priorityConfig] || priorityConfig.normal;
                const Icon = config.icon;
                const read = isRead(announcement.id);

                return (
                  <div
                    key={announcement.id}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/50',
                      !read && 'bg-primary/5 border-primary/30',
                      announcement.is_pinned && 'ring-1 ring-yellow-500/50'
                    )}
                    onClick={() => handleView(announcement)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-lg', config.bg)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{announcement.title}</h4>
                          {announcement.is_pinned && (
                            <Pin className="h-3 w-3 text-yellow-500" />
                          )}
                          {!read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                          </span>
                          {announcement.creator && (
                            <span>by {announcement.creator.full_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {announcements.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Announcement Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnouncement?.title}
              {selectedAnnouncement?.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-4 border-t">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedAnnouncement?.creator?.avatar_url || undefined} />
                <AvatarFallback>
                  {selectedAnnouncement?.creator?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{selectedAnnouncement?.creator?.full_name}</p>
                <p>{selectedAnnouncement?.created_at && format(new Date(selectedAnnouncement.created_at), 'PPP p')}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteAnnouncement.mutate(selectedAnnouncement.id);
                    setSelectedAnnouncement(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
