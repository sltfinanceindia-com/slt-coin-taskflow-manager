import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'org_admin' | 'admin' | 'hr_admin' | 'project_manager' | 'finance_manager' | 'manager' | 'team_lead' | 'employee' | 'intern';

interface UserRoleData {
  role: AppRole;
  allRoles: AppRole[];
  organizationId: string | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean;
  isHRAdmin: boolean;
  isProjectManager: boolean;
  isFinanceManager: boolean;
  isManager: boolean;
  isTeamLead: boolean;
  isEmployee: boolean;
  isLoading: boolean;
}

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

const PROFILE_HYDRATION_TIMEOUT_MS = 10000;

export function useUserRole(): UserRoleData {
  const { user, profile, loading: authLoading } = useAuth();
  const [profileTimedOut, setProfileTimedOut] = useState(false);

  useEffect(() => {
    if (!user || profile?.id) {
      setProfileTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setProfileTimedOut(true), PROFILE_HYDRATION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [user, profile?.id]);

  const profileReady = !!user && !!profile?.id;

  const { data: roleRecords, isLoading: isQueryLoading } = useQuery({
    queryKey: ['user-role', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, organization_id')
        .eq('user_id', profile!.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return null;
      }
      return data;
    },
    enabled: profileReady,
    staleTime: 1000 * 60 * 5,
  });

  const isRoleLoading = authLoading || (!!user && !profile?.id && !profileTimedOut) || (profileReady && isQueryLoading);

  return useMemo<UserRoleData>(() => {
    if (!user) {
      return {
        role: 'employee', allRoles: [], organizationId: null,
        isSuperAdmin: false, isOrgAdmin: false, isAdmin: false,
        isHRAdmin: false, isProjectManager: false, isFinanceManager: false,
        isManager: false, isTeamLead: false, isEmployee: false, isLoading: false,
      };
    }

    if (isRoleLoading) {
      const cachedRole = typeof window !== 'undefined'
        ? (localStorage.getItem('tenexa-cached-role') as AppRole | null)
        : null;
      return {
        role: cachedRole || 'employee',
        allRoles: cachedRole ? [cachedRole] : [],
        organizationId: null,
        isSuperAdmin: cachedRole === 'super_admin',
        isOrgAdmin: cachedRole === 'super_admin' || cachedRole === 'org_admin',
        isAdmin: cachedRole === 'super_admin' || cachedRole === 'org_admin' || cachedRole === 'admin',
        isHRAdmin: cachedRole === 'hr_admin' || cachedRole === 'super_admin' || cachedRole === 'org_admin' || cachedRole === 'admin',
        isProjectManager: false, isFinanceManager: false,
        isManager: false, isTeamLead: false,
        isEmployee: !cachedRole || cachedRole === 'employee',
        isLoading: true,
      };
    }

    const allRoles = (roleRecords?.map(r => r.role as AppRole) || []);
    const highestRole = allRoles.length > 0
      ? getHighestPriorityRole(allRoles)
      : (profile?.role as AppRole) || 'employee';

    const organizationId = roleRecords?.[0]?.organization_id || profile?.organization_id || null;

    const isSuperAdmin = highestRole === 'super_admin' || allRoles.includes('super_admin');
    const isOrgAdmin = isSuperAdmin || highestRole === 'org_admin' || allRoles.includes('org_admin');
    const isAdmin = isOrgAdmin || highestRole === 'admin' || allRoles.includes('admin');
    const isManager = isAdmin || highestRole === 'manager' || allRoles.includes('manager');
    const isTeamLead = isManager || highestRole === 'team_lead' || allRoles.includes('team_lead');
    const isEmployee = highestRole === 'employee' || allRoles.includes('employee');
    const isHRAdmin = isAdmin || highestRole === 'hr_admin' || allRoles.includes('hr_admin');
    const isProjectManager = isAdmin || highestRole === 'project_manager' || allRoles.includes('project_manager');
    const isFinanceManager = isAdmin || highestRole === 'finance_manager' || allRoles.includes('finance_manager');

    if (typeof window !== 'undefined') {
      localStorage.setItem('tenexa-cached-role', highestRole);
    }

    return {
      role: highestRole, allRoles, organizationId,
      isSuperAdmin, isOrgAdmin, isAdmin, isHRAdmin,
      isProjectManager, isFinanceManager, isManager, isTeamLead,
      isEmployee, isLoading: false,
    };
  }, [user, profile, roleRecords, isRoleLoading]);
}

export function useIsSuperAdmin(): { isSuperAdmin: boolean; isLoading: boolean } {
  const { isSuperAdmin, isLoading } = useUserRole();
  return { isSuperAdmin, isLoading };
}

export function useIsOrgAdmin(): { isOrgAdmin: boolean; isLoading: boolean } {
  const { isOrgAdmin, isLoading } = useUserRole();
  return { isOrgAdmin, isLoading };
}

export function useIsAnyAdmin(): { isAnyAdmin: boolean; isLoading: boolean } {
  const { isAdmin, isLoading } = useUserRole();
  return { isAnyAdmin: isAdmin, isLoading };
}

export function useIsManager(): { isManager: boolean; isLoading: boolean } {
  const { isManager, isLoading } = useUserRole();
  return { isManager, isLoading };
}

export function useIsTeamLead(): { isTeamLead: boolean; isLoading: boolean } {
  const { isTeamLead, isLoading } = useUserRole();
  return { isTeamLead, isLoading };
}
