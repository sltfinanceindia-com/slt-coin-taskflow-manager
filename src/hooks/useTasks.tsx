import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  created_by: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  slt_coin_value: number;
  start_date: string;
  end_date: string;
  submission_notes?: string;
  admin_feedback?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  assigned_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  creator_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function useTasks() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const emailNotifications = useEmailNotifications();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, email),
          creator_profile:profiles!tasks_created_by_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!profile,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title: string;
      description: string;
      assigned_to: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      slt_coin_value: number;
      start_date: string;
      end_date: string;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: profile?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Created",
        description: "Task has been successfully created and assigned.",
      });

      // Send email notification to assigned intern
      try {
        const { data: assignedProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', variables.assigned_to)
          .single();

        if (assignedProfile) {
          await emailNotifications.sendTaskAssignedEmail({
            to: assignedProfile.email,
            recipientName: assignedProfile.full_name,
            taskTitle: variables.title,
            taskId: data.id,
            assignerName: profile?.full_name || 'Admin',
          });
        }
      } catch (error) {
        console.error('Failed to send task assignment email:', error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error Creating Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ 
      taskId, 
      status, 
      submissionNotes 
    }: { 
      taskId: string; 
      status: 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected';
      submissionNotes?: string;
    }) => {
      const updateData: any = { status };
      if (submissionNotes) {
        updateData.submission_notes = submissionNotes;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.status === 'completed') {
        toast({
          title: "Task Completed",
          description: "Task marked as completed. Awaiting admin approval for SLT Coins.",
        });

        // Send email notification to admin
        try {
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('role', 'admin');

          if (adminProfiles && adminProfiles.length > 0) {
            for (const admin of adminProfiles) {
              await emailNotifications.sendTaskCompletedEmail({
                to: admin.email,
                recipientName: admin.full_name,
                taskTitle: data.title,
                taskId: data.id,
              });
            }
          }
        } catch (error) {
          console.error('Failed to send task completion email:', error);
        }
      } else if (variables.status === 'verified') {
        toast({
          title: "Task Verified",
          description: "Task has been approved and SLT Coins will be awarded.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error Updating Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyTaskMutation = useMutation({
    mutationFn: async ({ 
      taskId, 
      approve, 
      feedback,
      coinValue 
    }: { 
      taskId: string; 
      approve: boolean;
      feedback?: string;
      coinValue?: number;
    }) => {
      // Update task status
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .update({
          status: approve ? 'verified' : 'rejected',
          admin_feedback: feedback,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (taskError) throw taskError;

      // If approved, create coin transaction and update user's total coins
      if (approve && coinValue) {
        const { error: coinError } = await supabase
          .from('coin_transactions')
          .insert([{
            user_id: taskData.assigned_to,
            task_id: taskId,
            coins_earned: coinValue,
            status: 'approved'
          }]);

        if (coinError) throw coinError;

        // Update user's total coins
        const { error: updateError } = await supabase.rpc('increment_user_coins', {
          user_profile_id: taskData.assigned_to,
          coin_amount: coinValue
        });

        if (updateError) {
          console.error('Error updating coins:', updateError);
          throw updateError;
        }
      }

      return taskData;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] });
      toast({
        title: variables.approve ? "Task Approved" : "Task Rejected",
        description: variables.approve 
          ? "SLT Coins have been awarded to the intern."
          : "Task has been rejected with feedback.",
        variant: variables.approve ? "default" : "destructive",
      });

      // Send email notification for coin earning (if approved)
      if (variables.approve && variables.coinValue) {
        try {
          const { data: assignedProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', data.assigned_to)
            .single();

          if (assignedProfile) {
            await emailNotifications.sendCoinsEarnedEmail({
              to: assignedProfile.email,
              recipientName: assignedProfile.full_name,
              taskTitle: data.title,
              taskId: data.id,
              coinAmount: variables.coinValue,
            });
          }
        } catch (error) {
          console.error('Failed to send coins earned email:', error);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error Processing Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions that match the expected interface
  const updateTaskStatus = (taskId: string, status: Task['status'], submissionNotes?: string) => {
    updateTaskStatusMutation.mutate({ taskId, status, submissionNotes });
  };

  const verifyTask = (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => {
    verifyTaskMutation.mutate({ taskId, approve, feedback, coinValue });
  };

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTaskStatus,
    verifyTask,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskStatusMutation.isPending,
    isVerifying: verifyTaskMutation.isPending,
  };
}