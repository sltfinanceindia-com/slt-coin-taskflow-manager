import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UnreadMessageCountProps {
  channelId?: string;
  className?: string;
  showZero?: boolean;
}

export function UnreadMessageCount({ channelId, className, showZero = false }: UnreadMessageCountProps) {
  const { profile } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages', profile?.id, channelId],
    queryFn: async () => {
      if (!profile?.id) return 0;

      if (channelId) {
        // Get unread count for specific channel
        const { data: readStatus } = await supabase
          .from('channel_read_status')
          .select('last_read_at')
          .eq('channel_id', channelId)
          .eq('user_id', profile.id)
          .single();

        const lastReadAt = readStatus?.last_read_at || '1970-01-01';

        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channelId)
          .neq('sender_id', profile.id)
          .gt('created_at', lastReadAt);

        if (error) return 0;
        return count || 0;
      } else {
        // Get total unread count across all channels
        const { data: channels } = await supabase
          .from('channel_members')
          .select('channel_id')
          .eq('user_id', profile.id);

        if (!channels || channels.length === 0) return 0;

        const channelIds = channels.map(c => c.channel_id);

        const { data: readStatuses } = await supabase
          .from('channel_read_status')
          .select('channel_id, last_read_at')
          .eq('user_id', profile.id)
          .in('channel_id', channelIds);

        const readStatusMap = new Map(
          readStatuses?.map(rs => [rs.channel_id, rs.last_read_at]) || []
        );

        let totalUnread = 0;

        for (const channelId of channelIds) {
          const lastReadAt = readStatusMap.get(channelId) || '1970-01-01';
          
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channelId)
            .neq('sender_id', profile.id)
            .gt('created_at', lastReadAt);

          totalUnread += count || 0;
        }

        return totalUnread;
      }
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "h-5 min-w-5 px-1.5 text-xs font-medium rounded-full",
        className
      )}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}

// Hook version for use in other components
export function useUnreadMessageCount(channelId?: string) {
  const { profile } = useAuth();

  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages', profile?.id, channelId],
    queryFn: async () => {
      if (!profile?.id) return 0;

      if (channelId) {
        const { data: readStatus } = await supabase
          .from('channel_read_status')
          .select('last_read_at')
          .eq('channel_id', channelId)
          .eq('user_id', profile.id)
          .single();

        const lastReadAt = readStatus?.last_read_at || '1970-01-01';

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channelId)
          .neq('sender_id', profile.id)
          .gt('created_at', lastReadAt);

        return count || 0;
      }

      // Total unread across all channels
      const { data: channels } = await supabase
        .from('channel_members')
        .select('channel_id')
        .eq('user_id', profile.id);

      if (!channels || channels.length === 0) return 0;

      const channelIds = channels.map(c => c.channel_id);
      let totalUnread = 0;

      const { data: readStatuses } = await supabase
        .from('channel_read_status')
        .select('channel_id, last_read_at')
        .eq('user_id', profile.id)
        .in('channel_id', channelIds);

      const readStatusMap = new Map(
        readStatuses?.map(rs => [rs.channel_id, rs.last_read_at]) || []
      );

      for (const chId of channelIds) {
        const lastReadAt = readStatusMap.get(chId) || '1970-01-01';
        
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', chId)
          .neq('sender_id', profile.id)
          .gt('created_at', lastReadAt);

        totalUnread += count || 0;
      }

      return totalUnread;
    },
    enabled: !!profile?.id,
    refetchInterval: 30000,
  });

  const markAsRead = async (chId: string) => {
    if (!profile?.id) return;

    await supabase
      .from('channel_read_status')
      .upsert({
        channel_id: chId,
        user_id: profile.id,
        last_read_at: new Date().toISOString(),
      }, {
        onConflict: 'channel_id,user_id'
      });

    refetch();
  };

  return { unreadCount, markAsRead, refetch };
}
