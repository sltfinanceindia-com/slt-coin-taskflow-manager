import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrainingSection } from '@/types/training';
import { useAuth } from '@/hooks/useAuth';

export function useTrainingSections(enabled: boolean = true) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['published-training-sections', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('training_sections')
        .select(`
          *,
          training_videos(*),
          training_assignments(*)
        `)
        .eq('is_published', true)
        .eq('organization_id', profile.organization_id)
        .order('order_index');
      
      if (error) throw error;
      return data as TrainingSection[];
    },
    enabled: enabled && !!profile?.organization_id
  });
}
