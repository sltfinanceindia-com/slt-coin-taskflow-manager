import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProjectActivity {
  id: string;
  user_id: string;
  activity_type: string;
  task_id?: string;
  metadata: Record<string, any>;
  timestamp: string;
  user_profile?: {
    id: string;
    full_name: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

export function useProjectActivity(projectId: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['project-activity', projectId],
    queryFn: async () => {
      if (!profile?.organization_id || !projectId) return [];

      // Get tasks for this project first
      const { data: projectTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId);

      if (!projectTasks || projectTasks.length === 0) return [];

      const taskIds = projectTasks.map(t => t.id);

      // Get activity logs for those tasks
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          activity_type,
          task_id,
          metadata,
          timestamp,
          user_profile:profiles!activity_logs_user_id_fkey(id, full_name),
          task:tasks(id, title)
        `)
        .in('task_id', taskIds)
        .eq('organization_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        user_profile: Array.isArray(item.user_profile) ? item.user_profile[0] : item.user_profile,
        task: Array.isArray(item.task) ? item.task[0] : item.task
      })) as ProjectActivity[];
    },
    enabled: !!profile?.organization_id && !!projectId,
  });
}
