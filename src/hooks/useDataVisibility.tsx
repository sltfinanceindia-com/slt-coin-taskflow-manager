import { useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { usePermissions, ModuleName, VisibilityScope } from './usePermissions';
import { useReportingStructure } from './useReportingStructure';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DataVisibilityResult {
  visibleUserIds: string[];
  visibilityScope: VisibilityScope;
  isLoading: boolean;
  filterByVisibility: <T extends { assignee_id?: string; user_id?: string; employee_id?: string; creator_id?: string }>(
    items: T[]
  ) => T[];
  canAccessRecord: (recordUserId: string | null | undefined) => boolean;
}

export function useDataVisibility(module: ModuleName): DataVisibilityResult {
  const { profile } = useAuth();
  const { getVisibilityScope, isLoading: permissionsLoading } = usePermissions();
  const { directReports, allTeamMembers, isLoading: structureLoading } = useReportingStructure();

  const visibilityScope = getVisibilityScope(module);

  // Get department from profile (could be department or department_id depending on schema)
  const profileDepartment = (profile as any)?.department_id || (profile as any)?.department;

  // Fetch department members when needed
  const { data: departmentMembers = [], isLoading: departmentLoading } = useQuery({
    queryKey: ['department-members', profileDepartment],
    queryFn: async () => {
      if (!profileDepartment || visibilityScope !== 'department') return [];
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('department_id', profileDepartment)
        .eq('is_active', true);
      
      return (data || []).map(p => p.id);
    },
    enabled: !!profileDepartment && visibilityScope === 'department'
  });

  // Fetch all org members when needed
  const { data: allOrgMembers = [], isLoading: orgLoading } = useQuery({
    queryKey: ['org-members', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || visibilityScope !== 'all') return [];
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);
      
      return (data || []).map(p => p.id);
    },
    enabled: !!profile?.organization_id && visibilityScope === 'all'
  });

  // Calculate visible user IDs based on scope
  const visibleUserIds = useMemo((): string[] => {
    if (!profile?.id) return [];

    switch (visibilityScope) {
      case 'own':
        return [profile.id];
      
      case 'team':
        // Include self + direct reports + all nested team members
        return [profile.id, ...directReports.map(r => r.id), ...allTeamMembers.map(m => m.id)];
      
      case 'department':
        // Include all department members
        return departmentMembers.length > 0 ? departmentMembers : [profile.id];
      
      case 'all':
        // Include all org members
        return allOrgMembers.length > 0 ? allOrgMembers : [profile.id];
      
      default:
        return [profile.id];
    }
  }, [profile?.id, visibilityScope, directReports, allTeamMembers, departmentMembers, allOrgMembers]);

  // Filter function to apply to arrays of data
  const filterByVisibility = useCallback(<T extends { assignee_id?: string; user_id?: string; employee_id?: string; creator_id?: string }>(
    items: T[]
  ): T[] => {
    if (visibilityScope === 'all') return items;
    if (!profile?.id) return [];

    return items.filter(item => {
      const itemUserId = item.assignee_id || item.user_id || item.employee_id;
      const creatorId = item.creator_id;
      
      // Always allow if user is the creator
      if (creatorId === profile.id) return true;
      
      // Check if item belongs to a visible user
      if (itemUserId && visibleUserIds.includes(itemUserId)) return true;
      
      return false;
    });
  }, [visibilityScope, profile?.id, visibleUserIds]);

  // Check if user can access a specific record
  const canAccessRecord = useCallback((recordUserId: string | null | undefined): boolean => {
    if (visibilityScope === 'all') return true;
    if (!recordUserId) return false;
    return visibleUserIds.includes(recordUserId);
  }, [visibilityScope, visibleUserIds]);

  const isLoading = permissionsLoading || structureLoading || departmentLoading || orgLoading;

  return {
    visibleUserIds,
    visibilityScope,
    isLoading,
    filterByVisibility,
    canAccessRecord
  };
}

// Hook to apply visibility filter to a Supabase query
export function useVisibilityQuery(module: ModuleName) {
  const { visibleUserIds, visibilityScope, isLoading } = useDataVisibility(module);

  const applyFilter = useCallback((query: any, userIdColumn: string = 'assignee_id') => {
    if (visibilityScope === 'all' || visibleUserIds.length === 0) {
      return query;
    }
    return query.in(userIdColumn, visibleUserIds);
  }, [visibleUserIds, visibilityScope]);

  return {
    applyFilter,
    visibleUserIds,
    visibilityScope,
    isLoading
  };
}
