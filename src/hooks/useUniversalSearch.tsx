import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SearchResultType = 
  | 'task' 
  | 'project' 
  | 'employee' 
  | 'message' 
  | 'channel' 
  | 'activity' 
  | 'leave' 
  | 'timelog' 
  | 'request';

export interface UniversalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  url?: string;
}

export interface SearchResultGroup {
  type: SearchResultType;
  label: string;
  results: UniversalSearchResult[];
}

export const useUniversalSearch = () => {
  const { profile } = useAuth();
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const searchTasks = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          task_number,
          title,
          description,
          status,
          priority,
          assigned_to,
          project_id,
          created_at,
          assigned_profile:profiles!tasks_assigned_to_fkey(full_name),
          project:projects!tasks_project_id_fkey(name)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,task_number.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map(task => {
        const assignedProfile = task.assigned_profile as unknown as { full_name: string } | null;
        const projectData = task.project as unknown as { name: string } | null;
        return {
          id: task.id,
          type: 'task' as const,
          title: task.title,
          subtitle: task.task_number ? `#${task.task_number}` : undefined,
          description: `${task.status} • ${task.priority} priority${projectData?.name ? ` • ${projectData.name}` : ''}`,
          metadata: { 
            status: task.status, 
            priority: task.priority,
            assignee: assignedProfile?.full_name,
            project: projectData?.name
          },
          created_at: task.created_at,
          url: `?tab=tasks&task=${task.id}`
        };
      });
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  };

  const searchProjects = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          creator_profile:profiles!projects_created_by_fkey(full_name)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map(project => {
        const creator = project.creator_profile as unknown as { full_name: string } | null;
        return {
          id: project.id,
          type: 'project' as const,
          title: project.name,
          subtitle: `PRJ-${project.id.slice(0, 8).toUpperCase()}`,
          description: `${project.status} • Created by ${creator?.full_name || 'Unknown'}`,
          metadata: { status: project.status },
          created_at: project.created_at,
          url: `?tab=projects&project=${project.id}`
        };
      });
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  };

  const searchEmployees = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      // Search with flexible matching - handle partial names and different formats
      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, avatar_url, employee_id')
        .eq('is_active', true)
        .limit(50); // Get more results to filter client-side

      if (error) throw error;

      // Filter results that match any of the search terms
      const filteredData = (data || []).filter(emp => {
        const searchableText = [
          emp.full_name || '',
          emp.email || '',
          emp.department || '',
          emp.employee_id || ''
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      }).slice(0, 10);

      return filteredData.map(emp => ({
        id: emp.id,
        type: 'employee' as const,
        title: emp.full_name || 'Unknown',
        subtitle: emp.email,
        description: `${emp.role || 'Employee'}${emp.department ? ` • ${emp.department}` : ''}`,
        metadata: { role: emp.role, avatar: emp.avatar_url },
        url: `?tab=interns&employee=${emp.id}`
      }));
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  };

  const searchMessages = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          channel_id,
          sender:profiles!messages_sender_id_fkey(full_name),
          channel:communication_channels!messages_channel_id_fkey(name)
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(msg => {
        const sender = msg.sender as unknown as { full_name: string } | null;
        const channel = msg.channel as unknown as { name: string } | null;
        return {
          id: msg.id,
          type: 'message' as const,
          title: msg.content?.slice(0, 100) || 'Message',
          subtitle: `From ${sender?.full_name || 'Unknown'}`,
          description: channel?.name ? `in #${channel.name}` : 'Direct message',
          metadata: { channel_id: msg.channel_id },
          created_at: msg.created_at,
          url: `?tab=communication&channel=${msg.channel_id}`
        };
      });
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };

  const searchChannels = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select('id, name, description, type, member_count')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map(channel => ({
        id: channel.id,
        type: 'channel' as const,
        title: `#${channel.name}`,
        description: channel.description || `${channel.type} channel • ${channel.member_count || 0} members`,
        metadata: { type: channel.type },
        url: `?tab=communication&channel=${channel.id}`
      }));
    } catch (error) {
      console.error('Error searching channels:', error);
      return [];
    }
  };

  const searchLeaveRequests = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          status,
          reason,
          created_at,
          employee:profiles!leave_requests_employee_id_fkey(full_name)
        `)
        .ilike('reason', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(leave => {
        const employee = leave.employee as unknown as { full_name: string } | null;
        return {
          id: leave.id,
          type: 'leave' as const,
          title: 'Leave Request',
          subtitle: employee?.full_name || undefined,
          description: `${leave.start_date} to ${leave.end_date} • ${leave.status}`,
          metadata: { status: leave.status },
          created_at: leave.created_at,
          url: `?tab=leave`
        };
      });
    } catch (error) {
      console.error('Error searching leave requests:', error);
      return [];
    }
  };

  const searchTimeLogs = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select(`
          id,
          description,
          hours_worked,
          date_logged,
          created_at,
          user_profile:profiles!time_logs_user_id_fkey(full_name),
          task:tasks!time_logs_task_id_fkey(title)
        `)
        .ilike('description', `%${query}%`)
        .order('date_logged', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(log => {
        const userProfile = log.user_profile as unknown as { full_name: string } | null;
        const task = log.task as unknown as { title: string } | null;
        return {
          id: log.id,
          type: 'timelog' as const,
          title: task?.title || log.description || 'Time Log',
          subtitle: `${log.hours_worked}h on ${log.date_logged}`,
          description: `By ${userProfile?.full_name || 'Unknown'}`,
          created_at: log.created_at,
          url: `?tab=time`
        };
      });
    } catch (error) {
      console.error('Error searching time logs:', error);
      return [];
    }
  };

  const searchWorkRequests = async (query: string): Promise<UniversalSearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('work_requests')
        .select(`
          id,
          request_number,
          title,
          description,
          status,
          priority,
          created_at,
          requester:profiles!work_requests_requested_by_fkey(full_name)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,request_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(req => {
        const requester = req.requester as unknown as { full_name: string } | null;
        return {
          id: req.id,
          type: 'request' as const,
          title: req.title,
          subtitle: req.request_number,
          description: `${req.status} • ${req.priority} • By ${requester?.full_name || 'Unknown'}`,
          metadata: { status: req.status, priority: req.priority },
          created_at: req.created_at,
          url: `?tab=requests`
        };
      });
    } catch (error) {
      console.error('Error searching work requests:', error);
      return [];
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || !profile) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [
        taskResults,
        projectResults,
        employeeResults,
        messageResults,
        channelResults,
        leaveResults,
        timelogResults,
        requestResults
      ] = await Promise.all([
        searchTasks(query),
        searchProjects(query),
        searchEmployees(query),
        searchMessages(query),
        searchChannels(query),
        searchLeaveRequests(query),
        searchTimeLogs(query),
        searchWorkRequests(query)
      ]);

      const groups: SearchResultGroup[] = [];

      if (taskResults.length > 0) {
        groups.push({ type: 'task', label: 'Tasks', results: taskResults });
      }
      if (projectResults.length > 0) {
        groups.push({ type: 'project', label: 'Projects', results: projectResults });
      }
      if (employeeResults.length > 0) {
        groups.push({ type: 'employee', label: 'People', results: employeeResults });
      }
      if (messageResults.length > 0) {
        groups.push({ type: 'message', label: 'Messages', results: messageResults });
      }
      if (channelResults.length > 0) {
        groups.push({ type: 'channel', label: 'Channels', results: channelResults });
      }
      if (leaveResults.length > 0) {
        groups.push({ type: 'leave', label: 'Leave Requests', results: leaveResults });
      }
      if (timelogResults.length > 0) {
        groups.push({ type: 'timelog', label: 'Time Logs', results: timelogResults });
      }
      if (requestResults.length > 0) {
        groups.push({ type: 'request', label: 'Work Requests', results: requestResults });
      }

      setResults(groups);
    } catch (error) {
      console.error('Error performing universal search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    loading,
    performSearch,
    clearResults
  };
};
