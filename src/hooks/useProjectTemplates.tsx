import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// This hook works with the existing project_templates table schema
export interface ProjectTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  category: string | null;
  default_tasks: Json;
  default_dependencies: Json;
  default_roles: Json;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateProjectTemplateData = {
  name: string;
  description?: string | null;
  category?: string | null;
  default_tasks?: Json;
  default_dependencies?: Json;
  default_roles?: Json;
  is_active?: boolean;
};

export function useProjectTemplates() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['project-templates', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectTemplate[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (template: CreateProjectTemplateData) => {
      const { data, error } = await supabase
        .from('project_templates')
        .insert({
          ...template,
          organization_id: profile?.organization_id!,
          created_by: profile?.id,
          default_tasks: template.default_tasks || [],
          default_dependencies: template.default_dependencies || [],
          default_roles: template.default_roles || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast({
        title: 'Template Created',
        description: 'Project template has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('project_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast({
        title: 'Template Updated',
        description: 'Project template has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('project_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast({
        title: 'Template Deleted',
        description: 'Project template has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper to parse tasks from template
  const parseTemplateTasks = (template: ProjectTemplate) => {
    if (!template.default_tasks) return [];
    if (Array.isArray(template.default_tasks)) {
      return template.default_tasks;
    }
    return [];
  };

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    parseTemplateTasks,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
