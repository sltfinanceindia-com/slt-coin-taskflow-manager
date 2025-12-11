import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface EmployeeCapacity {
  id: string;
  profile_id: string;
  weekly_hours: number;
  hourly_rate: number | null;
  available_from: string | null;
  available_until: string | null;
  utilization_target: number;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
}

export interface EmployeeWorkload {
  profile_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  weekly_hours: number;
  assigned_hours: number;
  utilization: number;
  task_count: number;
  status: 'under' | 'optimal' | 'over';
}

export function useWorkload(startDate?: Date, endDate?: Date) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const start = startDate || new Date();
  const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const workloadQuery = useQuery({
    queryKey: ['workload', profile?.organization_id, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // Get all active profiles with their capacity
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, role, avatar_url,
          employee_capacity(weekly_hours, utilization_target)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Get task assignments for each profile
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, assigned_to, estimated_hours, status, planned_start_date, start_date')
        .eq('organization_id', profile.organization_id)
        .not('status', 'in', '("completed","verified","rejected")');

      if (tasksError) throw tasksError;

      // Calculate workload for each profile
      const workloads: EmployeeWorkload[] = profiles.map(p => {
        const capacity = (p.employee_capacity as any)?.[0];
        const weeklyHours = capacity?.weekly_hours || 40;
        const utilizationTarget = capacity?.utilization_target || 80;
        
        // Filter tasks for this profile within date range
        const profileTasks = tasks.filter(t => {
          if (t.assigned_to !== p.id) return false;
          const taskDate = t.planned_start_date || t.start_date;
          const taskDateObj = new Date(taskDate);
          return taskDateObj >= start && taskDateObj <= end;
        });

        const assignedHours = profileTasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
        const periodWeeks = (end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000);
        const periodCapacity = weeklyHours * Math.max(1, periodWeeks);
        const utilization = periodCapacity > 0 ? (assignedHours / periodCapacity) * 100 : 0;

        let status: 'under' | 'optimal' | 'over' = 'optimal';
        if (utilization < utilizationTarget - 20) status = 'under';
        else if (utilization > utilizationTarget + 20) status = 'over';

        return {
          profile_id: p.id,
          full_name: p.full_name || 'Unknown',
          email: p.email || '',
          role: p.role as string,
          avatar_url: p.avatar_url,
          weekly_hours: weeklyHours,
          assigned_hours: assignedHours,
          utilization: Math.round(utilization),
          task_count: profileTasks.length,
          status,
        };
      });

      return workloads.sort((a, b) => b.utilization - a.utilization);
    },
    enabled: !!profile?.organization_id,
  });

  const capacityQuery = useQuery({
    queryKey: ['employee-capacity', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('employee_capacity')
        .select(`
          *,
          profile:profiles(id, full_name, email, role, avatar_url)
        `)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return data as EmployeeCapacity[];
    },
    enabled: !!profile?.organization_id,
  });

  const updateCapacityMutation = useMutation({
    mutationFn: async ({ profileId, updates }: { profileId: string; updates: Partial<EmployeeCapacity> }) => {
      // Upsert capacity
      const { data, error } = await supabase
        .from('employee_capacity')
        .upsert({
          profile_id: profileId,
          organization_id: profile?.organization_id,
          ...updates,
        }, { onConflict: 'profile_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-capacity'] });
      queryClient.invalidateQueries({ queryKey: ['workload'] });
      toast({ title: 'Capacity Updated', description: 'Employee capacity has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const suggestAssignment = async (skillId?: string, minProficiency = 1) => {
    const { data, error } = await supabase.rpc('suggest_task_assignment', {
      p_required_skill_id: skillId || null,
      p_min_proficiency: minProficiency,
      p_start_date: start.toISOString().split('T')[0],
      p_end_date: end.toISOString().split('T')[0],
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    }
    return data;
  };

  return {
    workloads: workloadQuery.data || [],
    capacities: capacityQuery.data || [],
    isLoading: workloadQuery.isLoading || capacityQuery.isLoading,
    error: workloadQuery.error || capacityQuery.error,
    updateCapacity: (profileId: string, updates: Partial<EmployeeCapacity>) =>
      updateCapacityMutation.mutate({ profileId, updates }),
    suggestAssignment,
    isUpdating: updateCapacityMutation.isPending,
  };
}
