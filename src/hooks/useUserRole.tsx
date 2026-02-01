import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'org_admin' | 'admin' | 'hr_admin' | 'project_manager' | 'finance_manager' | 'manager' | 'team_lead' | 'employee' | 'intern';

interface UserRoleData {
  role: AppRole;
  allRoles: AppRole[];
  organizationId: string | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean; // True for super_admin, org_admin, or admin
  isHRAdmin: boolean;
  isProjectManager: boolean;
  isFinanceManager: boolean;
  isManager: boolean;
  isTeamLead: boolean;
  isEmployee: boolean;
  isLoading: boolean;
}

// Role priority order (higher = more privilege)
const ROLE_PRIORITY: Record<AppRole, number> = {
  'super_admin': 10,
  'org_admin': 9,
  'admin': 9,
  'hr_admin': 8,
  'project_manager': 8,
  'finance_manager': 8,
  'manager': 7,
  'team_lead': 6,
  'employee': 5,
  'intern': 4,
};

function getHighestPriorityRole(roles: AppRole[]): AppRole {
  if (roles.length === 0) return 'employee';
  return roles.reduce((highest, current) => 
    ROLE_PRIORITY[current] > ROLE_PRIORITY[highest] ? current : highest
  , roles[0]);
}

export function useUserRole(): UserRoleData {
  const { user, profile } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: 'employee',
    allRoles: [],
    organizationId: null,
    isSuperAdmin: false,
    isOrgAdmin: false,
    isAdmin: false,
    isHRAdmin: false,
    isProjectManager: false,
    isFinanceManager: false,
    isManager: false,
    isTeamLead: false,
    isEmployee: false,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleData({
          role: 'employee',
          allRoles: [],
          organizationId: null,
          isSuperAdmin: false,
          isOrgAdmin: false,
          isAdmin: false,
          isHRAdmin: false,
          isProjectManager: false,
          isFinanceManager: false,
          isManager: false,
          isTeamLead: false,
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
          : (profile?.role as AppRole) || 'employee';

        // Get organization_id (prefer from user_roles, fallback to profile)
        const organizationId = roleRecords?.[0]?.organization_id || profile?.organization_id || null;

        // Determine role flags based on highest role AND allRoles
        // Note: org_admin and admin have the SAME privileges
        const isSuperAdmin = highestRole === 'super_admin' || allRoles.includes('super_admin');
        const isOrgAdmin = isSuperAdmin || highestRole === 'org_admin' || allRoles.includes('org_admin');
        const isAdmin = isOrgAdmin || highestRole === 'admin' || allRoles.includes('admin');
        const isManager = isAdmin || highestRole === 'manager' || allRoles.includes('manager');
        const isTeamLead = isManager || highestRole === 'team_lead' || allRoles.includes('team_lead');
        const isEmployee = highestRole === 'employee' || allRoles.includes('employee');

        const isHRAdmin = isAdmin || highestRole === 'hr_admin' || allRoles.includes('hr_admin');
        const isProjectManager = isAdmin || highestRole === 'project_manager' || allRoles.includes('project_manager');
        const isFinanceManager = isAdmin || highestRole === 'finance_manager' || allRoles.includes('finance_manager');

        setRoleData({
          role: highestRole,
          allRoles,
          organizationId,
          isSuperAdmin,
          isOrgAdmin,
          isAdmin,
          isHRAdmin,
          isProjectManager,
          isFinanceManager,
          isManager,
          isTeamLead,
          isEmployee,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error in useUserRole:', error);
        const fallbackRole = (profile?.role as AppRole) || 'employee';
        const isSuperAdmin = fallbackRole === 'super_admin';
        const isOrgAdmin = isSuperAdmin || fallbackRole === 'org_admin';
        const isAdmin = isOrgAdmin || fallbackRole === 'admin';
        const isManager = isAdmin || fallbackRole === 'manager';
        const isTeamLead = isManager || fallbackRole === 'team_lead';
        
        const isHRAdmin = isAdmin || fallbackRole === 'hr_admin';
        const isProjectManager = isAdmin || fallbackRole === 'project_manager';
        const isFinanceManager = isAdmin || fallbackRole === 'finance_manager';
        
        setRoleData({
          role: fallbackRole,
          allRoles: [fallbackRole],
          organizationId: profile?.organization_id || null,
          isSuperAdmin,
          isOrgAdmin,
          isAdmin,
          isHRAdmin,
          isProjectManager,
          isFinanceManager,
          isManager,
          isTeamLead,
          isEmployee: fallbackRole === 'employee',
          isLoading: false,
        });
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

// Hook specifically for manager check
export function useIsManager(): { isManager: boolean; isLoading: boolean } {
  const { isManager, isLoading } = useUserRole();
  return { isManager, isLoading };
}

// Hook specifically for team lead check
export function useIsTeamLead(): { isTeamLead: boolean; isLoading: boolean } {
  const { isTeamLead, isLoading } = useUserRole();
  return { isTeamLead, isLoading };
}
