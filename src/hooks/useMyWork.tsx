/**
 * My Work Hook
 * Aggregates all work items assigned to the current user
 * Includes: tasks, work requests, service tickets, approvals, meetings
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isThisWeek, isPast, addDays } from 'date-fns';

export type WorkItemType = 'task' | 'request' | 'ticket' | 'approval' | 'meeting';

export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  project?: { id: string; name: string };
  isOverdue: boolean;
  isToday: boolean;
  isThisWeek: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface MyWorkFilters {
  types?: WorkItemType[];
  period?: 'today' | 'this_week' | 'overdue' | 'all';
  priority?: string[];
  showBlocked?: boolean;
}

export function useMyWork(filters: MyWorkFilters = {}) {
  const { profile } = useAuth();

  const myWorkQuery = useQuery({
    queryKey: ['my-work', profile?.id, filters],
    queryFn: async (): Promise<WorkItem[]> => {
      if (!profile?.id) return [];

      const workItems: WorkItem[] = [];

      // Fetch tasks assigned to user
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id, title, description, status, priority, end_date, created_at, updated_at,
          project:projects(id, name)
        `)
        .eq('assigned_to', profile.id)
        .not('status', 'in', '("verified","completed")')
        .order('end_date', { ascending: true, nullsFirst: false });

      if (tasks) {
        tasks.forEach((task: any) => {
          const dueDate = task.end_date ? new Date(task.end_date) : null;
          workItems.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description || undefined,
            status: task.status,
            priority: task.priority || undefined,
            dueDate: task.end_date || undefined,
            project: task.project ? { id: task.project.id, name: task.project.name } : undefined,
            isOverdue: dueDate ? isPast(dueDate) && !isToday(dueDate) : false,
            isToday: dueDate ? isToday(dueDate) : false,
            isThisWeek: dueDate ? isThisWeek(dueDate) : false,
            isBlocked: task.status === 'blocked',
            createdAt: task.created_at,
            updatedAt: task.updated_at || undefined,
          });
        });
      }

      // Fetch work requests assigned to user
      const { data: requests } = await supabase
        .from('work_requests')
        .select(`
          id, title, description, status, priority, target_date, created_at, updated_at
        `)
        .eq('assigned_to', profile.id)
        .not('status', 'in', '("completed","rejected","cancelled")')
        .order('target_date', { ascending: true, nullsFirst: false });

      if (requests) {
        requests.forEach((request: any) => {
          const dueDate = request.target_date ? new Date(request.target_date) : null;
          workItems.push({
            id: request.id,
            type: 'request',
            title: request.title,
            description: request.description || undefined,
            status: request.status,
            priority: request.priority || undefined,
            dueDate: request.target_date || undefined,
            isOverdue: dueDate ? isPast(dueDate) && !isToday(dueDate) : false,
            isToday: dueDate ? isToday(dueDate) : false,
            isThisWeek: dueDate ? isThisWeek(dueDate) : false,
            isBlocked: false,
            createdAt: request.created_at,
            updatedAt: request.updated_at || undefined,
          });
        });
      }

      // Fetch service tickets assigned to user
      const { data: tickets } = await supabase
        .from('service_tickets')
        .select(`
          id, title, description, status, priority, sla_resolution_due, created_at, updated_at
        `)
        .eq('assignee_id', profile.id)
        .not('status', 'in', '("resolved","closed","cancelled")')
        .order('sla_resolution_due', { ascending: true, nullsFirst: false });

      if (tickets) {
        tickets.forEach((ticket: any) => {
          const dueDate = ticket.sla_resolution_due ? new Date(ticket.sla_resolution_due) : null;
          workItems.push({
            id: ticket.id,
            type: 'ticket',
            title: ticket.title,
            description: ticket.description || undefined,
            status: ticket.status,
            priority: ticket.priority || undefined,
            dueDate: ticket.sla_resolution_due || undefined,
            isOverdue: dueDate ? isPast(dueDate) && !isToday(dueDate) : false,
            isToday: dueDate ? isToday(dueDate) : false,
            isThisWeek: dueDate ? isThisWeek(dueDate) : false,
            isBlocked: ticket.status === 'pending',
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at || undefined,
          });
        });
      }

      // Fetch pending approvals for user
      const { data: approvals } = await supabase
        .from('approval_steps')
        .select(`
          id, status, created_at,
          instance:approval_instances(
            id, entity_type, entity_id, status, created_at,
            workflow:approval_workflows(name)
          )
        `)
        .eq('approver_id', profile.id)
        .eq('status', 'pending');

      if (approvals) {
        approvals.forEach((approval: any) => {
          const instance = approval.instance;
          if (instance) {
            workItems.push({
              id: approval.id,
              type: 'approval',
              title: `Approval: ${instance.workflow?.name || instance.entity_type}`,
              description: `${instance.entity_type} approval pending`,
              status: 'pending',
              priority: 'high',
              isOverdue: false,
              isToday: true,
              isThisWeek: true,
              isBlocked: false,
              createdAt: approval.created_at,
              metadata: {
                entityType: instance.entity_type,
                entityId: instance.entity_id,
                instanceId: instance.id,
              },
            });
          }
        });
      }

      // Fetch upcoming meetings
      const today = new Date();
      const weekEnd = addDays(today, 7);
      
      const { data: meetings } = await supabase
        .from('one_on_one_meetings')
        .select(`
          id, scheduled_date, status, notes, created_at, updated_at
        `)
        .or(`manager_id.eq.${profile.id},employee_id.eq.${profile.id}`)
        .gte('scheduled_date', format(today, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
        .neq('status', 'cancelled')
        .order('scheduled_date', { ascending: true });

      if (meetings) {
        meetings.forEach((meeting: any) => {
          const meetingDate = new Date(meeting.scheduled_date);
          workItems.push({
            id: meeting.id,
            type: 'meeting',
            title: '1:1 Meeting',
            description: meeting.notes || undefined,
            status: meeting.status,
            dueDate: meeting.scheduled_date,
            isOverdue: false,
            isToday: isToday(meetingDate),
            isThisWeek: isThisWeek(meetingDate),
            isBlocked: false,
            createdAt: meeting.created_at,
            updatedAt: meeting.updated_at || undefined,
          });
        });
      }

      // Apply filters
      let filteredItems = workItems;

      if (filters.types && filters.types.length > 0) {
        filteredItems = filteredItems.filter(item => filters.types!.includes(item.type));
      }

      if (filters.period) {
        switch (filters.period) {
          case 'today':
            filteredItems = filteredItems.filter(item => item.isToday);
            break;
          case 'this_week':
            filteredItems = filteredItems.filter(item => item.isThisWeek);
            break;
          case 'overdue':
            filteredItems = filteredItems.filter(item => item.isOverdue);
            break;
        }
      }

      if (filters.priority && filters.priority.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.priority && filters.priority!.includes(item.priority)
        );
      }

      if (filters.showBlocked) {
        filteredItems = filteredItems.filter(item => item.isBlocked);
      }

      // Sort by priority and due date
      return filteredItems.sort((a, b) => {
        // Overdue items first
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        
        // Today items next
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        
        // Then by priority
        const priorityOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5;
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Finally by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
    },
    enabled: !!profile?.id,
    staleTime: 30000,
  });

  // Compute summary stats
  const summary = {
    total: myWorkQuery.data?.length || 0,
    overdue: myWorkQuery.data?.filter(item => item.isOverdue).length || 0,
    today: myWorkQuery.data?.filter(item => item.isToday).length || 0,
    thisWeek: myWorkQuery.data?.filter(item => item.isThisWeek).length || 0,
    blocked: myWorkQuery.data?.filter(item => item.isBlocked).length || 0,
    byType: {
      task: myWorkQuery.data?.filter(item => item.type === 'task').length || 0,
      request: myWorkQuery.data?.filter(item => item.type === 'request').length || 0,
      ticket: myWorkQuery.data?.filter(item => item.type === 'ticket').length || 0,
      approval: myWorkQuery.data?.filter(item => item.type === 'approval').length || 0,
      meeting: myWorkQuery.data?.filter(item => item.type === 'meeting').length || 0,
    },
  };

  return {
    items: myWorkQuery.data || [],
    summary,
    isLoading: myWorkQuery.isLoading,
    error: myWorkQuery.error,
    refetch: myWorkQuery.refetch,
  };
}
