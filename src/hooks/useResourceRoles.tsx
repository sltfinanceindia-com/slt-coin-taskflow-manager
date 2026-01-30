/**
 * Resource Roles Hook
 * Manages resource roles and project role allocations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type AllocationType = 'soft' | 'hard';

export interface ResourceRole {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  hourly_rate?: number;
  skill_requirements?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectRoleAllocation {
  id: string;
  project_id: string;
  role_id: string;
  allocated_hours: number;
  allocation_type: AllocationType;
  week_start: string;
  assigned_user_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  role?: ResourceRole;
  assigned_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateRoleData {
  name: string;
  description?: string;
  hourly_rate?: number;
  skill_requirements?: string[];
}

export interface CreateAllocationData {
  project_id: string;
  role_id: string;
  allocated_hours: number;
  allocation_type?: AllocationType;
  week_start: string;
  assigned_user_id?: string;
  notes?: string;
}

export function useResourceRoles() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['resource-roles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('resource_roles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ResourceRole[];
    },
    enabled: !!profile?.organization_id,
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleData) => {
      const { data: result, error } = await supabase
        .from('resource_roles')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-roles'] });
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create role: ' + error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateRoleData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('resource_roles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + error.message);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('resource_roles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete role: ' + error.message);
    },
  });

  return {
    roles: rolesQuery.data || [],
    isLoading: rolesQuery.isLoading,
    error: rolesQuery.error,
    createRole: createRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deleteRole: deleteRoleMutation.mutate,
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
}

export function useProjectRoleAllocations(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const allocationsQuery = useQuery({
    queryKey: ['project-role-allocations', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_role_allocations')
        .select(`
          *,
          role:resource_roles(*),
          assigned_user:profiles!project_role_allocations_assigned_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('week_start', { ascending: true });

      if (error) throw error;
      return data as ProjectRoleAllocation[];
    },
    enabled: !!projectId,
  });

  const createAllocationMutation = useMutation({
    mutationFn: async (data: CreateAllocationData) => {
      const { data: result, error } = await supabase
        .from('project_role_allocations')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-role-allocations', projectId] });
      toast.success('Allocation created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create allocation: ' + error.message);
    },
  });

  const updateAllocationMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateAllocationData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('project_role_allocations')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-role-allocations', projectId] });
      toast.success('Allocation updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update allocation: ' + error.message);
    },
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_role_allocations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-role-allocations', projectId] });
      toast.success('Allocation deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete allocation: ' + error.message);
    },
  });

  // Calculate allocation summary by role
  const allocationsByRole = (allocationsQuery.data || []).reduce((acc, allocation) => {
    const roleId = allocation.role_id;
    if (!acc[roleId]) {
      acc[roleId] = {
        role: allocation.role,
        totalHours: 0,
        softHours: 0,
        hardHours: 0,
        allocations: [],
      };
    }
    acc[roleId].totalHours += Number(allocation.allocated_hours);
    if (allocation.allocation_type === 'soft') {
      acc[roleId].softHours += Number(allocation.allocated_hours);
    } else {
      acc[roleId].hardHours += Number(allocation.allocated_hours);
    }
    acc[roleId].allocations.push(allocation);
    return acc;
  }, {} as Record<string, { role?: ResourceRole; totalHours: number; softHours: number; hardHours: number; allocations: ProjectRoleAllocation[] }>);

  return {
    allocations: allocationsQuery.data || [],
    allocationsByRole,
    isLoading: allocationsQuery.isLoading,
    error: allocationsQuery.error,
    createAllocation: createAllocationMutation.mutate,
    updateAllocation: updateAllocationMutation.mutate,
    deleteAllocation: deleteAllocationMutation.mutate,
    isCreating: createAllocationMutation.isPending,
    isUpdating: updateAllocationMutation.isPending,
    isDeleting: deleteAllocationMutation.isPending,
  };
}
