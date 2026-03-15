import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TrainingProgram {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  category: string | null;
  trainer: string | null;
  trainer_id: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_hours: number | null;
  max_participants: number | null;
  current_participants: number | null;
  location: string | null;
  is_online: boolean | null;
  meeting_url: string | null;
  status: string | null;
  materials_url: string | null;
  is_mandatory: boolean | null;
  department: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useTrainingPrograms() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['training-programs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as TrainingProgram[];
    },
    enabled: !!profile?.organization_id,
  });

  const createProgram = useMutation({
    mutationFn: async (input: Partial<TrainingProgram>) => {
      const { data, error } = await supabase
        .from('training_programs')
        .insert({
          ...input,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Training program created');
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateProgram = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TrainingProgram> & { id: string }) => {
      const { error } = await supabase
        .from('training_programs')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Training program updated');
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProgram = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Training program deleted');
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    programs,
    isLoading,
    createProgram: createProgram.mutateAsync,
    updateProgram: updateProgram.mutateAsync,
    deleteProgram: deleteProgram.mutateAsync,
    isCreating: createProgram.isPending,
  };
}
