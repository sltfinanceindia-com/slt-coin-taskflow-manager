import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  default_tasks: any[];
  default_dependencies: any[];
  default_roles: any[];
  category: string;
  is_active: boolean;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  tasks: any[];
  category: string;
  is_active: boolean;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useTemplates = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const projectTemplatesQuery = useQuery({
    queryKey: ['project-templates', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ProjectTemplate[];
    },
    enabled: !!profile?.organization_id,
  });

  const taskTemplatesQuery = useQuery({
    queryKey: ['task-templates', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as TaskTemplate[];
    },
    enabled: !!profile?.organization_id,
  });

  const createProjectTemplate = useMutation({
    mutationFn: async (template: Partial<ProjectTemplate>) => {
      const { data, error } = await supabase
        .from('project_templates')
        .insert({
          name: template.name!,
          description: template.description,
          default_tasks: template.default_tasks || [],
          default_dependencies: template.default_dependencies || [],
          default_roles: template.default_roles || [],
          category: template.category || 'general',
          created_by: profile!.id,
          organization_id: profile!.organization_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast.success('Project template created');
    },
    onError: (error) => {
      toast.error('Failed to create template: ' + error.message);
    },
  });

  const createTaskTemplate = useMutation({
    mutationFn: async (template: Partial<TaskTemplate>) => {
      const { data, error } = await supabase
        .from('task_templates')
        .insert({
          name: template.name!,
          description: template.description,
          tasks: template.tasks || [],
          category: template.category || 'general',
          created_by: profile!.id,
          organization_id: profile!.organization_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast.success('Task template created');
    },
    onError: (error) => {
      toast.error('Failed to create template: ' + error.message);
    },
  });

  const updateProjectTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('project_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast.success('Template updated');
    },
  });

  const updateTaskTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('task_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast.success('Template updated');
    },
  });

  const deleteProjectTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_templates')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      toast.success('Template deleted');
    },
  });

  const deleteTaskTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_templates')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast.success('Template deleted');
    },
  });

  const applyProjectTemplate = async (templateId: string, projectName: string) => {
    const template = projectTemplatesQuery.data?.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    // Create project from template
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectName,
        description: template.description,
        organization_id: profile!.organization_id,
        created_by: profile!.id,
        status: 'active',
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create tasks from template
    if (template.default_tasks.length > 0) {
      const tasks = template.default_tasks.map((task: any) => ({
        ...task,
        project_id: project.id,
        organization_id: profile!.organization_id,
        created_by: profile!.id,
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks);

      if (tasksError) throw tasksError;
    }

    toast.success('Project created from template');
    return project;
  };

  return {
    projectTemplates: projectTemplatesQuery.data || [],
    taskTemplates: taskTemplatesQuery.data || [],
    isLoading: projectTemplatesQuery.isLoading || taskTemplatesQuery.isLoading,
    createProjectTemplate,
    createTaskTemplate,
    updateProjectTemplate,
    updateTaskTemplate,
    deleteProjectTemplate,
    deleteTaskTemplate,
    applyProjectTemplate,
  };
};
