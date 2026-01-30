/**
 * Service Desk Hook
 * Manages service tickets with SLA tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { differenceInHours, differenceInMinutes, isPast } from 'date-fns';

export type TicketType = 'incident' | 'request' | 'change' | 'problem';
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export interface ServiceTicket {
  id: string;
  ticket_number: string;
  ticket_type: TicketType;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  requester_id?: string;
  assignee_id?: string;
  sla_response_due?: string;
  sla_resolution_due?: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  category?: string;
  subcategory?: string;
  is_major_incident: boolean;
  root_cause?: string;
  resolution_notes?: string;
  satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  assignee?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  slaStatus?: {
    responseBreached: boolean;
    resolutionBreached: boolean;
    responseTimeRemaining?: string;
    resolutionTimeRemaining?: string;
  };
}

export interface CreateTicketData {
  ticket_type: TicketType;
  title: string;
  description?: string;
  priority: TicketPriority;
  category?: string;
  subcategory?: string;
  assignee_id?: string;
  is_major_incident?: boolean;
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  id: string;
  status?: TicketStatus;
  root_cause?: string;
  resolution_notes?: string;
  satisfaction_rating?: number;
}

function calculateSlaStatus(ticket: ServiceTicket) {
  const now = new Date();
  
  const responseBreached = ticket.sla_response_due && 
    !ticket.first_response_at && 
    isPast(new Date(ticket.sla_response_due));
  
  const resolutionBreached = ticket.sla_resolution_due && 
    !ticket.resolved_at && 
    isPast(new Date(ticket.sla_resolution_due));

  let responseTimeRemaining: string | undefined;
  let resolutionTimeRemaining: string | undefined;

  if (ticket.sla_response_due && !ticket.first_response_at) {
    const responseDue = new Date(ticket.sla_response_due);
    const hours = differenceInHours(responseDue, now);
    const minutes = differenceInMinutes(responseDue, now) % 60;
    responseTimeRemaining = hours >= 0 
      ? `${hours}h ${Math.abs(minutes)}m`
      : `Breached by ${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  }

  if (ticket.sla_resolution_due && !ticket.resolved_at) {
    const resolutionDue = new Date(ticket.sla_resolution_due);
    const hours = differenceInHours(resolutionDue, now);
    const minutes = differenceInMinutes(resolutionDue, now) % 60;
    resolutionTimeRemaining = hours >= 0 
      ? `${hours}h ${Math.abs(minutes)}m`
      : `Breached by ${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  }

  return {
    responseBreached: !!responseBreached,
    resolutionBreached: !!resolutionBreached,
    responseTimeRemaining,
    resolutionTimeRemaining,
  };
}

export function useServiceDesk(filters?: {
  status?: TicketStatus[];
  type?: TicketType[];
  priority?: TicketPriority[];
  assigneeId?: string;
  requesterId?: string;
}) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const ticketsQuery = useQuery({
    queryKey: ['service-tickets', profile?.organization_id, filters],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('service_tickets')
        .select(`
          *,
          requester:profiles!service_tickets_requester_id_fkey(id, full_name, avatar_url),
          assignee:profiles!service_tickets_assignee_id_fkey(id, full_name, avatar_url)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters?.type && filters.type.length > 0) {
        query = query.in('ticket_type', filters.type);
      }
      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId);
      }
      if (filters?.requesterId) {
        query = query.eq('requester_id', filters.requesterId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(ticket => ({
        ...ticket,
        slaStatus: calculateSlaStatus(ticket as ServiceTicket),
      })) as ServiceTicket[];
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketData) => {
      const { data: result, error } = await supabase
        .from('service_tickets')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          requester_id: profile?.id,
          ticket_number: '', // Will be auto-generated by trigger
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-work'] });
      toast.success('Ticket created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create ticket: ' + error.message);
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateTicketData) => {
      const updateData: Record<string, unknown> = { ...data };
      
      // Set timestamps based on status changes
      if (data.status === 'in_progress' && !updateData.first_response_at) {
        updateData.first_response_at = new Date().toISOString();
      }
      if (data.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
      if (data.status === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from('service_tickets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-work'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update ticket: ' + error.message);
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      toast.success('Ticket deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete ticket: ' + error.message);
    },
  });

  // Get ticket metrics
  const metrics = {
    total: ticketsQuery.data?.length || 0,
    open: ticketsQuery.data?.filter(t => t.status === 'open').length || 0,
    inProgress: ticketsQuery.data?.filter(t => t.status === 'in_progress').length || 0,
    pending: ticketsQuery.data?.filter(t => t.status === 'pending').length || 0,
    resolved: ticketsQuery.data?.filter(t => t.status === 'resolved').length || 0,
    slaBreached: ticketsQuery.data?.filter(t => 
      t.slaStatus?.responseBreached || t.slaStatus?.resolutionBreached
    ).length || 0,
    majorIncidents: ticketsQuery.data?.filter(t => t.is_major_incident).length || 0,
    byPriority: {
      critical: ticketsQuery.data?.filter(t => t.priority === 'critical').length || 0,
      urgent: ticketsQuery.data?.filter(t => t.priority === 'urgent').length || 0,
      high: ticketsQuery.data?.filter(t => t.priority === 'high').length || 0,
      medium: ticketsQuery.data?.filter(t => t.priority === 'medium').length || 0,
      low: ticketsQuery.data?.filter(t => t.priority === 'low').length || 0,
    },
  };

  return {
    tickets: ticketsQuery.data || [],
    metrics,
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    createTicket: createTicketMutation.mutate,
    updateTicket: updateTicketMutation.mutate,
    deleteTicket: deleteTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    isUpdating: updateTicketMutation.isPending,
    isDeleting: deleteTicketMutation.isPending,
    refetch: ticketsQuery.refetch,
  };
}

// Hook for SLA Rules management
export function useSlaRules() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const slaRulesQuery = useQuery({
    queryKey: ['sla-rules', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('sla_rules')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('ticket_type', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const createSlaRuleMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      ticket_type: TicketType;
      priority: TicketPriority;
      response_hours: number;
      resolution_hours: number;
    }) => {
      const { data: result, error } = await supabase
        .from('sla_rules')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-rules'] });
      toast.success('SLA rule created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create SLA rule: ' + error.message);
    },
  });

  return {
    slaRules: slaRulesQuery.data || [],
    isLoading: slaRulesQuery.isLoading,
    createSlaRule: createSlaRuleMutation.mutate,
    isCreating: createSlaRuleMutation.isPending,
  };
}
