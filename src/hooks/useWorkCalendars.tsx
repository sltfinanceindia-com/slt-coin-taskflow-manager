import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WorkCalendar {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  year: number;
  is_default: boolean | null;
  working_days: number[] | null;
  work_start_time: string | null;
  work_end_time: string | null;
  holidays: any | null;
  special_working_days: any | null;
  status: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useWorkCalendars() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: calendars = [], isLoading } = useQuery({
    queryKey: ['work-calendars', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('work_calendars')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('year', { ascending: false });
      if (error) throw error;
      return data as WorkCalendar[];
    },
    enabled: !!profile?.organization_id,
  });

  const createCalendar = useMutation({
    mutationFn: async (input: Partial<WorkCalendar>) => {
      const record = {
        name: input.name || '',
        year: input.year || new Date().getFullYear(),
        description: input.description,
        is_default: input.is_default,
        working_days: input.working_days,
        work_start_time: input.work_start_time,
        work_end_time: input.work_end_time,
        status: input.status || 'active',
        organization_id: profile?.organization_id,
        created_by: profile?.id,
      };
      const { data, error } = await supabase
        .from('work_calendars')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Work calendar created');
      queryClient.invalidateQueries({ queryKey: ['work-calendars'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateCalendar = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkCalendar> & { id: string }) => {
      const { error } = await supabase
        .from('work_calendars')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Work calendar updated');
      queryClient.invalidateQueries({ queryKey: ['work-calendars'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    calendars,
    isLoading,
    createCalendar: createCalendar.mutateAsync,
    updateCalendar: updateCalendar.mutateAsync,
  };
}
