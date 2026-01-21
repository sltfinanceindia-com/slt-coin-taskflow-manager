import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EmployeeContract {
  id: string;
  organization_id: string | null;
  employee_id: string | null;
  contract_type: 'permanent' | 'temporary' | 'contract' | 'intern' | 'consultant';
  start_date: string;
  end_date: string | null;
  status: 'draft' | 'pending' | 'signed' | 'active' | 'expired' | 'terminated';
  document_url: string | null;
  terms: string | null;
  salary: number | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
}

export function useContracts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const contractsQuery = useQuery({
    queryKey: ['employee-contracts', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('employee_contracts')
        .select(`
          *,
          employee:profiles!employee_contracts_employee_id_fkey(id, full_name, email, department)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeContract[];
    },
    enabled: !!profile?.organization_id,
  });

  const createContract = useMutation({
    mutationFn: async (contract: Omit<EmployeeContract, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase
        .from('employee_contracts')
        .insert({ 
          ...contract, 
          organization_id: profile?.organization_id,
          created_by: profile?.id 
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts'] });
      toast.success('Contract created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeContract> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts'] });
      toast.success('Contract updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_contracts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts'] });
      toast.success('Contract deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    contracts: contractsQuery.data || [],
    isLoading: contractsQuery.isLoading,
    error: contractsQuery.error,
    createContract,
    updateContract,
    deleteContract,
  };
}
