import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export type ModuleName = 
  | 'tasks' 
  | 'attendance' 
  | 'leave' 
  | 'time_logs' 
  | 'projects' 
  | 'employees' 
  | 'reports' 
  | 'coins' 
  | 'settings' 
  | 'communication' 
  | 'training'
  | 'approvals'
  | 'automation'
  | 'audit'
  | 'lifecycle'
  | 'wfh'
  | 'shifts';

export type VisibilityScope = 'own' | 'team' | 'department' | 'all';

export interface ModulePermission {
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  visibility_scope: VisibilityScope;
}

interface PermissionsData {
  permissions: ModulePermission[];
  isLoading: boolean;
  canView: (module: ModuleName) => boolean;
  canCreate: (module: ModuleName) => boolean;
  canEdit: (module: ModuleName) => boolean;
  canDelete: (module: ModuleName) => boolean;
  canApprove: (module: ModuleName) => boolean;
  canExport: (module: ModuleName) => boolean;
  getVisibilityScope: (module: ModuleName) => VisibilityScope;
  hasAnyPermission: (module: ModuleName) => boolean;
  refreshPermissions: () => Promise<void>;
}

export function usePermissions(): PermissionsData {
  const { profile } = useAuth();
  const { isSuperAdmin, isOrgAdmin, isAdmin, isManager, isTeamLead, role } = useUserRole();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // If super admin, org admin, or admin - grant full permissions
      // Note: org_admin and admin have the SAME privileges
      if (isSuperAdmin || isOrgAdmin || isAdmin) {
        const fullPermissions: ModulePermission[] = [
          'tasks', 'attendance', 'leave', 'time_logs', 'projects', 
          'employees', 'reports', 'coins', 'settings', 'communication', 
          'training', 'approvals', 'automation', 'audit', 'lifecycle', 'wfh', 'shifts'
        ].map(module => ({
          module_name: module,
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          can_approve: true,
          can_export: true,
          visibility_scope: 'all' as VisibilityScope
        }));
        setPermissions(fullPermissions);
        setIsLoading(false);
        return;
      }

      // Fetch from role_permissions via custom_role
      const { data: roleData } = await supabase
        .from('profiles')
        .select('custom_role_id')
        .eq('id', profile.id)
        .single();

      if (roleData?.custom_role_id) {
        const { data: perms } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role_id', roleData.custom_role_id);

        if (perms) {
          setPermissions(perms.map(p => ({
            module_name: p.module_name,
            can_view: p.can_view || false,
            can_create: p.can_create || false,
            can_edit: p.can_edit || false,
            can_delete: p.can_delete || false,
            can_approve: p.can_approve || false,
            can_export: p.can_export || false,
            visibility_scope: (p.visibility_scope as VisibilityScope) || 'own'
          })));
        }
      } else {
        // Default permissions based on role type
        const defaultPerms = getDefaultPermissions(role);
        setPermissions(defaultPerms);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Fallback to role-based defaults
      const defaultPerms = getDefaultPermissions(role);
      setPermissions(defaultPerms);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isSuperAdmin, isOrgAdmin, isAdmin, role]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const getPermission = useCallback((module: ModuleName): ModulePermission | undefined => {
    return permissions.find(p => p.module_name === module);
  }, [permissions]);

  const canView = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    return getPermission(module)?.can_view ?? false;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const canCreate = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    return getPermission(module)?.can_create ?? false;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const canEdit = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    return getPermission(module)?.can_edit ?? false;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const canDelete = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    return getPermission(module)?.can_delete ?? false;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const canApprove = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    return getPermission(module)?.can_approve ?? false;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const canExport = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    return getPermission(module)?.can_export ?? false;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const getVisibilityScope = useCallback((module: ModuleName): VisibilityScope => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return 'all';
    return getPermission(module)?.visibility_scope ?? 'own';
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  const hasAnyPermission = useCallback((module: ModuleName): boolean => {
    if (isSuperAdmin || isOrgAdmin || isAdmin) return true;
    const perm = getPermission(module);
    if (!perm) return false;
    return perm.can_view || perm.can_create || perm.can_edit || perm.can_delete || perm.can_approve;
  }, [getPermission, isSuperAdmin, isOrgAdmin, isAdmin]);

  return {
    permissions,
    isLoading,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canExport,
    getVisibilityScope,
    hasAnyPermission,
    refreshPermissions: fetchPermissions
  };
}

// Default permissions based on role type
function getDefaultPermissions(role: string): ModulePermission[] {
  const modules: ModuleName[] = [
    'tasks', 'attendance', 'leave', 'time_logs', 'projects', 
    'employees', 'reports', 'coins', 'settings', 'communication', 
    'training', 'approvals', 'automation', 'audit', 'lifecycle', 'wfh', 'shifts'
  ];

  switch (role) {
    case 'super_admin':
    case 'org_admin':
    case 'admin':
      return modules.map(module => ({
        module_name: module,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_approve: true,
        can_export: true,
        visibility_scope: 'all' as VisibilityScope
      }));

    case 'manager':
      return modules.map(module => ({
        module_name: module,
        can_view: true,
        can_create: module !== 'settings',
        can_edit: module !== 'settings',
        can_delete: ['tasks', 'projects'].includes(module),
        can_approve: ['tasks', 'leave', 'time_logs', 'attendance'].includes(module),
        can_export: true,
        visibility_scope: 'department' as VisibilityScope
      }));

    case 'team_lead':
      return modules.map(module => ({
        module_name: module,
        can_view: true,
        can_create: ['tasks', 'communication'].includes(module),
        can_edit: module === 'tasks',
        can_delete: false,
        can_approve: ['tasks', 'leave', 'time_logs'].includes(module),
        can_export: !['settings', 'employees'].includes(module),
        visibility_scope: 'team' as VisibilityScope
      }));

    case 'employee':
      return modules.map(module => ({
        module_name: module,
        can_view: !['settings', 'employees', 'automation', 'audit'].includes(module),
        can_create: ['tasks', 'leave', 'time_logs', 'communication'].includes(module),
        can_edit: module === 'tasks',
        can_delete: false,
        can_approve: false,
        can_export: false,
        visibility_scope: 'own' as VisibilityScope
      }));

    case 'intern':
    default:
      return modules.map(module => ({
        module_name: module,
        can_view: ['tasks', 'attendance', 'training', 'communication'].includes(module),
        can_create: ['attendance', 'time_logs'].includes(module),
        can_edit: false,
        can_delete: false,
        can_approve: false,
        can_export: false,
        visibility_scope: 'own' as VisibilityScope
      }));
  }
}
