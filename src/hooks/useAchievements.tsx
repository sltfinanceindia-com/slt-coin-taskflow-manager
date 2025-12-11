import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  badge_color: string;
  category: string;
  criteria: Record<string, number>;
  points: number;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export function useAchievements() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Fetch user's earned achievements
  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery({
    queryKey: ['user-achievements', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as (UserAchievement & { achievement: Achievement })[];
    },
    enabled: !!profile?.id,
  });

  // Get achievements for a specific user (for profiles)
  const getUserAchievements = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  // Award achievement to user
  const awardAchievement = useMutation({
    mutationFn: async ({ userId, achievementId }: { userId: string; achievementId: string }) => {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });

  // Check if user has specific achievement
  const hasAchievement = (achievementId: string) => {
    return userAchievements?.some((ua) => ua.achievement_id === achievementId) || false;
  };

  // Get achievements by category
  const getAchievementsByCategory = (category: string) => {
    return achievements?.filter((a) => a.category === category) || [];
  };

  return {
    achievements: achievements || [],
    userAchievements: userAchievements || [],
    isLoading: achievementsLoading || userAchievementsLoading,
    awardAchievement,
    hasAchievement,
    getAchievementsByCategory,
    getUserAchievements,
  };
}
