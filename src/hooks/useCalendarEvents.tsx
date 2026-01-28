import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  organization_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
  location: string | null;
  is_online: boolean | null;
  meeting_url: string | null;
  attendees: string[] | null;
  created_at: string;
  updated_at: string;
}

export type CreateCalendarEventData = Omit<CalendarEvent, 'id' | 'organization_id' | 'created_at' | 'updated_at'>;

export function useCalendarEvents(startDate?: Date, endDate?: Date) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['calendar-events', profile?.organization_id, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('end_time', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (event: CreateCalendarEventData) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...event,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Event Created',
        description: 'Calendar event has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Event Updated',
        description: 'Calendar event has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Event Deleted',
        description: 'Calendar event has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
