import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface QuickNote {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  color: string;
  reminder_at: string | null;
  task_id: string | null;
  is_completed: boolean;
  is_pinned: boolean;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useQuickNotes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['quick-notes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('user_id', profile.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QuickNote[];
    },
    enabled: !!profile?.id,
  });

  // Create note
  const createNote = useMutation({
    mutationFn: async (note: { title?: string | null; content: string; color?: string; reminder_at?: string | null }) => {
      const { data, error } = await supabase
        .from('quick_notes')
        .insert({
          title: note.title,
          content: note.content,
          color: note.color || '#FBBF24',
          reminder_at: note.reminder_at,
          user_id: profile?.id!,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
      toast.success('Note created');
    },
    onError: (error) => {
      toast.error('Failed to create note');
      console.error(error);
    },
  });

  // Update note
  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuickNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('quick_notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
    },
  });

  // Delete note
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quick_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
      toast.success('Note deleted');
    },
  });

  // Toggle pin
  const togglePin = useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase
        .from('quick_notes')
        .update({ is_pinned: !is_pinned })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
    },
  });

  // Toggle complete
  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from('quick_notes')
        .update({ is_completed: !is_completed })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
    },
  });

  return {
    notes: notes || [],
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleComplete,
  };
}
