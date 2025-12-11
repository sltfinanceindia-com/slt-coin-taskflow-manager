import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type LeaderboardPeriod = 'week' | 'month' | 'all';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  total_coins: number;
  tasks_completed: number;
  rank: number;
}

export function useLeaderboard(period: LeaderboardPeriod = 'all') {
  const { profile } = useAuth();

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', profile?.organization_id, period],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .rpc('get_leaderboard', {
          p_org_id: profile.organization_id,
          p_period: period
        });

      if (error) throw error;
      return (data as LeaderboardEntry[]) || [];
    },
    enabled: !!profile?.organization_id,
  });

  const currentUserRank = leaderboard?.find(
    (entry) => entry.user_id === profile?.id
  );

  return {
    leaderboard: leaderboard || [],
    currentUserRank,
    isLoading,
    error,
  };
}
