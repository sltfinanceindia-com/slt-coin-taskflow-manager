import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CareerPathLevel {
  id: string;
  career_path_id: string | null;
  organization_id: string | null;
  title: string;
  level_order: number;
  experience_min: number | null;
  experience_max: number | null;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[] | null;
  responsibilities: string[] | null;
  created_at: string | null;
}

export interface CareerPath {
  id: string;
  organization_id: string | null;
  track_name: string;
  department: string;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  levels?: CareerPathLevel[];
}

export function useCareerPaths() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const pathsQuery = useQuery({
    queryKey: ['career-paths', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('career_paths')
        .select(`
          *,
          levels:career_path_levels(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('track_name', { ascending: true });
      if (error) throw error;
      return data as CareerPath[];
    },
    enabled: !!profile?.organization_id,
  });

  const createPath = useMutation({
    mutationFn: async (path: Omit<CareerPath, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'created_by' | 'levels'>) => {
      const { data, error } = await supabase
        .from('career_paths')
        .insert({ ...path, organization_id: profile?.organization_id, created_by: profile?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-paths'] });
      toast.success('Career path created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePath = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CareerPath> & { id: string }) => {
      const { data, error } = await supabase
        .from('career_paths')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-paths'] });
      toast.success('Career path updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePath = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('career_paths')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-paths'] });
      toast.success('Career path deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const createLevel = useMutation({
    mutationFn: async (level: Omit<CareerPathLevel, 'id' | 'created_at' | 'organization_id'>) => {
      const { data, error } = await supabase
        .from('career_path_levels')
        .insert({ ...level, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-paths'] });
      toast.success('Career level added successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    paths: pathsQuery.data || [],
    isLoading: pathsQuery.isLoading,
    error: pathsQuery.error,
    createPath,
    updatePath,
    deletePath,
    createLevel,
  };
}
