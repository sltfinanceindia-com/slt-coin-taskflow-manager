import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ResourceChange {
  profile_id: string;
  profile_name?: string;
  hours_change: number;
  effective_from: string;
  effective_until: string;
}

export interface DeadlineShift {
  project_id: string;
  project_name?: string;
  days_shift: number;
}

export interface NewProject {
  name: string;
  hours: number;
  start_date: string;
}

export interface ScenarioData {
  resource_changes: ResourceChange[];
  deadline_shifts: DeadlineShift[];
  new_projects: NewProject[];
}

export interface ScenarioResults {
  weekly_utilization: Array<{
    week_start: string;
    utilization_pct: number;
    overloaded_count: number;
  }>;
  gaps: Array<{
    week_start: string;
    hours_gap: number;
  }>;
  bottlenecks: Array<{
    profile_id: string;
    profile_name: string;
    peak_week: string;
    utilization: number;
  }>;
}

export interface WorkloadScenario {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  base_date: string;
  scenario_data: ScenarioData;
  results: ScenarioResults;
  is_baseline: boolean;
  status: 'draft' | 'calculated' | 'archived';
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    full_name: string;
  };
}

export interface WeeklyForecast {
  week_start: string;
  week_number: number;
  planned_hours: number;
  capacity_hours: number;
  utilization_pct: number;
  gap_hours: number;
  assigned_resources: number;
}

export function useWorkloadScenarios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ['workload-scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workload_scenarios')
        .select(`
          *,
          creator:profiles!workload_scenarios_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(s => ({
        ...s,
        scenario_data: (s.scenario_data || { resource_changes: [], deadline_shifts: [], new_projects: [] }) as unknown as ScenarioData,
        results: (s.results || { weekly_utilization: [], gaps: [], bottlenecks: [] }) as unknown as ScenarioResults
      })) as WorkloadScenario[];
    }
  });

  const { data: workloadForecast, isLoading: forecastLoading, refetch: refetchForecast } = useQuery({
    queryKey: ['workload-forecast'],
    queryFn: async () => {
      // Get current user's org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return [];

      // Calculate weekly forecast for next 12 weeks
      const weeks: WeeklyForecast[] = [];
      const today = new Date();
      
      for (let i = 0; i < 12; i++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + (i * 7) - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Get tasks due this week
        const { data: tasks } = await supabase
          .from('tasks')
          .select('estimated_hours, assigned_to')
          .eq('organization_id', profile.organization_id)
          .not('status', 'in', '("completed","cancelled")')
          .gte('due_date', weekStart.toISOString().split('T')[0])
          .lte('due_date', weekEnd.toISOString().split('T')[0]);

        // Get total capacity
        const { data: capacity } = await supabase
          .from('employee_capacity')
          .select('weekly_hours')
          .eq('organization_id', profile.organization_id);

        const plannedHours = tasks?.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0) || 0;
        const capacityHours = capacity?.reduce((sum, c) => sum + (Number(c.weekly_hours) || 40), 0) || 0;
        const uniqueResources = new Set(tasks?.map(t => t.assigned_to).filter(Boolean)).size;

        weeks.push({
          week_start: weekStart.toISOString().split('T')[0],
          week_number: i + 1,
          planned_hours: plannedHours,
          capacity_hours: capacityHours,
          utilization_pct: capacityHours > 0 ? Math.round((plannedHours / capacityHours) * 100) : 0,
          gap_hours: capacityHours - plannedHours,
          assigned_resources: uniqueResources
        });
      }

      return weeks;
    }
  });

  const createScenarioMutation = useMutation({
    mutationFn: async (scenario: Partial<WorkloadScenario>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('workload_scenarios')
        .insert([{
          name: scenario.name!,
          description: scenario.description,
          created_by: profile.id,
          base_date: scenario.base_date || new Date().toISOString().split('T')[0],
          scenario_data: (scenario.scenario_data || { resource_changes: [], deadline_shifts: [], new_projects: [] }) as unknown as Record<string, unknown>,
          organization_id: profile.organization_id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload-scenarios'] });
      toast({ title: 'Scenario created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create scenario', description: error.message, variant: 'destructive' });
    }
  });

  const updateScenarioMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkloadScenario> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.scenario_data) updateData.scenario_data = updates.scenario_data;
      if (updates.status) updateData.status = updates.status;
      
      const { data, error } = await supabase
        .from('workload_scenarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload-scenarios'] });
      toast({ title: 'Scenario updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update scenario', description: error.message, variant: 'destructive' });
    }
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workload_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload-scenarios'] });
      toast({ title: 'Scenario deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete scenario', description: error.message, variant: 'destructive' });
    }
  });

  const calculateScenarioMutation = useMutation({
    mutationFn: async (scenario: WorkloadScenario) => {
      // Apply scenario adjustments to forecast
      const baseForcast = workloadForecast || [];
      const adjustedForecast = baseForcast.map(week => {
        let adjustedHours = week.planned_hours;
        let adjustedCapacity = week.capacity_hours;

        // Apply resource changes
        scenario.scenario_data.resource_changes?.forEach(change => {
          const effectiveFrom = new Date(change.effective_from);
          const effectiveUntil = new Date(change.effective_until);
          const weekDate = new Date(week.week_start);

          if (weekDate >= effectiveFrom && weekDate <= effectiveUntil) {
            adjustedCapacity += change.hours_change;
          }
        });

        // Apply deadline shifts (simplified)
        scenario.scenario_data.deadline_shifts?.forEach(shift => {
          if (shift.days_shift > 0) {
            adjustedHours *= 0.9; // Reduce load if deadline extended
          } else {
            adjustedHours *= 1.1; // Increase load if deadline shortened
          }
        });

        // Add new projects
        scenario.scenario_data.new_projects?.forEach(proj => {
          const startDate = new Date(proj.start_date);
          const weekDate = new Date(week.week_start);
          if (weekDate >= startDate) {
            adjustedHours += proj.hours / 12; // Spread across remaining weeks
          }
        });

        return {
          week_start: week.week_start,
          utilization_pct: adjustedCapacity > 0 ? Math.round((adjustedHours / adjustedCapacity) * 100) : 0,
          overloaded_count: adjustedHours > adjustedCapacity ? 1 : 0
        };
      });

      const results = {
        weekly_utilization: adjustedForecast,
        gaps: baseForcast.map(w => ({
          week_start: w.week_start,
          hours_gap: w.gap_hours
        })),
        bottlenecks: []
      };

      const { data, error } = await supabase
        .from('workload_scenarios')
        .update({
          results: results as unknown as Record<string, unknown>,
          status: 'calculated'
        })
        .eq('id', scenario.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload-scenarios'] });
      toast({ title: 'Scenario calculated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to calculate scenario', description: error.message, variant: 'destructive' });
    }
  });

  return {
    scenarios,
    scenariosLoading,
    workloadForecast: workloadForecast || [],
    forecastLoading,
    refetchForecast,
    createScenario: createScenarioMutation.mutate,
    updateScenario: updateScenarioMutation.mutate,
    deleteScenario: deleteScenarioMutation.mutate,
    calculateScenario: calculateScenarioMutation.mutate,
    isCreating: createScenarioMutation.isPending,
    isUpdating: updateScenarioMutation.isPending,
    isDeleting: deleteScenarioMutation.isPending,
    isCalculating: calculateScenarioMutation.isPending
  };
}
