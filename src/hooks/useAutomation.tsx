import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean;
}

export interface AutomationAction {
  type: 'notify' | 'assign' | 'update_field' | 'create_task' | 'send_email' | 'add_comment';
  config: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  priority: number;
  run_count: number;
  last_run_at: string | null;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    full_name: string;
  };
}

export interface AutomationLog {
  id: string;
  rule_id: string;
  trigger_data: Record<string, unknown>;
  actions_executed: Record<string, unknown>[];
  status: string;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
  rule?: {
    name: string;
  };
}

export const TRIGGER_EVENTS = [
  { value: 'task_created', label: 'Task Created', description: 'When a new task is created' },
  { value: 'task_status_changed', label: 'Task Status Changed', description: 'When task status is updated' },
  { value: 'task_assigned', label: 'Task Assigned', description: 'When a task is assigned to someone' },
  { value: 'task_due_approaching', label: 'Due Date Approaching', description: 'When task due date is within X days' },
  { value: 'task_overdue', label: 'Task Overdue', description: 'When a task passes its due date' },
  { value: 'task_completed', label: 'Task Completed', description: 'When a task is marked complete' },
  { value: 'file_uploaded', label: 'File Uploaded', description: 'When a file is uploaded' },
  { value: 'comment_added', label: 'Comment Added', description: 'When a comment is added' },
] as const;

export const CONDITION_FIELDS = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assigned_to', label: 'Assigned To' },
  { value: 'project_id', label: 'Project' },
  { value: 'coin_value', label: 'Coin Value' },
  { value: 'due_days', label: 'Days Until Due' },
] as const;

export const ACTION_TYPES = [
  { value: 'notify', label: 'Send Notification', icon: 'Bell' },
  { value: 'assign', label: 'Assign Task', icon: 'UserPlus' },
  { value: 'update_field', label: 'Update Field', icon: 'Edit' },
  { value: 'create_task', label: 'Create Task', icon: 'Plus' },
  { value: 'add_comment', label: 'Add Comment', icon: 'MessageSquare' },
] as const;

export const useAutomation = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select(`
          *,
          creator:profiles!automation_rules_created_by_fkey(full_name)
        `)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        conditions: (item.conditions || []) as unknown as AutomationCondition[],
        actions: (item.actions || []) as unknown as AutomationAction[],
      })) as AutomationRule[];
    },
    enabled: !!profile,
  });

  const createRule = useMutation({
    mutationFn: async (rule: {
      name: string;
      description?: string;
      trigger_event: string;
      conditions: AutomationCondition[];
      actions: AutomationAction[];
      priority?: number;
    }) => {
      if (!profile) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          trigger_event: rule.trigger_event,
          conditions: rule.conditions as unknown as Record<string, unknown>,
          actions: rule.actions as unknown as Record<string, unknown>,
          priority: rule.priority,
          created_by: profile.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({ title: 'Automation rule created' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create automation rule',
        variant: 'destructive',
      });
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, conditions, actions, ...updates }: Partial<AutomationRule> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (conditions) updateData.conditions = conditions as unknown as Record<string, unknown>;
      if (actions) updateData.actions = actions as unknown as Record<string, unknown>;
      
      const { data, error } = await supabase
        .from('automation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({ title: 'Automation rule updated' });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({ title: 'Automation rule deleted' });
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
};

export const useAutomationLogs = (ruleId?: string) => {
  const { profile } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['automation-logs', ruleId],
    queryFn: async () => {
      let query = supabase
        .from('automation_logs')
        .select(`
          *,
          rule:automation_rules(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (ruleId) {
        query = query.eq('rule_id', ruleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AutomationLog[];
    },
    enabled: !!profile,
  });

  return {
    logs,
    isLoading,
  };
};

// Pre-built automation templates
export const AUTOMATION_TEMPLATES = [
  {
    id: 'overdue-notify-manager',
    name: 'Notify Manager on Overdue Task',
    description: 'Send notification to manager when a task becomes overdue',
    category: 'Notifications',
    trigger_event: 'task_overdue',
    conditions: [],
    actions: [
      {
        type: 'notify' as const,
        config: {
          recipient: 'manager',
          message: 'Task "{task.title}" is now overdue',
        },
      },
    ],
  },
  {
    id: 'high-priority-assign',
    name: 'Auto-assign High Priority Tasks',
    description: 'Automatically assign high priority tasks to senior team member',
    category: 'Assignments',
    trigger_event: 'task_created',
    conditions: [
      { field: 'priority', operator: 'equals' as const, value: 'high' },
    ],
    actions: [
      {
        type: 'notify' as const,
        config: {
          recipient: 'admins',
          message: 'New high priority task created: "{task.title}"',
        },
      },
    ],
  },
  {
    id: 'task-completion-notify',
    name: 'Notify on Task Completion',
    description: 'Send notification when a task is completed',
    category: 'Notifications',
    trigger_event: 'task_completed',
    conditions: [],
    actions: [
      {
        type: 'notify' as const,
        config: {
          recipient: 'creator',
          message: 'Task "{task.title}" has been completed',
        },
      },
    ],
  },
  {
    id: 'due-date-reminder',
    name: 'Due Date Reminder',
    description: 'Remind assignee when task is due in 1 day',
    category: 'Reminders',
    trigger_event: 'task_due_approaching',
    conditions: [
      { field: 'due_days', operator: 'equals' as const, value: 1 },
    ],
    actions: [
      {
        type: 'notify' as const,
        config: {
          recipient: 'assignee',
          message: 'Task "{task.title}" is due tomorrow!',
        },
      },
    ],
  },
  {
    id: 'escalate-overdue',
    name: 'Escalate Overdue Tasks',
    description: 'Update priority to high when task is overdue',
    category: 'Escalations',
    trigger_event: 'task_overdue',
    conditions: [
      { field: 'priority', operator: 'not_equals' as const, value: 'high' },
    ],
    actions: [
      {
        type: 'update_field' as const,
        config: {
          field: 'priority',
          value: 'high',
        },
      },
      {
        type: 'add_comment' as const,
        config: {
          content: '⚠️ This task has been automatically escalated to high priority due to being overdue.',
        },
      },
    ],
  },
];
