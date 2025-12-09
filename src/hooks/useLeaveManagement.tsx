import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  days_per_year: number;
  is_paid: boolean;
  color: string;
  is_active: boolean;
  allow_carry_forward: boolean;
  max_carry_forward_days: number;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  carried_forward: number;
  leave_type?: LeaveType;
  employee?: { full_name: string; email: string };
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  is_half_day: boolean;
  half_day_type: 'first_half' | 'second_half' | null;
  created_at: string;
  leave_type?: LeaveType;
  employee?: { full_name: string; email: string; avatar_url: string | null };
  reviewer?: { full_name: string };
}

export const useLeaveManagement = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch leave types
  const { data: leaveTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as LeaveType[];
    },
  });

  // Fetch user's leave balances
  const { data: myBalances = [], isLoading: loadingBalances } = useQuery({
    queryKey: ['my-leave-balances', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('leave_balances')
        .select(`*, leave_type:leave_types(*)`)
        .eq('employee_id', profile.id)
        .eq('year', currentYear);
      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!profile?.id,
  });

  // Fetch all leave balances (admin)
  const { data: allBalances = [], isLoading: loadingAllBalances } = useQuery({
    queryKey: ['all-leave-balances'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('leave_balances')
        .select(`*, leave_type:leave_types(*), employee:profiles(full_name, email)`)
        .eq('year', currentYear);
      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: profile?.role === 'admin',
  });

  // Fetch user's leave requests
  const { data: myRequests = [], isLoading: loadingMyRequests } = useQuery({
    queryKey: ['my-leave-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`*, leave_type:leave_types(*), reviewer:profiles!leave_requests_reviewed_by_fkey(full_name)`)
        .eq('employee_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LeaveRequest[];
    },
    enabled: !!profile?.id,
  });

  // Fetch all leave requests (admin)
  const { data: allRequests = [], isLoading: loadingAllRequests } = useQuery({
    queryKey: ['all-leave-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`*, leave_type:leave_types(*), employee:profiles!leave_requests_employee_id_fkey(full_name, email, avatar_url), reviewer:profiles!leave_requests_reviewed_by_fkey(full_name)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LeaveRequest[];
    },
    enabled: profile?.role === 'admin',
  });

  // Create leave request
  const createRequest = useMutation({
    mutationFn: async (data: {
      leave_type_id: string;
      start_date: string;
      end_date: string;
      total_days: number;
      reason?: string;
      is_half_day?: boolean;
      half_day_type?: 'first_half' | 'second_half';
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('leave_requests').insert({
        employee_id: profile.id,
        organization_id: profile.organization_id,
        ...data,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-requests'] });
      toast.success('Leave request submitted');
    },
    onError: (error) => toast.error(error.message),
  });

  // Review leave request (admin)
  const reviewRequest = useMutation({
    mutationFn: async (data: {
      id: string;
      status: 'approved' | 'rejected';
      review_notes?: string;
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: data.status,
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          review_notes: data.review_notes,
        })
        .eq('id', data.id);
      if (error) throw error;

      // If approved, update leave balance
      if (data.status === 'approved') {
        const request = allRequests.find(r => r.id === data.id);
        if (request) {
          const currentYear = new Date().getFullYear();
          const { data: balance } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', request.employee_id)
            .eq('leave_type_id', request.leave_type_id)
            .eq('year', currentYear)
            .single();

          if (balance) {
            await supabase
              .from('leave_balances')
              .update({
                used_days: Number(balance.used_days) + Number(request.total_days),
                pending_days: Math.max(0, Number(balance.pending_days) - Number(request.total_days)),
              })
              .eq('id', balance.id);
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-balances'] });
      toast.success(`Leave request ${variables.status}`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Cancel leave request
  const cancelRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-requests'] });
      toast.success('Leave request cancelled');
    },
    onError: (error) => toast.error(error.message),
  });

  // Initialize leave balances for an employee
  const initializeBalances = useMutation({
    mutationFn: async (employeeId: string) => {
      const currentYear = new Date().getFullYear();
      const balances = leaveTypes.map(type => ({
        employee_id: employeeId,
        leave_type_id: type.id,
        year: currentYear,
        total_days: type.days_per_year,
        used_days: 0,
        pending_days: 0,
        carried_forward: 0,
      }));

      const { error } = await supabase
        .from('leave_balances')
        .upsert(balances, { onConflict: 'employee_id,leave_type_id,year' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leave-balances'] });
      toast.success('Leave balances initialized');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    leaveTypes,
    myBalances,
    allBalances,
    myRequests,
    allRequests,
    isLoading: loadingTypes || loadingBalances || loadingMyRequests,
    isAdminLoading: loadingAllBalances || loadingAllRequests,
    createRequest,
    reviewRequest,
    cancelRequest,
    initializeBalances,
  };
};
