import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface JobPosting {
  id: string;
  organization_id: string | null;
  title: string;
  department: string;
  location: string | null;
  type: 'full_time' | 'part_time' | 'contract' | 'intern';
  experience: string | null;
  description: string | null;
  requirements: string | null;
  salary_range_min: number | null;
  salary_range_max: number | null;
  status: 'draft' | 'open' | 'on_hold' | 'closed';
  applications_count: number | null;
  hiring_manager_id: string | null;
  posted_on: string | null;
  closes_on: string | null;
  created_at: string | null;
  updated_at: string | null;
  hiring_manager?: { id: string; full_name: string | null } | null;
}

export function useJobPostings() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const postingsQuery = useQuery({
    queryKey: ['job-postings', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('job_postings')
        .select(`*, hiring_manager:profiles!job_postings_hiring_manager_id_fkey(id, full_name)`)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as JobPosting[];
    },
    enabled: !!profile?.organization_id,
  });

  const createPosting = useMutation({
    mutationFn: async (posting: Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'hiring_manager'>) => {
      const { data, error } = await supabase.from('job_postings').insert({ ...posting, organization_id: profile?.organization_id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['job-postings'] }); toast.success('Job posting created'); },
    onError: (error) => toast.error(error.message),
  });

  const updatePosting = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobPosting> & { id: string }) => {
      const { data, error } = await supabase.from('job_postings').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['job-postings'] }); toast.success('Job posting updated'); },
    onError: (error) => toast.error(error.message),
  });

  const deletePosting = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('job_postings').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['job-postings'] }); toast.success('Job posting deleted'); },
    onError: (error) => toast.error(error.message),
  });

  return { postings: postingsQuery.data || [], isLoading: postingsQuery.isLoading, error: postingsQuery.error, createPosting, updatePosting, deletePosting };
}
