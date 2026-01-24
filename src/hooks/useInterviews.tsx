import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Interview {
  id: string;
  organization_id: string | null;
  job_posting_id: string | null;
  candidate_name: string;
  candidate_email: string | null;
  position: string;
  round: string;
  interviewer_ids: string[] | null;
  scheduled_at: string;
  duration_minutes: number | null;
  mode: 'video' | 'in_person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  feedback: string | null;
  rating: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useInterviews() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const interviewsQuery = useQuery({
    queryKey: ['interviews', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from('interviews').select('*').eq('organization_id', profile.organization_id).order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data as Interview[];
    },
    enabled: !!profile?.organization_id,
  });

  const createInterview = useMutation({
    mutationFn: async (interview: Omit<Interview, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'job_posting_id' | 'candidate_email' | 'feedback' | 'rating'> & { job_posting_id?: string | null; candidate_email?: string | null; feedback?: string | null; rating?: number | null }) => {
      const { data, error } = await supabase.from('interviews').insert({ ...interview, organization_id: profile?.organization_id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interviews'] }); toast.success('Interview scheduled'); },
    onError: (error) => toast.error(error.message),
  });

  const updateInterview = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Interview> & { id: string }) => {
      const { data, error } = await supabase.from('interviews').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interviews'] }); toast.success('Interview updated'); },
    onError: (error) => toast.error(error.message),
  });

  const deleteInterview = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('interviews').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interviews'] }); toast.success('Interview deleted'); },
    onError: (error) => toast.error(error.message),
  });

  return { interviews: interviewsQuery.data || [], isLoading: interviewsQuery.isLoading, error: interviewsQuery.error, createInterview, updateInterview, deleteInterview };
}
