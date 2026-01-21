import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DisciplinaryAction {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  action_type: 'verbal_warning' | 'written_warning' | 'suspension' | 'pip' | 'termination';
  reason: string;
  description: string | null;
  status: 'active' | 'resolved' | 'appealed' | 'expired';
  issued_by: string | null;
  issued_date: string;
  expiry_date: string | null;
  witnesses: string[] | null;
  documents: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
  issuer?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useDisciplinaryActions() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const actionsQuery = useQuery({
    queryKey: ['disciplinary-actions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('disciplinary_actions')
        .select(`
          *,
          employee:profiles!disciplinary_actions_employee_id_fkey(id, full_name, email, department),
          issuer:profiles!disciplinary_actions_issued_by_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('issued_date', { ascending: false });
      if (error) throw error;
      return data as DisciplinaryAction[];
    },
    enabled: !!profile?.organization_id,
  });

  const createAction = useMutation({
    mutationFn: async (action: Omit<DisciplinaryAction, 'id' | 'created_at' | 'updated_at' | 'employee' | 'issuer'>) => {
      const { data, error } = await supabase
        .from('disciplinary_actions')
        .insert({ 
          ...action, 
          organization_id: profile?.organization_id,
          issued_by: profile?.id 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinary-actions'] });
      toast.success('Disciplinary action recorded successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateAction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DisciplinaryAction> & { id: string }) => {
      const { data, error } = await supabase
        .from('disciplinary_actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinary-actions'] });
      toast.success('Disciplinary action updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteAction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('disciplinary_actions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinary-actions'] });
      toast.success('Disciplinary action deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    actions: actionsQuery.data || [],
    isLoading: actionsQuery.isLoading,
    error: actionsQuery.error,
    createAction,
    updateAction,
    deleteAction,
  };
}
