import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from './useAuth';
export type AppRole = 'super_admin' | 'org_admin' | 'admin' | 'manager' | 'intern' | 'employee';

interface UserRoleData {
  role: AppRole;
  organizationId: string | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useUserRole(): UserRoleData {
  const { user, profile } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: 'intern',
    organizationId: null,
    isSuperAdmin: false,
    isOrgAdmin: false,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleData({
          role: 'intern',
          organizationId: null,
          isSuperAdmin: false,
          isOrgAdmin: false,
          isAdmin: false,
          isLoading: false,
        });
        return;
      }

      try {
        // Fetch role from user_roles table (security best practice)
        const { data: roleRecord, error: roleError } = await supabase
          .from('user_roles')
          .select('role, organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
        }

        const userRole = (roleRecord?.role as AppRole) || (profile?.role as AppRole) || 'intern';
        const organizationId = roleRecord?.organization_id || profile?.organization_id || null;

        setRoleData({
          role: userRole,
          organizationId,
          isSuperAdmin: userRole === 'super_admin',
          isOrgAdmin: userRole === 'org_admin' || userRole === 'admin',
          isAdmin: userRole === 'super_admin' || userRole === 'org_admin' || userRole === 'admin',
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
