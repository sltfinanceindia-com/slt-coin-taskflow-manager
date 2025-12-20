import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Megaphone, 
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical';
  is_active: boolean;
  target_audience: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export default function PlatformAnnouncements() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'critical',
    target_audience: 'all',
    is_active: true,
  });

  const fetchAnnouncements = async () => {
    if (!isSuperAdmin) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('platform_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [isSuperAdmin]);

  const handleSubmit = async () => {
    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('platform_announcements')
          .update({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            target_audience: formData.target_audience,
            is_active: formData.is_active,
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast.success('Announcement updated');
      } else {
        const { error } = await supabase
          .from('platform_announcements')
          .insert({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            target_audience: formData.target_audience,
            is_active: formData.is_active,
            created_by: profile?.id,
          });

        if (error) throw error;
        toast.success('Announcement created');
      }

      setIsDialogOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', type: 'info', target_audience: 'all', is_active: true });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_announcements')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const { error } = await supabase
        .from('platform_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      is_active: announcement.is_active,
    });
    setIsDialogOpen(true);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge className="bg-amber-500">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-primary" />
              Platform Announcements
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create and manage platform-wide announcements
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingAnnouncement(null);
              setFormData({ title: '', content: '', type: 'info', target_audience: 'all', is_active: true });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </DialogTitle>
                <DialogDescription>
                  This announcement will be visible to all users based on the target audience
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                    placeholder="Announcement content"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData(f => ({ ...f, type: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select 
                      value={formData.target_audience} 
                      onValueChange={(v) => setFormData(f => ({ ...f, target_audience: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="org_admins">Org Admins Only</SelectItem>
                        <SelectItem value="users">Regular Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">Show this announcement to users</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(f => ({ ...f, is_active: checked }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.title || !formData.content}>
                  {editingAnnouncement ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={!announcement.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        announcement.type === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                        announcement.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      }`}>
                        {getTypeIcon(announcement.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          {getTypeBadge(announcement.type)}
                          <Badge variant="outline" className="text-xs">
                            {announcement.target_audience === 'all' ? 'All Users' : 
                             announcement.target_audience === 'org_admins' ? 'Org Admins' : 'Users'}
                          </Badge>
                          {!announcement.is_active && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                      >
                        {announcement.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No announcements yet</p>
              <p className="text-sm">Create your first platform announcement</p>
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
