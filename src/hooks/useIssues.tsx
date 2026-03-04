import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Issue {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  task_id: string | null;
  issue_number: string | null;
  title: string;
  description: string | null;
  issue_type: string;
  priority: string;
  severity: string | null;
  status: string;
  reporter_id: string | null;
  assignee_id: string | null;
  root_cause: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
  reporter?: {
    id: string;
    full_name: string | null;
  } | null;
  assignee?: {
    id: string;
    full_name: string | null;
  } | null;
}

export function useIssues(projectId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const issuesQuery = useQuery({
    queryKey: ['issues', profile?.organization_id, projectId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('issues')
        .select(`
          *,
          project:projects!issues_project_id_fkey(id, name),
          reporter:profiles!issues_reporter_id_fkey(id, full_name),
          assignee:profiles!issues_assignee_id_fkey(id, full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Issue[];
    },
    enabled: !!profile?.organization_id,
  });

  const createIssue = useMutation({
    mutationFn: async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'project' | 'reporter' | 'assignee' | 'organization_id' | 'issue_number'>) => {
      const issueNumber = `ISS-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: issue.title,
          description: issue.description,
          issue_type: issue.issue_type,
          priority: issue.priority,
          severity: issue.severity,
          status: issue.status,
          project_id: issue.project_id,
          task_id: issue.task_id,
          assignee_id: issue.assignee_id,
          root_cause: issue.root_cause,
          resolution: issue.resolution,
          resolved_at: issue.resolved_at,
          issue_number: issueNumber,
          organization_id: profile?.organization_id,
          reporter_id: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue created successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateIssue = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Issue> & { id: string }) => {
      const updateData: Record<string, any> = { ...updates };
      // Remove relation fields that aren't columns
      delete updateData.project;
      delete updateData.reporter;
      delete updateData.assignee;
      
      if (updates.status === 'resolved' && !updates.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue updated successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteIssue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue deleted successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return {
    issues: issuesQuery.data || [],
    isLoading: issuesQuery.isLoading,
    error: issuesQuery.error,
    createIssue,
    updateIssue,
    deleteIssue,
  };
}
