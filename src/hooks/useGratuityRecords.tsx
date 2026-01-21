import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GratuityRecord {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  joining_date: string;
  years_of_service: number | null;
  last_drawn_basic: number | null;
  gratuity_amount: number | null;
  status: 'not_eligible' | 'eligible' | 'nearing_eligibility' | 'paid';
  payment_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: { id: string; full_name: string | null; department: string | null } | null;
}

export function useGratuityRecords() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ['gratuity-records', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from('gratuity_records').select(`*, employee:profiles!gratuity_records_employee_id_fkey(id, full_name, department)`).eq('organization_id', profile.organization_id).order('years_of_service', { ascending: false });
      if (error) throw error;
      return data as GratuityRecord[];
    },
    enabled: !!profile?.organization_id,
  });

  const createRecord = useMutation({
    mutationFn: async (record: Omit<GratuityRecord, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase.from('gratuity_records').insert({ ...record, organization_id: profile?.organization_id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gratuity-records'] }); toast.success('Gratuity record created'); },
    onError: (error) => toast.error(error.message),
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GratuityRecord> & { id: string }) => {
      const { data, error } = await supabase.from('gratuity_records').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gratuity-records'] }); toast.success('Gratuity record updated'); },
    onError: (error) => toast.error(error.message),
  });

  return { records: recordsQuery.data || [], isLoading: recordsQuery.isLoading, error: recordsQuery.error, createRecord, updateRecord };
}
