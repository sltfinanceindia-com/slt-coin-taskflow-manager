import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UpdateType = 
  | 'comment'
  | 'status_change'
  | 'file_upload'
  | 'assignment'
  | 'milestone'
  | 'alert'
  | 'deadline'
  | 'task_created'
  | 'task_completed'
  | 'task_verified'
  | 'time_logged'
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_rejected'
  | 'attendance_clock_in'
  | 'attendance_clock_out';

interface CreateUpdateParams {
  updateType: UpdateType;
  content: string;
  projectId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
  mentions?: string[];
  isImportant?: boolean;
}

/**
 * Hook for automatically creating project updates from various system events
 * Use this in other hooks to create activity feed entries
 */
export function useAutoUpdate() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const createUpdate = useMutation({
    mutationFn: async (params: CreateUpdateParams) => {
      if (!profile?.id || !profile?.organization_id) {
        console.warn('Cannot create update: user not authenticated');
        return null;
      }

      const { data, error } = await supabase
        .from('project_updates')
        .insert([{
          user_id: profile.id,
          organization_id: profile.organization_id,
          update_type: params.updateType,
          content: params.content,
          project_id: params.projectId || null,
          task_id: params.taskId || null,
          metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : {},
          mentions: params.mentions || [],
          is_important: params.isImportant || false,
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to create auto update:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate project updates to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['project-updates'] });
    },
    onError: (error) => {
      console.error('Auto update creation failed:', error);
    },
  });

  // Helper functions for common update types
  const logTaskCreated = (taskTitle: string, taskId: string, assigneeNames: string[]) => {
    return createUpdate.mutateAsync({
      updateType: 'task_created',
      content: `Created task "${taskTitle}" and assigned to ${assigneeNames.join(', ')}`,
      taskId,
      metadata: { taskTitle, assignees: assigneeNames },
    });
  };

  const logTaskStatusChange = (
    taskTitle: string, 
    taskId: string, 
    fromStatus: string, 
    toStatus: string
  ) => {
    return createUpdate.mutateAsync({
      updateType: 'status_change',
      content: `Changed task "${taskTitle}" status from ${fromStatus.replace('_', ' ')} to ${toStatus.replace('_', ' ')}`,
      taskId,
      metadata: { taskTitle, fromStatus, toStatus },
    });
  };

  const logTaskCompleted = (taskTitle: string, taskId: string) => {
    return createUpdate.mutateAsync({
      updateType: 'task_completed',
      content: `Completed task "${taskTitle}"`,
      taskId,
      metadata: { taskTitle },
      isImportant: true,
    });
  };

  const logTaskVerified = (taskTitle: string, taskId: string, approved: boolean) => {
    return createUpdate.mutateAsync({
      updateType: 'task_verified',
      content: approved 
        ? `Task "${taskTitle}" has been verified and approved` 
        : `Task "${taskTitle}" has been rejected`,
      taskId,
      metadata: { taskTitle, approved },
      isImportant: true,
    });
  };

  const logTimeLogged = (taskTitle: string, taskId: string, hours: number) => {
    return createUpdate.mutateAsync({
      updateType: 'time_logged',
      content: `Logged ${hours}h on task "${taskTitle}"`,
      taskId,
      metadata: { taskTitle, hours },
    });
  };

  const logLeaveRequest = (leaveType: string, startDate: string, endDate: string) => {
    return createUpdate.mutateAsync({
      updateType: 'leave_requested',
      content: `Requested ${leaveType} leave from ${startDate} to ${endDate}`,
      metadata: { leaveType, startDate, endDate },
    });
  };

  const logLeaveDecision = (
    employeeName: string, 
    approved: boolean, 
    leaveType: string
  ) => {
    return createUpdate.mutateAsync({
      updateType: approved ? 'leave_approved' : 'leave_rejected',
      content: approved 
        ? `Approved ${leaveType} leave request for ${employeeName}`
        : `Rejected ${leaveType} leave request for ${employeeName}`,
      metadata: { employeeName, leaveType, approved },
      isImportant: true,
    });
  };

  const logAttendance = (clockIn: boolean, location?: { lat: number; lng: number }) => {
    return createUpdate.mutateAsync({
      updateType: clockIn ? 'attendance_clock_in' : 'attendance_clock_out',
      content: clockIn ? 'Clocked in for the day' : 'Clocked out for the day',
      metadata: { location },
    });
  };

  return {
    createUpdate: createUpdate.mutate,
    createUpdateAsync: createUpdate.mutateAsync,
    isPending: createUpdate.isPending,
    // Helper methods
    logTaskCreated,
    logTaskStatusChange,
    logTaskCompleted,
    logTaskVerified,
    logTimeLogged,
    logLeaveRequest,
    logLeaveDecision,
    logAttendance,
  };
}
