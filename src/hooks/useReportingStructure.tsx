import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface ReportingRelationship {
  id: string;
  user_id: string;
  manager_id: string | null;
  relationship_type: 'direct' | 'dotted_line';
  effective_from: string;
  effective_to: string | null;
}

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
  department_id: string | null;
  is_active: boolean;
}

interface ReportingStructureData {
  myManager: TeamMember | null;
  directReports: TeamMember[];
  allTeamMembers: TeamMember[];
  teamSize: number;
  isLoading: boolean;
  assignManager: (userId: string, managerId: string | null) => Promise<void>;
  removeManager: (userId: string) => Promise<void>;
  getTeamHierarchy: () => Promise<TeamMember[]>;
  refetch: () => void;
}

export function useReportingStructure(): ReportingStructureData {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch my manager
  const { data: myManager, isLoading: loadingManager } = useQuery({
    queryKey: ['my-manager', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data: relationship } = await supabase
        .from('reporting_structure')
        .select('manager_id')
        .eq('user_id', profile.id)
        .eq('relationship_type', 'direct')
        .is('effective_to', null)
        .single();

      if (!relationship?.manager_id) return null;

      const { data: manager } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, department_id, is_active')
        .eq('id', relationship.manager_id)
        .single();

      return manager as TeamMember | null;
    },
    enabled: !!profile?.id
  });

  // Fetch direct reports
  const { data: directReports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['direct-reports', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: relationships } = await supabase
        .from('reporting_structure')
        .select('user_id')
        .eq('manager_id', profile.id)
        .eq('relationship_type', 'direct')
        .is('effective_to', null);

      if (!relationships || relationships.length === 0) return [];

      const userIds = relationships.map(r => r.user_id);
      const { data: reports } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, department_id, is_active')
        .in('id', userIds)
        .eq('is_active', true);

      return (reports || []) as TeamMember[];
    },
    enabled: !!profile?.id
  });

  // Fetch all team members (recursive) using the database function
  const { data: allTeamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ['all-team-members', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Use the database function for recursive team members
      const { data: memberIds } = await supabase
        .rpc('get_team_members', { p_user_id: profile.id });

      if (!memberIds || memberIds.length === 0) return [];

      const { data: members } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, department_id, is_active')
        .in('id', memberIds.map((m: { member_id: string }) => m.member_id))
        .eq('is_active', true);

      return (members || []) as TeamMember[];
    },
    enabled: !!profile?.id
  });

  // Mutation to assign a manager
  const assignManagerMutation = useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string | null }) => {
      const orgId = profile?.organization_id;
      if (!orgId) throw new Error('No organization');

      // End any existing direct relationships
      await supabase
        .from('reporting_structure')
        .update({ effective_to: new Date().toISOString().split('T')[0] })
        .eq('user_id', userId)
        .eq('relationship_type', 'direct')
        .is('effective_to', null);

      // Create new relationship if manager provided
      if (managerId) {
        const { error } = await supabase
          .from('reporting_structure')
          .insert({
            organization_id: orgId,
            user_id: userId,
            manager_id: managerId,
            relationship_type: 'direct',
            effective_from: new Date().toISOString().split('T')[0],
            created_by: profile?.id
          });

        if (error) throw error;

        // Also update the quick reference on profiles
        await supabase
          .from('profiles')
          .update({ reporting_manager_id: managerId })
          .eq('id', userId);
      } else {
        await supabase
          .from('profiles')
          .update({ reporting_manager_id: null })
          .eq('id', userId);
      }
    },
    onSuccess: () => {
      toast.success('Manager assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['direct-reports'] });
      queryClient.invalidateQueries({ queryKey: ['all-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['my-manager'] });
      queryClient.invalidateQueries({ queryKey: ['org-chart'] });
    },
    onError: (error) => {
      toast.error('Failed to assign manager');
      console.error('Assign manager error:', error);
    }
  });

  const assignManager = useCallback(async (userId: string, managerId: string | null) => {
    await assignManagerMutation.mutateAsync({ userId, managerId });
  }, [assignManagerMutation]);

  const removeManager = useCallback(async (userId: string) => {
    await assignManager(userId, null);
  }, [assignManager]);

  const getTeamHierarchy = useCallback(async (): Promise<TeamMember[]> => {
    return allTeamMembers;
  }, [allTeamMembers]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['direct-reports'] });
    queryClient.invalidateQueries({ queryKey: ['all-team-members'] });
    queryClient.invalidateQueries({ queryKey: ['my-manager'] });
  }, [queryClient]);

  return {
    myManager: myManager || null,
    directReports,
    allTeamMembers,
    teamSize: directReports.length,
    isLoading: loadingManager || loadingReports || loadingTeam,
    assignManager,
    removeManager,
    getTeamHierarchy,
    refetch
  };
}

// Hook to get full org chart data
export function useOrgChart() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['org-chart', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // Get all profiles in the org
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, department_id, is_active, reporting_manager_id')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('role');

      // Get all reporting relationships
      const { data: relationships } = await supabase
        .from('reporting_structure')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .is('effective_to', null);

      // Build hierarchy
      const hierarchy = (profiles || []).map(p => ({
        ...p,
        managerId: p.reporting_manager_id || relationships?.find(r => r.user_id === p.id)?.manager_id || null,
        directReports: (profiles || []).filter(
          child => child.reporting_manager_id === p.id || 
            relationships?.some(r => r.user_id === child.id && r.manager_id === p.id)
        )
      }));

      return hierarchy;
    },
    enabled: !!profile?.organization_id
  });
}
