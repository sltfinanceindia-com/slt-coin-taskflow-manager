/**
 * Hook for fetching and checking module-level permissions from role_permissions table
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { useOrganization } from './useOrganization';

export interface RolePermission {
  id: string;
  role_id: string;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  visibility_scope: 'own' | 'team' | 'department' | 'all';
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export function useRolePermissions() {
  const { role, organizationId, isAdmin, isSuperAdmin } = useUserRole();
  const { organization } = useOrganization();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['role-permissions', role, organizationId],
    queryFn: async () => {
      if (!organizationId || !role) return [];

      // Get custom role for this user's role type
      const { data: customRole, error: roleError } = await supabase
        .from('custom_roles')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('role_type', role)
        .single();

      if (roleError || !customRole) return [];

      // Get permissions for this role
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', customRole.id);

      if (error) {
        console.error('Error fetching role permissions:', error);
        return [];
      }

      return data as RolePermission[];
    },
    enabled: !!organizationId && !!role,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Check if user has permission for a specific action on a module
   */
  const hasPermission = (module: string, action: PermissionAction): boolean => {
    // Super admins and admins have all permissions
    if (isSuperAdmin || isAdmin) return true;

    const perm = permissions?.find(p => p.module_name === module);
    if (!perm) return false;

    const actionKey = `can_${action}` as keyof RolePermission;
    return perm[actionKey] === true;
  };

  /**
   * Get visibility scope for a module
   */
  const getVisibilityScope = (module: string): 'own' | 'team' | 'department' | 'all' => {
    // Super admins and admins see all
    if (isSuperAdmin || isAdmin) return 'all';

    const perm = permissions?.find(p => p.module_name === module);
    return perm?.visibility_scope || 'own';
  };

  /**
   * Check multiple permissions at once
   */
  const hasAnyPermission = (module: string, actions: PermissionAction[]): boolean => {
    return actions.some(action => hasPermission(module, action));
  };

  /**
   * Check if user can access a module at all (has view permission)
   */
  const canAccessModule = (module: string): boolean => {
    return hasPermission(module, 'view');
  };

  /**
   * Get all modules user has access to
   */
  const getAccessibleModules = (): string[] => {
    if (isSuperAdmin || isAdmin) return [];
    
    return permissions?.filter(p => p.can_view).map(p => p.module_name) || [];
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    getVisibilityScope,
    hasAnyPermission,
    canAccessModule,
    getAccessibleModules,
  };
}
