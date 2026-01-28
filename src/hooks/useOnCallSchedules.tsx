import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface OnCallSchedule {
  id: string;
  organization_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  rotation_type: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  status: 'upcoming' | 'active' | 'completed';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user?: { full_name: string; avatar_url: string | null } | null;
}

export type CreateOnCallScheduleData = Omit<OnCallSchedule, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'user' | 'status'>;

export function useOnCallSchedules() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const schedulesQuery = useQuery({
    queryKey: ['on-call-schedules', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('on_call_schedules')
        .select('*, user:profiles!user_id(full_name, avatar_url)')
        .eq('organization_id', profile.organization_id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as OnCallSchedule[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (schedule: CreateOnCallScheduleData) => {
      const { data, error } = await supabase
        .from('on_call_schedules')
        .insert({
          ...schedule,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
          status: 'upcoming',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['on-call-schedules'] });
      toast({
        title: 'Schedule Created',
        description: 'On-call schedule has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OnCallSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('on_call_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['on-call-schedules'] });
      toast({
        title: 'Schedule Updated',
        description: 'On-call schedule has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('on_call_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['on-call-schedules'] });
      toast({
        title: 'Schedule Deleted',
        description: 'On-call schedule has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    schedules: schedulesQuery.data || [],
    isLoading: schedulesQuery.isLoading,
    error: schedulesQuery.error,
    createSchedule: createMutation.mutateAsync,
    updateSchedule: updateMutation.mutateAsync,
    deleteSchedule: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
