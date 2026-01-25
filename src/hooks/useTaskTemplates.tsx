import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  tasks: Json;
  category: string | null;
  is_active: boolean | null;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

// Parsed task from template
export interface TemplateTask {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  slt_coin_value?: number;
}

export type CreateTaskTemplateData = Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'created_by'>;

export function useTaskTemplates() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
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

  // Helper to parse tasks from template
  const parseTemplateTasks = (template: TaskTemplate): TemplateTask[] => {
    if (!template.tasks) return [];
    
    try {
      const tasks = template.tasks as unknown;
      if (Array.isArray(tasks)) {
        return tasks as TemplateTask[];
      }
      return [];
    } catch {
      return [];
    }
  };

  const createTemplate = useMutation({
    mutationFn: async (template: CreateTaskTemplateData) => {
      const { data, error } = await supabase
        .from('task_templates')
        .insert([{
          ...template,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: 'Template Created',
        description: 'Task template has been created successfully.',
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

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('task_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: 'Template Updated',
        description: 'Task template has been updated successfully.',
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

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: 'Template Deleted',
        description: 'Task template has been deleted.',
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

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    parseTemplateTasks,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
