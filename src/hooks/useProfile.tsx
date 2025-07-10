import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProfileStats {
  totalTasks: number;
  completedTasks: number;
  totalCoins: number;
  weeklyHours: number;
  monthlyHours: number;
  examStats: {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    passedExams: number;
  };
}

export function useProfile(userId?: string) {
  const { profile: currentProfile } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', userId || currentProfile?.id],
    queryFn: async () => {
      const targetId = userId || currentProfile?.id;
      if (!targetId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!(userId || currentProfile?.id),
  });

  const profileStatsQuery = useQuery({
    queryKey: ['profile-stats', userId || currentProfile?.id],
    queryFn: async () => {
      const targetId = userId || currentProfile?.id;
      if (!targetId) return null;

      // Get task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('assigned_to', targetId);

      // Get coin stats
      const { data: coinTransactions } = await supabase
        .from('coin_transactions')
        .select('coins_earned')
        .eq('user_id', targetId)
        .eq('status', 'approved');

      // Get time logs for weekly/monthly hours
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('hours_worked, date_logged')
        .eq('user_id', targetId);

      // Get exam stats
      const { data: examAttempts } = await supabase
        .from('ui_ux_exam_attempts')
        .select('score, total_questions, is_passed, completed_at')
        .eq('user_id', targetId);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed' || t.status === 'verified').length || 0;
      const totalCoins = coinTransactions?.reduce((sum, t) => sum + t.coins_earned, 0) || 0;

      // Calculate weekly and monthly hours
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyHours = timeLogs?.filter(log => 
        new Date(log.date_logged) >= oneWeekAgo
      ).reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0;

      const monthlyHours = timeLogs?.filter(log => 
        new Date(log.date_logged) >= oneMonthAgo
      ).reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0;

      // Calculate exam stats
      const completedExamAttempts = examAttempts?.filter(attempt => attempt.completed_at) || [];
      const totalExams = completedExamAttempts.length;
      const passedExams = completedExamAttempts.filter(attempt => attempt.is_passed).length;
      const averageScore = totalExams > 0 
        ? completedExamAttempts.reduce((sum, attempt) => {
            return sum + (attempt.score / attempt.total_questions * 100);
          }, 0) / totalExams
        : 0;

      return {
        totalTasks,
        completedTasks,
        totalCoins,
        weeklyHours,
        monthlyHours,
        examStats: {
          totalExams,
          completedExams: totalExams,
          averageScore: Math.round(averageScore),
          passedExams
        }
      } as ProfileStats;
    },
    enabled: !!(userId || currentProfile?.id),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<any>) => {
      const targetId = userId || currentProfile?.id;
      if (!targetId) throw new Error('No profile ID available');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', targetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const targetId = userId || currentProfile?.id;
      if (!targetId) throw new Error('No profile ID available');

      const fileExt = file.name.split('.').pop();
      const fileName = `${targetId}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', targetId);

      if (updateError) throw updateError;

      return data.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Uploading Avatar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    profile: profileQuery.data,
    stats: profileStatsQuery.data,
    isLoading: profileQuery.isLoading || profileStatsQuery.isLoading,
    error: profileQuery.error || profileStatsQuery.error,
    updateProfile: updateProfileMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
