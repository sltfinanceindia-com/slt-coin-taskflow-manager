import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Confirmation {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  probation_id: string | null;
  confirmation_date: string | null;
  letter_status: 'pending' | 'generated' | 'sent' | 'acknowledged';
  salary_revision: boolean | null;
  previous_salary: number | null;
  revised_salary: number | null;
  letter_url: string | null;
  generated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
}

export function useConfirmations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const confirmationsQuery = useQuery({
    queryKey: ['confirmations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('confirmations')
        .select(`
          *,
          employee:profiles!confirmations_employee_id_fkey(id, full_name, email, department)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Confirmation[];
    },
    enabled: !!profile?.organization_id,
  });

  const createConfirmation = useMutation({
    mutationFn: async (confirmation: Omit<Confirmation, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase
        .from('confirmations')
        .insert({ 
          ...confirmation, 
          organization_id: profile?.organization_id,
          generated_by: profile?.id
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      toast.success('Confirmation letter generated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateConfirmation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Confirmation> & { id: string }) => {
      const { data, error } = await supabase
        .from('confirmations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      toast.success('Confirmation updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteConfirmation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('confirmations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations'] });
      toast.success('Confirmation deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    confirmations: confirmationsQuery.data || [],
    isLoading: confirmationsQuery.isLoading,
    error: confirmationsQuery.error,
    createConfirmation,
    updateConfirmation,
    deleteConfirmation,
  };
}
