import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BackgroundVerification {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  verification_type: 'identity' | 'education' | 'employment' | 'criminal' | 'reference' | 'address';
  vendor: string | null;
  status: 'pending' | 'in_progress' | 'verified' | 'failed' | 'inconclusive';
  progress: number | null;
  initiated_on: string | null;
  completed_on: string | null;
  findings: string | null;
  initiated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
}

export function useVerifications() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const verificationsQuery = useQuery({
    queryKey: ['background-verifications', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('background_verifications')
        .select(`
          *,
          employee:profiles!background_verifications_employee_id_fkey(id, full_name, email, department)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BackgroundVerification[];
    },
    enabled: !!profile?.organization_id,
  });

  const createVerification = useMutation({
    mutationFn: async (verification: Omit<BackgroundVerification, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase
        .from('background_verifications')
        .insert({ 
          ...verification, 
          organization_id: profile?.organization_id,
          initiated_by: profile?.id,
          initiated_on: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-verifications'] });
      toast.success('Verification initiated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateVerification = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BackgroundVerification> & { id: string }) => {
      const { data, error } = await supabase
        .from('background_verifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-verifications'] });
      toast.success('Verification updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteVerification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('background_verifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-verifications'] });
      toast.success('Verification deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    verifications: verificationsQuery.data || [],
    isLoading: verificationsQuery.isLoading,
    error: verificationsQuery.error,
    createVerification,
    updateVerification,
    deleteVerification,
  };
}
