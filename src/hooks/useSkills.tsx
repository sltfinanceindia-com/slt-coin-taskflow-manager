import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  organization_id: string | null;
  created_at: string;
}

export interface EmployeeSkill {
  id: string;
  profile_id: string;
  skill_id: string;
  proficiency_level: number;
  years_experience: number | null;
  is_certified: boolean;
  certified_date: string | null;
  organization_id: string | null;
  skill?: Skill;
  profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface CreateSkillData {
  name: string;
  category: string;
  description?: string;
}

export interface AssignSkillData {
  profile_id: string;
  skill_id: string;
  proficiency_level: number;
  years_experience?: number;
  is_certified?: boolean;
}

export function useSkills() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const skillsQuery = useQuery({
    queryKey: ['skills', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!profile?.organization_id,
  });

  const employeeSkillsQuery = useQuery({
    queryKey: ['employee-skills', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('employee_skills')
        .select(`
          *,
          skill:skills(*),
          profile:profiles(id, full_name, email, avatar_url)
        `)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return data as EmployeeSkill[];
    },
    enabled: !!profile?.organization_id,
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: CreateSkillData) => {
      if (!profile?.organization_id || !profile?.id) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('skills')
        .insert({
          ...data,
          organization_id: profile.organization_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: 'Skill Created', description: 'New skill has been added.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['employee-skills'] });
      toast({ title: 'Skill Deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const assignSkillMutation = useMutation({
    mutationFn: async (data: AssignSkillData) => {
      if (!profile?.organization_id) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('employee_skills')
        .upsert({
          ...data,
          organization_id: profile.organization_id,
        }, { onConflict: 'profile_id,skill_id' })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills'] });
      toast({ title: 'Skill Assigned', description: 'Skill has been assigned to employee.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const removeEmployeeSkillMutation = useMutation({
    mutationFn: async (employeeSkillId: string) => {
      const { error } = await supabase
        .from('employee_skills')
        .delete()
        .eq('id', employeeSkillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills'] });
      toast({ title: 'Skill Removed' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Group skills by category
  const skillsByCategory = skillsQuery.data?.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>) || {};

  // Group employee skills by profile
  const skillsByEmployee = employeeSkillsQuery.data?.reduce((acc, es) => {
    if (!acc[es.profile_id]) acc[es.profile_id] = [];
    acc[es.profile_id].push(es);
    return acc;
  }, {} as Record<string, EmployeeSkill[]>) || {};

  return {
    skills: skillsQuery.data || [],
    employeeSkills: employeeSkillsQuery.data || [],
    skillsByCategory,
    skillsByEmployee,
    isLoading: skillsQuery.isLoading || employeeSkillsQuery.isLoading,
    error: skillsQuery.error || employeeSkillsQuery.error,
    createSkill: createSkillMutation.mutate,
    deleteSkill: deleteSkillMutation.mutate,
    assignSkill: assignSkillMutation.mutate,
    removeEmployeeSkill: removeEmployeeSkillMutation.mutate,
    isCreating: createSkillMutation.isPending,
    isAssigning: assignSkillMutation.isPending,
  };
}
