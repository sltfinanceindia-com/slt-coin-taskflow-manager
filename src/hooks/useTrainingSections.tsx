
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrainingSection } from '@/types/training';

export function useTrainingSections(enabled: boolean = true) {
  return useQuery({
    queryKey: ['published-training-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sections')
        .select(`
          *,
          training_videos(*),
          training_assignments(*)
        `)
        .eq('is_published', true)
        .order('order_index');
      
      if (error) throw error;
      return data as TrainingSection[];
    },
    enabled
  });
}
