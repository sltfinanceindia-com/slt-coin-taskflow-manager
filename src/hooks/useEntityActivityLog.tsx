import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityLogEntry {
  id: string;
  entity_type: 'task' | 'project' | 'program' | 'portfolio';
  entity_id: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'comment_added';
  user_id: string;
  user_name?: string;
  changes: Array<{ field: string; old_value: any; new_value: any }>;
  metadata?: Record<string, any>;
  created_at: string;
  content?: string;
}

interface LogActivityParams {
  entity_type: ActivityLogEntry['entity_type'];
  entity_id: string;
  action: ActivityLogEntry['action'];
  changes?: ActivityLogEntry['changes'];
  metadata?: Record<string, any>;
  task_id?: string;
}

/**
 * Hook for logging and fetching entity activity
 * Stores activities in project_updates table with proper typing
 */
export function useEntityActivityLog(entityType?: string, entityId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch activity logs for a specific entity
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['entity-activity', entityType, entityId],
    queryFn: async () => {
      if (!entityId || !entityType) return [];

      // Query based on entity type
      let query = supabase
        .from('project_updates')
        .select(`
          id,
          update_type,
          content,
          project_id,
          task_id,
          user_id,
          metadata,
          created_at,
          user:profiles!project_updates_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by entity
      if (entityType === 'project') {
        query = query.eq('project_id', entityId);
      } else if (entityType === 'task') {
        query = query.eq('task_id', entityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to activity log format
      return (data || []).map(item => ({
        id: item.id,
        entity_type: entityType as ActivityLogEntry['entity_type'],
        entity_id: item.project_id || item.task_id || entityId,
        action: item.update_type as ActivityLogEntry['action'],
        user_id: item.user_id,
        user_name: item.user?.full_name,
        changes: (item.metadata as any)?.changes || [],
        metadata: item.metadata as Record<string, any>,
        created_at: item.created_at,
        content: item.content,
      }));
    },
    enabled: !!entityId && !!entityType,
  });

  // Log a new activity
  const logActivityMutation = useMutation({
    mutationFn: async (params: LogActivityParams) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User not authenticated');
      }

      const insertData: any = {
        user_id: profile.id,
        organization_id: profile.organization_id,
        update_type: params.action,
        content: generateActivityContent(params),
        metadata: {
          entity_type: params.entity_type,
          changes: params.changes || [],
          ...params.metadata,
        },
      };

      // Set the correct entity reference
      if (params.entity_type === 'project') {
        insertData.project_id = params.entity_id;
      } else if (params.entity_type === 'task') {
        insertData.task_id = params.task_id || params.entity_id;
        // Also set project_id if available in metadata
        if (params.metadata?.project_id) {
          insertData.project_id = params.metadata.project_id;
        }
      }

      const { data, error } = await supabase
        .from('project_updates')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['entity-activity', params.entity_type, params.entity_id] });
      queryClient.invalidateQueries({ queryKey: ['project-updates'] });
    },
    onError: (error) => {
      console.error('Failed to log activity:', error);
    },
  });

  // Helper to log task edit
  const logTaskEdit = async (taskId: string, oldData: any, newData: any) => {
    const changes = detectChanges(oldData, newData);
    if (changes.length === 0) return;

    return logActivityMutation.mutateAsync({
      entity_type: 'task',
      entity_id: taskId,
      task_id: taskId,
      action: 'updated',
      changes,
      metadata: {
        task_title: newData.title || oldData.title,
        project_id: newData.project_id || oldData.project_id,
      },
    });
  };

  // Helper to log project edit
  const logProjectEdit = async (projectId: string, oldData: any, newData: any) => {
    const changes = detectChanges(oldData, newData);
    if (changes.length === 0) return;

    return logActivityMutation.mutateAsync({
      entity_type: 'project',
      entity_id: projectId,
      action: 'updated',
      changes,
      metadata: {
        project_name: newData.name || oldData.name,
      },
    });
  };

  return {
    activities,
    isLoading,
    error,
    logActivity: logActivityMutation.mutateAsync,
    logTaskEdit,
    logProjectEdit,
    isLogging: logActivityMutation.isPending,
  };
}

// Utility functions
function detectChanges(oldData: any, newData: any): ActivityLogEntry['changes'] {
  const changes: ActivityLogEntry['changes'] = [];
  const fieldsToTrack = [
    'title', 'name', 'description', 'status', 'priority', 'stage',
    'assigned_to', 'start_date', 'end_date', 'target_end_date',
    'estimated_hours', 'actual_hours', 'progress_percentage',
    'slt_coin_value', 'health_status', 'budget', 'sponsor_id'
  ];

  for (const field of fieldsToTrack) {
    const oldValue = oldData?.[field];
    const newValue = newData?.[field];
    
    // Only track if values are different and not both empty
    if (oldValue !== newValue && (oldValue || newValue)) {
      changes.push({
        field,
        old_value: oldValue ?? null,
        new_value: newValue ?? null,
      });
    }
  }

  return changes;
}

function generateActivityContent(params: LogActivityParams): string {
  const entityLabel = params.metadata?.task_title || params.metadata?.project_name || params.entity_type;
  
  if (!params.changes || params.changes.length === 0) {
    return `${params.entity_type} "${entityLabel}" was ${params.action}`;
  }

  const changesList = params.changes.map(change => {
    const fieldLabel = formatFieldLabel(change.field);
    if (change.old_value && change.new_value) {
      return `${fieldLabel}: "${change.old_value}" → "${change.new_value}"`;
    } else if (change.new_value) {
      return `${fieldLabel}: set to "${change.new_value}"`;
    } else {
      return `${fieldLabel}: cleared`;
    }
  });

  return `Updated ${entityLabel}: ${changesList.join(', ')}`;
}

function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: 'Title',
    name: 'Name',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    stage: 'Stage',
    assigned_to: 'Assignee',
    start_date: 'Start Date',
    end_date: 'Due Date',
    target_end_date: 'Target End Date',
    estimated_hours: 'Estimated Hours',
    actual_hours: 'Actual Hours',
    progress_percentage: 'Progress',
    slt_coin_value: 'Coin Value',
    health_status: 'Health Status',
    budget: 'Budget',
    sponsor_id: 'Sponsor',
  };

  return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
