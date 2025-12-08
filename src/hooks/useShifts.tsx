import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';

export interface ShiftType {
  id: string;
  organization_id: string;
  name: string;
  start_time: string;
  end_time: string;
  color: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftSchedule {
  id: string;
  organization_id: string;
  shift_type_id: string;
  employee_id: string;
  schedule_date: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  shift_type?: ShiftType;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface ShiftSwapRequest {
  id: string;
  organization_id: string;
  requester_schedule_id: string;
  target_schedule_id: string;
  requester_id: string;
  target_employee_id: string;
  status: string;
  requester_reason: string | null;
  target_response: string | null;
  manager_approved_by: string | null;
  manager_response: string | null;
  created_at: string;
  updated_at: string;
  requester?: { id: string; full_name: string };
  target_employee?: { id: string; full_name: string };
  requester_schedule?: ShiftSchedule;
  target_schedule?: ShiftSchedule;
}

export function useShiftTypes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['shift-types', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('start_time');

      if (error) throw error;
      return data as ShiftType[];
    },
    enabled: !!profile?.organization_id,
  });

  const createShiftType = useMutation({
    mutationFn: async (shiftType: Partial<ShiftType>) => {
      const { data, error } = await supabase
        .from('shift_types')
        .insert({
          name: shiftType.name!,
          start_time: shiftType.start_time!,
          end_time: shiftType.end_time!,
          color: shiftType.color,
          description: shiftType.description,
          is_active: shiftType.is_active,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-types'] });
      toast({ title: 'Shift type created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating shift type', description: error.message, variant: 'destructive' });
    },
  });

  const updateShiftType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShiftType> & { id: string }) => {
      const { data, error } = await supabase
        .from('shift_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-types'] });
      toast({ title: 'Shift type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating shift type', description: error.message, variant: 'destructive' });
    },
  });

  const deleteShiftType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-types'] });
      toast({ title: 'Shift type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting shift type', description: error.message, variant: 'destructive' });
    },
  });

  return {
    shiftTypes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createShiftType,
    updateShiftType,
    deleteShiftType,
  };
}

export function useShiftSchedules(weekStart?: Date) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const startDate = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
  const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

  const query = useQuery({
    queryKey: ['shift-schedules', profile?.organization_id, format(startDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_schedules')
        .select(`
          *,
          shift_type:shift_types(*),
          employee:profiles!shift_schedules_employee_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('organization_id', profile?.organization_id)
        .gte('schedule_date', format(startDate, 'yyyy-MM-dd'))
        .lte('schedule_date', format(endDate, 'yyyy-MM-dd'))
        .order('schedule_date');

      if (error) throw error;
      return data as ShiftSchedule[];
    },
    enabled: !!profile?.organization_id,
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: Partial<ShiftSchedule>) => {
      const { data, error } = await supabase
        .from('shift_schedules')
        .insert({
          schedule_date: schedule.schedule_date!,
          employee_id: schedule.employee_id,
          shift_type_id: schedule.shift_type_id,
          notes: schedule.notes,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select(`
          *,
          shift_type:shift_types(*),
          employee:profiles!shift_schedules_employee_id_fkey(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-schedules'] });
      toast({ title: 'Shift scheduled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error scheduling shift', description: error.message, variant: 'destructive' });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShiftSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('shift_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-schedules'] });
      toast({ title: 'Schedule updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating schedule', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-schedules'] });
      toast({ title: 'Schedule deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting schedule', description: error.message, variant: 'destructive' });
    },
  });

  return {
    schedules: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    weekStart: startDate,
    weekEnd: endDate,
  };
}

export function useShiftSwapRequests() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['shift-swap-requests', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swap_requests')
        .select(`
          *,
          requester:profiles!shift_swap_requests_requester_id_fkey(id, full_name),
          target_employee:profiles!shift_swap_requests_target_employee_id_fkey(id, full_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShiftSwapRequest[];
    },
    enabled: !!profile?.organization_id,
  });

  const createSwapRequest = useMutation({
    mutationFn: async (request: Partial<ShiftSwapRequest>) => {
      const { data, error } = await supabase
        .from('shift_swap_requests')
        .insert({
          ...request,
          organization_id: profile?.organization_id,
          requester_id: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swap-requests'] });
      toast({ title: 'Swap request created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating swap request', description: error.message, variant: 'destructive' });
    },
  });

  const respondToSwap = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status: string; response?: string }) => {
      const { data, error } = await supabase
        .from('shift_swap_requests')
        .update({
          status,
          target_response: response,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swap-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shift-schedules'] });
      toast({ title: 'Swap request updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error responding to swap', description: error.message, variant: 'destructive' });
    },
  });

  return {
    swapRequests: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createSwapRequest,
    respondToSwap,
  };
}
