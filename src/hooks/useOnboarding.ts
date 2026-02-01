import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface OnboardingTask {
  id: string;
  onboarding_id: string;
  name: string;
  category: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  task_order: number;
  organization_id: string | null;
  created_at: string;
}

export interface OnboardingRecord {
  id: string;
  employee_id: string;
  start_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  buddy_id: string | null;
  notes: string | null;
  organization_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  tasks?: OnboardingTask[];
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    department: string | null;
  };
  buddy?: {
    id: string;
    full_name: string;
  } | null;
}

const DEFAULT_ONBOARDING_TASKS = [
  { name: 'Complete employment documents', category: 'Documentation', task_order: 1 },
  { name: 'ID card generation', category: 'Documentation', task_order: 2 },
  { name: 'Setup email account', category: 'IT Setup', task_order: 3 },
  { name: 'Laptop/workstation setup', category: 'IT Setup', task_order: 4 },
  { name: 'Access card/biometric enrollment', category: 'Access', task_order: 5 },
  { name: 'System access provisioning', category: 'Access', task_order: 6 },
  { name: 'Introduction to team', category: 'Orientation', task_order: 7 },
  { name: 'Company policies walkthrough', category: 'Orientation', task_order: 8 },
  { name: 'Buddy assignment meeting', category: 'Orientation', task_order: 9 },
  { name: 'First week training schedule', category: 'Training', task_order: 10 },
];

export function useOnboarding() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch onboarding records with employee and buddy info
  const { data: onboardingRecords, isLoading, error } = useQuery({
    queryKey: ['onboarding-records', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_records')
        .select(`
          *,
          employee:profiles!onboarding_records_employee_id_fkey(id, full_name, email, avatar_url, department),
          buddy:profiles!onboarding_records_buddy_id_fkey(id, full_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch tasks for each record
      const recordIds = data?.map(r => r.id) || [];
      if (recordIds.length > 0) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('onboarding_tasks')
          .select('*')
          .in('onboarding_id', recordIds)
          .order('task_order');

        if (tasksError) throw tasksError;

        // Map tasks to records
        return data?.map(record => ({
          ...record,
          tasks: tasksData?.filter(t => t.onboarding_id === record.id) || [],
        })) as OnboardingRecord[];
      }

      return data as OnboardingRecord[];
    },
    enabled: !!profile?.organization_id,
  });

  // Create onboarding record with default tasks
  const createOnboarding = useMutation({
    mutationFn: async (input: {
      employee_id: string;
      start_date: string;
      buddy_id?: string;
      notes?: string;
    }) => {
      // Create the onboarding record
      const { data: record, error: recordError } = await supabase
        .from('onboarding_records')
        .insert({
          employee_id: input.employee_id,
          start_date: input.start_date,
          buddy_id: input.buddy_id || null,
          notes: input.notes || null,
          status: 'in_progress',
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Create default tasks
      const tasks = DEFAULT_ONBOARDING_TASKS.map(task => ({
        onboarding_id: record.id,
        name: task.name,
        category: task.category,
        task_order: task.task_order,
        is_completed: false,
        organization_id: profile?.organization_id,
      }));

      const { error: tasksError } = await supabase
        .from('onboarding_tasks')
        .insert(tasks);

      if (tasksError) throw tasksError;

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-records'] });
      toast({ title: 'Onboarding initiated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating onboarding', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle task completion
  const toggleTask = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      const { error } = await supabase
        .from('onboarding_tasks')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? profile?.id : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      // Check if all tasks are completed and update record status
      const { data: task } = await supabase
        .from('onboarding_tasks')
        .select('onboarding_id')
        .eq('id', taskId)
        .single();

      if (task) {
        const { data: tasks } = await supabase
          .from('onboarding_tasks')
          .select('is_completed')
          .eq('onboarding_id', task.onboarding_id);

        const allCompleted = tasks?.every(t => t.is_completed);
        
        if (allCompleted) {
          await supabase
            .from('onboarding_records')
            .update({ status: 'completed' })
            .eq('id', task.onboarding_id);
        } else {
          await supabase
            .from('onboarding_records')
            .update({ status: 'in_progress' })
            .eq('id', task.onboarding_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-records'] });
    },
    onError: (error) => {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    },
  });

  // Update onboarding record
  const updateOnboarding = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OnboardingRecord> & { id: string }) => {
      const { error } = await supabase
        .from('onboarding_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-records'] });
      toast({ title: 'Onboarding updated' });
    },
  });

  // Delete onboarding record
  const deleteOnboarding = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('onboarding_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-records'] });
      toast({ title: 'Onboarding record deleted' });
    },
  });

  return {
    onboardingRecords: onboardingRecords || [],
    isLoading,
    error,
    createOnboarding,
    toggleTask,
    updateOnboarding,
    deleteOnboarding,
  };
}
