import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PayrollRun {
  id: string;
  organization_id: string | null;
  run_name: string;
  period_start: string;
  period_end: string;
  status: string;
  total_employees: number | null;
  total_amount: number | null;
  processed_by: string | null;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  organization_id: string | null;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  allowances: any;
  deductions: any;
  bonus: number | null;
  overtime_hours: number | null;
  overtime_rate: number | null;
  gross_salary: number;
  tax_deduction: number | null;
  pf_deduction: number | null;
  other_deductions: number | null;
  net_salary: number;
  payment_status: string;
  payment_date: string | null;
  payment_method: string | null;
  transaction_reference: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function usePayroll() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch payroll runs
  const payrollRunsQuery = useQuery({
    queryKey: ['payroll-runs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('period_start', { ascending: false });

      if (error) throw error;
      return (data || []) as PayrollRun[];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch payroll records for a specific run or period
  const payrollRecordsQuery = useQuery({
    queryKey: ['payroll-records', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('payroll_records')
        .select(`
          *,
          employee:profiles!payroll_records_employee_id_fkey(id, full_name, email)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PayrollRecord[];
    },
    enabled: !!profile?.organization_id,
  });

  // Create payroll run
  const createPayrollRun = useMutation({
    mutationFn: async (data: {
      run_name: string;
      period_start: string;
      period_end: string;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('payroll_runs')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll run created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  // Update payroll run status
  const updatePayrollRunStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, any> = { status };
      if (status === 'completed') {
        updates.processed_by = profile?.id;
        updates.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payroll_runs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll run updated');
    },
    onError: (error) => toast.error(error.message),
  });

  // Delete payroll run
  const deletePayrollRun = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payroll_runs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll run deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  // Create payroll record
  const createPayrollRecord = useMutation({
    mutationFn: async (data: {
      employee_id: string;
      pay_period_start: string;
      pay_period_end: string;
      basic_salary: number;
      allowances?: any;
      deductions?: any;
      bonus?: number;
      overtime_hours?: number;
      overtime_rate?: number;
      gross_salary: number;
      tax_deduction?: number;
      pf_deduction?: number;
      other_deductions?: number;
      net_salary: number;
    }) => {
      const { data: result, error } = await supabase
        .from('payroll_records')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      toast.success('Payroll record created');
    },
    onError: (error) => toast.error(error.message),
  });

  // Update payment status
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, status, method, reference }: { 
      id: string; 
      status: string;
      method?: string;
      reference?: string;
    }) => {
      const updates: Record<string, any> = { payment_status: status };
      if (status === 'paid') {
        updates.payment_date = new Date().toISOString();
        if (method) updates.payment_method = method;
        if (reference) updates.transaction_reference = reference;
      }

      const { error } = await supabase
        .from('payroll_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      toast.success('Payment status updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    payrollRuns: payrollRunsQuery.data || [],
    payrollRecords: payrollRecordsQuery.data || [],
    isLoading: payrollRunsQuery.isLoading || payrollRecordsQuery.isLoading,
    error: payrollRunsQuery.error || payrollRecordsQuery.error,
    createPayrollRun,
    updatePayrollRunStatus,
    deletePayrollRun,
    createPayrollRecord,
    updatePaymentStatus,
    isCreating: createPayrollRun.isPending,
  };
}
