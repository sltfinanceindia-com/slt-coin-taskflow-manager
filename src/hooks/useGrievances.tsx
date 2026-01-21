import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Grievance {
  id: string;
  organization_id: string | null;
  ticket_id: string;
  employee_id: string | null;
  category: string;
  subject: string;
  description: string | null;
  status: 'open' | 'under_investigation' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_anonymous: boolean | null;
  assigned_to: string | null;
  resolution_date: string | null;
  resolution_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  assignee?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useGrievances() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const grievancesQuery = useQuery({
    queryKey: ['grievances', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('grievances')
        .select(`
          *,
          employee:profiles!grievances_employee_id_fkey(id, full_name, email),
          assignee:profiles!grievances_assigned_to_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Grievance[];
    },
    enabled: !!profile?.organization_id,
  });

  const createGrievance = useMutation({
    mutationFn: async (grievance: Omit<Grievance, 'id' | 'created_at' | 'updated_at' | 'employee' | 'assignee'>) => {
      const ticketId = `GRV-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabase
        .from('grievances')
        .insert({ 
          ...grievance, 
          ticket_id: ticketId,
          organization_id: profile?.organization_id 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Grievance logged successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateGrievance = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Grievance> & { id: string }) => {
      const { data, error } = await supabase
        .from('grievances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Grievance updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteGrievance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('grievances')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Grievance deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    grievances: grievancesQuery.data || [],
    isLoading: grievancesQuery.isLoading,
    error: grievancesQuery.error,
    createGrievance,
    updateGrievance,
    deleteGrievance,
  };
}
