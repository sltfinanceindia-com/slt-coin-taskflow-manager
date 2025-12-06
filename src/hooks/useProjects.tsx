import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  status: 'active' | 'completed' | 'archived';
  organization_id?: string;
  created_at: string;
  updated_at: string;
  creator_profile?: {
    id: string;
    full_name: string;
  };
  tasks?: any[];
}

export function useProjects() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator_profile:profiles!projects_created_by_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(project => ({
        ...project,
        creator_profile: Array.isArray(project.creator_profile) 
          ? project.creator_profile[0] 
          : project.creator_profile
      })) as Project[];
    },
    enabled: !!profile?.organization_id,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: {
      name: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          created_by: profile?.id,
          organization_id: profile?.organization_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project Created",
        description: "Project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ 
      projectId, 
      updates 
    }: { 
      projectId: string; 
      updates: Partial<Pick<Project, 'name' | 'description' | 'status'>>
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project Updated",
        description: "Project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
  };
}
