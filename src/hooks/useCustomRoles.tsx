import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { ModulePermission, VisibilityScope } from './usePermissions';
import { AppRole } from './useUserRole';

export interface CustomRole {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  role_type: string;
  is_system_role: boolean;
  hierarchy_level: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleWithPermissions extends CustomRole {
  permissions: ModulePermission[];
}

interface CreateRoleInput {
  name: string;
  description?: string;
  role_type: string;
  hierarchy_level: number;
  permissions: Partial<ModulePermission>[];
}

interface UpdateRoleInput {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

interface UpdatePermissionInput {
  roleId: string;
  module: string;
  permission: Partial<ModulePermission>;
}

export function useCustomRoles() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all roles for the organization
  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ['custom-roles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('hierarchy_level', { ascending: false });

      if (error) throw error;
      return data as CustomRole[];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch a single role with its permissions
  const useRoleWithPermissions = (roleId: string | null) => {
    return useQuery({
      queryKey: ['role-permissions', roleId],
      queryFn: async () => {
        if (!roleId) return null;

        const { data: role } = await supabase
          .from('custom_roles')
          .select('*')
          .eq('id', roleId)
          .single();

        if (!role) return null;

        const { data: permissions } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role_id', roleId);

        return {
          ...role,
          permissions: (permissions || []).map(p => ({
            module_name: p.module_name,
            can_view: p.can_view || false,
            can_create: p.can_create || false,
            can_edit: p.can_edit || false,
            can_delete: p.can_delete || false,
            can_approve: p.can_approve || false,
            can_export: p.can_export || false,
            visibility_scope: (p.visibility_scope as VisibilityScope) || 'own'
          }))
        } as RoleWithPermissions;
      },
      enabled: !!roleId
    });
  };

  // Create a new role with permissions
  const createRoleMutation = useMutation({
    mutationFn: async (input: CreateRoleInput) => {
      if (!profile?.organization_id) throw new Error('No organization');

      // Create the role
      const { data: role, error: roleError } = await supabase
        .from('custom_roles')
        .insert({
          organization_id: profile.organization_id,
          name: input.name,
          description: input.description,
          role_type: input.role_type as any,
          hierarchy_level: input.hierarchy_level,
          is_system_role: false,
          created_by: profile.id
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Create permissions for each module
      if (input.permissions.length > 0) {
        const permissionRecords = input.permissions.map(p => ({
          role_id: role.id,
          organization_id: profile.organization_id,
          module_name: p.module_name,
          can_view: p.can_view ?? false,
          can_create: p.can_create ?? false,
          can_edit: p.can_edit ?? false,
          can_delete: p.can_delete ?? false,
          can_approve: p.can_approve ?? false,
          can_export: p.can_export ?? false,
          visibility_scope: p.visibility_scope ?? 'own'
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionRecords);

        if (permError) throw permError;
      }

      return role;
    },
    onSuccess: () => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
    },
    onError: (error) => {
      toast.error('Failed to create role');
      console.error('Create role error:', error);
    }
  });

  // Update a role
  const updateRoleMutation = useMutation({
    mutationFn: async (input: UpdateRoleInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('custom_roles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
    },
    onError: (error) => {
      toast.error('Failed to update role');
      console.error('Update role error:', error);
    }
  });

  // Delete a role (only non-system roles)
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      // First check if it's a system role
      const { data: role } = await supabase
        .from('custom_roles')
        .select('is_system_role')
        .eq('id', roleId)
        .single();

      if (role?.is_system_role) {
        throw new Error('Cannot delete system roles');
      }

      // Delete the role (permissions will cascade)
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete role');
      console.error('Delete role error:', error);
    }
  });

  // Update a specific permission
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ roleId, module, permission }: UpdatePermissionInput) => {
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: roleId,
          organization_id: profile?.organization_id,
          module_name: module,
          ...permission
        }, { onConflict: 'role_id,module_name' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
    },
    onError: (error) => {
      toast.error('Failed to update permission');
      console.error('Update permission error:', error);
    }
  });

  // Assign a role to a user via user_roles table
  const assignRoleToUserMutation = useMutation({
    mutationFn: async ({ userId, role, roleId }: { userId: string; role: AppRole; roleId?: string }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      
      // First, remove any existing role for this user in this organization
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', profile.organization_id);
      
      // Insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          organization_id: profile.organization_id
        });

      if (error) throw error;
      
      // Also update the profile's role and custom_role_id if provided
      const profileUpdate: Record<string, any> = { role };
      if (roleId) {
        profileUpdate.custom_role_id = roleId;
      }
      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);
    },
    onSuccess: () => {
      toast.success('Role assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      queryClient.invalidateQueries({ queryKey: ['team-members-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-change-history'] });
    },
    onError: (error) => {
      toast.error('Failed to assign role');
      console.error('Assign role error:', error);
    }
  });

  // Initialize default roles for an organization
  const initializeDefaultRoles = async () => {
    if (!profile?.organization_id) return;

    try {
      await supabase.rpc('initialize_default_roles', {
        p_org_id: profile.organization_id,
        p_created_by: profile.id
      });
      toast.success('Default roles initialized');
      refetch();
    } catch (error) {
      console.error('Initialize default roles error:', error);
      toast.error('Failed to initialize default roles');
    }
  };

  return {
    roles,
    isLoading,
    refetch,
    useRoleWithPermissions,
    createRole: createRoleMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteRole: deleteRoleMutation.mutateAsync,
    updatePermission: updatePermissionMutation.mutateAsync,
    assignRoleToUser: assignRoleToUserMutation.mutateAsync,
    initializeDefaultRoles,
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending
  };
}
