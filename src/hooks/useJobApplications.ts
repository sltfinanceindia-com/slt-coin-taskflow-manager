import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'technical' | 'hr' | 'offer' | 'hired' | 'rejected';

export interface JobApplication {
  id: string;
  job_posting_id: string | null;
  candidate_name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string | null;
  stage: ApplicationStage;
  source: string | null;
  experience_years: number;
  current_salary: number;
  expected_salary: number;
  resume_url: string | null;
  notes: string | null;
  interview_date: string | null;
  rejection_reason: string | null;
  hired_profile_id: string | null;
  organization_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  candidate_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  source?: string;
  experience_years?: number;
  current_salary?: number;
  expected_salary?: number;
  notes?: string;
  job_posting_id?: string;
}

export const APPLICATION_STAGES = [
  { key: 'applied' as const, label: 'Applied', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  { key: 'screening' as const, label: 'Screening', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
  { key: 'interview' as const, label: 'Interview', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
  { key: 'technical' as const, label: 'Technical', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200' },
  { key: 'hr' as const, label: 'HR Round', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' },
  { key: 'offer' as const, label: 'Offer', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' },
  { key: 'hired' as const, label: 'Hired', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
  { key: 'rejected' as const, label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' },
];

export function useJobApplications(filter?: ApplicationStage | 'all') {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all applications
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['job-applications', profile?.organization_id, filter],
    queryFn: async () => {
      let query = supabase
        .from('job_applications')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (filter && filter !== 'all') {
        query = query.eq('stage', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JobApplication[];
    },
    enabled: !!profile?.organization_id,
  });

  // Create application
  const createApplication = useMutation({
    mutationFn: async (input: CreateApplicationInput) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          candidate_name: input.candidate_name,
          email: input.email,
          phone: input.phone || null,
          position: input.position,
          department: input.department || null,
          source: input.source || 'direct',
          experience_years: input.experience_years || 0,
          current_salary: input.current_salary || 0,
          expected_salary: input.expected_salary || 0,
          notes: input.notes || null,
          job_posting_id: input.job_posting_id || null,
          stage: 'applied',
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({ title: 'Candidate added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding candidate', description: error.message, variant: 'destructive' });
    },
  });

  // Update stage
  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: ApplicationStage }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ stage })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({ title: 'Stage updated successfully' });
    },
  });

  // Update application
  const updateApplication = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobApplication> & { id: string }) => {
      const { error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({ title: 'Application updated' });
    },
  });

  // Delete application
  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({ title: 'Application deleted' });
    },
  });

  // Get stage stats
  const stageStats = APPLICATION_STAGES.map(stage => ({
    ...stage,
    count: applications?.filter(a => a.stage === stage.key).length || 0,
  }));

  return {
    applications: applications || [],
    isLoading,
    error,
    stageStats,
    createApplication,
    updateStage,
    updateApplication,
    deleteApplication,
  };
}
