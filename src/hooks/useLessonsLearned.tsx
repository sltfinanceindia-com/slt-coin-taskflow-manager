import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface LessonLearned {
  id: string;
  organization_id: string;
  title: string;
  project_id: string | null;
  project_name: string | null;
  category: string | null;
  what_went_well: string[] | null;
  what_went_wrong: string[] | null;
  recommendations: string[] | null;
  impact: 'low' | 'medium' | 'high' | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: { full_name: string } | null;
}

export type CreateLessonData = Omit<LessonLearned, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'creator'>;

export function useLessonsLearned() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const lessonsQuery = useQuery({
    queryKey: ['lessons-learned', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('lessons_learned')
        .select('*, creator:profiles!created_by(full_name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LessonLearned[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (lesson: CreateLessonData) => {
      const { data, error } = await supabase
        .from('lessons_learned')
        .insert({
          ...lesson,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons-learned'] });
      toast({
        title: 'Lesson Recorded',
        description: 'Lesson learned has been saved successfully.',
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
    mutationFn: async ({ id, ...updates }: Partial<LessonLearned> & { id: string }) => {
      const { data, error } = await supabase
        .from('lessons_learned')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons-learned'] });
      toast({
        title: 'Lesson Updated',
        description: 'Lesson learned has been updated successfully.',
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
        .from('lessons_learned')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons-learned'] });
      toast({
        title: 'Lesson Deleted',
        description: 'Lesson learned has been removed.',
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
    lessons: lessonsQuery.data || [],
    isLoading: lessonsQuery.isLoading,
    error: lessonsQuery.error,
    createLesson: createMutation.mutateAsync,
    updateLesson: updateMutation.mutateAsync,
    deleteLesson: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
