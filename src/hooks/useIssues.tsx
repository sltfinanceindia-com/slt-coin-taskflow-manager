import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Issue {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  task_id: string | null;
  issue_number: string;
  title: string;
  description: string | null;
  issue_type: 'bug' | 'defect' | 'improvement' | 'question' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'blocked' | 'resolved' | 'closed' | 'wont_fix';
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
      
      let query = (supabase as any)
        .from('issues')
        .select(`
          *,
          project:projects(id, name),
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
      return (data || []) as Issue[];
    },
    enabled: !!profile?.organization_id,
  });

  const createIssue = useMutation({
    mutationFn: async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'project' | 'reporter' | 'assignee' | 'organization_id' | 'issue_number'>) => {
      const issueNumber = `ISS-${Date.now().toString().slice(-6)}`;
      const { data, error } = await (supabase as any)
        .from('issues')
        .insert({
          ...issue,
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
      const updateData: any = { ...updates };
      if (updates.status === 'resolved' && !updates.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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