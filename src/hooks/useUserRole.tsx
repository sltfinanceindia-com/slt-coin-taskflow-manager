import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'org_admin' | 'admin' | 'employee' | 'intern';

interface UserRoleData {
  role: AppRole;
  allRoles: AppRole[];
  organizationId: string | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isLoading: boolean;
}

// Role priority order (higher = more privilege)
const ROLE_PRIORITY: Record<AppRole, number> = {
  'super_admin': 5,
  'org_admin': 4,
  'admin': 3,
  'employee': 2,
  'intern': 1,
};

function getHighestPriorityRole(roles: AppRole[]): AppRole {
  if (roles.length === 0) return 'intern';
  return roles.reduce((highest, current) => 
    ROLE_PRIORITY[current] > ROLE_PRIORITY[highest] ? current : highest
  , roles[0]);
}

export function useUserRole(): UserRoleData {
  const { user, profile } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: 'intern',
    allRoles: [],
    organizationId: null,
    isSuperAdmin: false,
    isOrgAdmin: false,
    isAdmin: false,
    isEmployee: false,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleData({
          role: 'intern',
          allRoles: [],
          organizationId: null,
          isSuperAdmin: false,
          isOrgAdmin: false,
          isAdmin: false,
          isEmployee: false,
          isLoading: false,
        });
        return;
      }

      try {
        // Fetch ALL roles for this user from user_roles table
        const { data: roleRecords, error: roleError } = await supabase
          .from('user_roles')
          .select('role, organization_id')
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Error fetching user roles:', roleError);
        }

        // Get all roles as array
        const allRoles = (roleRecords?.map(r => r.role as AppRole) || []);
        
        // Get the highest privilege role
        const highestRole = allRoles.length > 0 
          ? getHighestPriorityRole(allRoles) 
          : (profile?.role as AppRole) || 'intern';

        // Get organization_id (prefer from user_roles, fallback to profile)
        const organizationId = roleRecords?.[0]?.organization_id || profile?.organization_id || null;

        // Determine role flags based on highest role
        const isSuperAdmin = highestRole === 'super_admin' || allRoles.includes('super_admin');
        const isOrgAdmin = isSuperAdmin || highestRole === 'org_admin' || allRoles.includes('org_admin');
        const isAdmin = isOrgAdmin || highestRole === 'admin' || allRoles.includes('admin');
        const isEmployee = highestRole === 'employee' || allRoles.includes('employee');

        setRoleData({
          role: highestRole,
          allRoles,
          organizationId,
          isSuperAdmin,
          isOrgAdmin,
          isAdmin,
          isEmployee,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRoleData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserRole();
  }, [user, profile]);

  return roleData;
}

// Hook specifically for super admin check
export function useIsSuperAdmin(): { isSuperAdmin: boolean; isLoading: boolean } {
  const { isSuperAdmin, isLoading } = useUserRole();
  return { isSuperAdmin, isLoading };
}

// Hook specifically for org admin check
export function useIsOrgAdmin(): { isOrgAdmin: boolean; isLoading: boolean } {
  const { isOrgAdmin, isLoading } = useUserRole();
  return { isOrgAdmin, isLoading };
}

// Hook specifically for any admin check (super_admin, org_admin, or admin)
export function useIsAnyAdmin(): { isAnyAdmin: boolean; isLoading: boolean } {
  const { isAdmin, isLoading } = useUserRole();
  return { isAnyAdmin: isAdmin, isLoading };
}
