import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// 360-Degree Feedback Hooks
export function useFeedbackCycles() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ['feedback-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_cycles')
        .select('*, created_by_profile:profiles!feedback_cycles_created_by_fkey(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createCycle = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      start_date: string;
      end_date: string;
      is_anonymous?: boolean;
    }) => {
      const { error } = await supabase.from('feedback_cycles').insert({
        ...data,
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-cycles'] });
      toast.success('Feedback cycle created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCycle = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; name?: string }) => {
      const { error } = await supabase.from('feedback_cycles').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-cycles'] });
      toast.success('Feedback cycle updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return { cycles, isLoading, createCycle, updateCycle };
}

export function useFeedbackRequests(cycleId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['feedback-requests', cycleId],
    queryFn: async () => {
      let query = supabase
        .from('feedback_requests')
        .select(`
          *,
          subject:profiles!feedback_requests_subject_id_fkey(id, full_name, avatar_url),
          reviewer:profiles!feedback_requests_reviewer_id_fkey(id, full_name, avatar_url),
          cycle:feedback_cycles(name)
        `)
        .order('created_at', { ascending: false });

      if (cycleId) query = query.eq('cycle_id', cycleId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createRequest = useMutation({
    mutationFn: async (data: {
      cycle_id: string;
      subject_id: string;
      reviewer_id: string;
      feedback_type: 'self' | 'manager' | 'peer' | 'subordinate';
      due_date?: string;
    }) => {
      const { error } = await supabase.from('feedback_requests').insert({
        ...data,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-requests'] });
      toast.success('Feedback request created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string }) => {
      const { error } = await supabase.from('feedback_requests').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-requests'] });
      toast.success('Request updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return { requests, isLoading, createRequest, updateRequest };
}

// OKR Hooks
export function useObjectives() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: objectives = [], isLoading } = useQuery({
    queryKey: ['objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select(`
          *,
          owner:profiles!objectives_owner_id_fkey(id, full_name, avatar_url),
          key_results(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createObjective = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      owner_id: string;
      level: 'company' | 'team' | 'individual';
      quarter?: string;
      year?: number;
      start_date?: string;
      end_date?: string;
      parent_id?: string;
    }) => {
      const { error } = await supabase.from('objectives').insert({
        ...data,
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objective created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateObjective = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; progress_percentage?: number }) => {
      const { error } = await supabase.from('objectives').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objective updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteObjective = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('objectives').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objective deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  return { objectives, isLoading, createObjective, updateObjective, deleteObjective };
}

export function useKeyResults(objectiveId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: keyResults = [], isLoading } = useQuery({
    queryKey: ['key-results', objectiveId],
    queryFn: async () => {
      let query = supabase
        .from('key_results')
        .select('*')
        .order('created_at', { ascending: true });

      if (objectiveId) query = query.eq('objective_id', objectiveId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createKeyResult = useMutation({
    mutationFn: async (data: {
      objective_id: string;
      title: string;
      description?: string;
      target_value: number;
      unit?: string;
      due_date?: string;
    }) => {
      const { error } = await supabase.from('key_results').insert({
        ...data,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Key result created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateKeyResult = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; current_value?: number; status?: string }) => {
      const { error } = await supabase.from('key_results').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Key result updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return { keyResults, isLoading, createKeyResult, updateKeyResult };
}

// One-on-One Meeting Hooks
export function useOneOnOneMeetings() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['one-on-one-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('one_on_one_meetings')
        .select(`
          *,
          manager:profiles!one_on_one_meetings_manager_id_fkey(id, full_name, avatar_url),
          employee:profiles!one_on_one_meetings_employee_id_fkey(id, full_name, avatar_url)
        `)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createMeeting = useMutation({
    mutationFn: async (data: {
      manager_id: string;
      employee_id: string;
      scheduled_at: string;
      duration_minutes?: number;
      is_recurring?: boolean;
      recurrence_pattern?: string;
      location?: string;
      meeting_url?: string;
    }) => {
      const { error } = await supabase.from('one_on_one_meetings').insert({
        ...data,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-on-one-meetings'] });
      toast.success('Meeting scheduled');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; scheduled_at?: string }) => {
      const { error } = await supabase.from('one_on_one_meetings').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-on-one-meetings'] });
      toast.success('Meeting updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return { meetings, isLoading, createMeeting, updateMeeting };
}

export function useMeetingDetails(meetingId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: agendaItems = [], isLoading: agendaLoading } = useQuery({
    queryKey: ['meeting-agenda', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .select('*, added_by_profile:profiles!meeting_agenda_items_added_by_fkey(full_name)')
        .eq('meeting_id', meetingId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !!meetingId,
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['meeting-notes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*, created_by_profile:profiles!meeting_notes_created_by_fkey(full_name)')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !!meetingId,
  });

  const { data: actionItems = [], isLoading: actionsLoading } = useQuery({
    queryKey: ['meeting-actions', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_action_items')
        .select('*, assigned_to_profile:profiles!meeting_action_items_assigned_to_fkey(full_name)')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !!meetingId,
  });

  const addAgendaItem = useMutation({
    mutationFn: async (data: { topic: string; description?: string; topic_type?: string }) => {
      const { error } = await supabase.from('meeting_agenda_items').insert({
        ...data,
        meeting_id: meetingId,
        added_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agenda', meetingId] });
      toast.success('Agenda item added');
    },
    onError: (error) => toast.error(error.message),
  });

  const addNote = useMutation({
    mutationFn: async (data: { content: string; is_private?: boolean }) => {
      const { error } = await supabase.from('meeting_notes').insert({
        ...data,
        meeting_id: meetingId,
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', meetingId] });
      toast.success('Note added');
    },
    onError: (error) => toast.error(error.message),
  });

  const addActionItem = useMutation({
    mutationFn: async (data: { title: string; description?: string; assigned_to: string; due_date?: string }) => {
      const { error } = await supabase.from('meeting_action_items').insert({
        ...data,
        meeting_id: meetingId,
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-actions', meetingId] });
      toast.success('Action item added');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    agendaItems,
    notes,
    actionItems,
    isLoading: agendaLoading || notesLoading || actionsLoading,
    addAgendaItem,
    addNote,
    addActionItem,
  };
}

// PIP Hooks
export function usePerformanceImprovementPlans() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: pips = [], isLoading } = useQuery({
    queryKey: ['pips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_improvement_plans')
        .select(`
          *,
          employee:profiles!performance_improvement_plans_employee_id_fkey(id, full_name, avatar_url),
          manager:profiles!performance_improvement_plans_manager_id_fkey(id, full_name, avatar_url),
          pip_goals(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createPIP = useMutation({
    mutationFn: async (data: {
      employee_id: string;
      manager_id: string;
      title: string;
      reason: string;
      start_date: string;
      end_date: string;
      hr_representative_id?: string;
    }) => {
      const { error } = await supabase.from('performance_improvement_plans').insert({
        ...data,
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pips'] });
      toast.success('PIP created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePIP = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; final_outcome?: string }) => {
      const { error } = await supabase.from('performance_improvement_plans').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pips'] });
      toast.success('PIP updated');
    },
    onError: (error) => toast.error(error.message),
  });

  return { pips, isLoading, createPIP, updatePIP };
}

export function usePIPDetails(pipId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['pip-goals', pipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pip_goals')
        .select('*')
        .eq('pip_id', pipId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !!pipId,
  });

  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ['pip-check-ins', pipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pip_check_ins')
        .select('*, created_by_profile:profiles!pip_check_ins_created_by_fkey(full_name)')
        .eq('pip_id', pipId)
        .order('check_in_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !!pipId,
  });

  const addGoal = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      success_criteria: string;
      target_date?: string;
    }) => {
      const { error } = await supabase.from('pip_goals').insert({
        ...data,
        pip_id: pipId,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pip-goals', pipId] });
      toast.success('Goal added');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; progress_notes?: string }) => {
      const { error } = await supabase.from('pip_goals').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pip-goals', pipId] });
      toast.success('Goal updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const addCheckIn = useMutation({
    mutationFn: async (data: {
      check_in_date: string;
      manager_notes?: string;
      employee_notes?: string;
      overall_progress?: string;
      next_steps?: string;
    }) => {
      const { error } = await supabase.from('pip_check_ins').insert({
        ...data,
        pip_id: pipId,
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pip-check-ins', pipId] });
      toast.success('Check-in added');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    goals,
    checkIns,
    isLoading: goalsLoading || checkInsLoading,
    addGoal,
    updateGoal,
    addCheckIn,
  };
}
