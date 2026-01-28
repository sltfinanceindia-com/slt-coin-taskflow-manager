import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// This hook works with the existing meeting_notes table schema
export interface MeetingNote {
  id: string;
  organization_id: string | null;
  meeting_id: string;
  content: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: { full_name: string } | null;
}

export type CreateMeetingNoteData = {
  meeting_id: string;
  content: string;
  is_private?: boolean;
};

export function useMeetingNotes(meetingId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['meeting-notes', profile?.organization_id, meetingId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('meeting_notes')
        .select('*, creator:profiles!created_by(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MeetingNote[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (note: CreateMeetingNoteData) => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .insert({
          ...note,
          organization_id: profile?.organization_id,
          created_by: profile?.id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes'] });
      toast({
        title: 'Note Added',
        description: 'Meeting note has been saved successfully.',
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
    mutationFn: async ({ id, ...updates }: Partial<MeetingNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes'] });
      toast({
        title: 'Note Updated',
        description: 'Meeting note has been updated successfully.',
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
        .from('meeting_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes'] });
      toast({
        title: 'Note Deleted',
        description: 'Meeting note has been removed.',
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
    meetingNotes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    createMeetingNote: createMutation.mutateAsync,
    updateMeetingNote: updateMutation.mutateAsync,
    deleteMeetingNote: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
