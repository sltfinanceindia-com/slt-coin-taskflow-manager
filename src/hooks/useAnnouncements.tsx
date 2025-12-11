import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  priority: string;
  created_by: string;
  organization_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface AnnouncementRead {
  user_id: string;
  announcement_id: string;
  read_at: string;
}

export function useAnnouncements() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          creator:profiles!announcements_created_by_fkey(full_name, avatar_url)
        `)
        .eq('organization_id', profile.organization_id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch user's read announcements
  const { data: readAnnouncements } = useQuery({
    queryKey: ['announcement-reads', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('announcement_reads')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;
      return data as AnnouncementRead[];
    },
    enabled: !!profile?.id,
  });

  // Create announcement
  const createAnnouncement = useMutation({
    mutationFn: async (announcement: { title: string; content: string; priority?: string; is_pinned?: boolean }) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority || 'normal',
          is_pinned: announcement.is_pinned || false,
          created_by: profile?.id!,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created');
    },
    onError: (error) => {
      toast.error('Failed to create announcement');
      console.error(error);
    },
  });

  // Update announcement
  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: string }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated');
    },
  });

  // Delete announcement
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
    },
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcement_reads')
        .upsert({
          user_id: profile?.id,
          announcement_id: announcementId,
          organization_id: profile?.organization_id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-reads'] });
    },
  });

  // Check if announcement is read
  const isRead = (announcementId: string) => {
    return readAnnouncements?.some((r) => r.announcement_id === announcementId) || false;
  };

  // Get unread count
  const unreadCount = announcements?.filter((a) => !isRead(a.id)).length || 0;

  return {
    announcements: announcements || [],
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead,
    isRead,
    unreadCount,
  };
}
