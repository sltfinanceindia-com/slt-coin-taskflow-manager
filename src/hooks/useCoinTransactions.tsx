import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CoinTransaction {
  id: string;
  user_id: string;
  task_id: string;
  coins_earned: number;
  transaction_date: string;
  status: 'pending' | 'approved' | 'rejected';
  task?: {
    id: string;
    title: string;
  };
  user_profile?: {
    id: string;
    full_name: string;
  };
}

export function useCoinTransactions() {
  const { profile } = useAuth();

  const coinTransactionsQuery = useQuery({
    queryKey: ['coin-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select(`
          *,
          task:tasks(id, title),
          user_profile:profiles(id, full_name)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as CoinTransaction[];
    },
    enabled: !!profile,
  });

  const getUserTransactions = (userId?: string) => {
    const transactions = coinTransactionsQuery.data || [];
    const targetUserId = userId || profile?.id;
    return transactions.filter(t => t.user_id === targetUserId);
  };

  const getTotalEarned = (userId?: string) => {
    return getUserTransactions(userId)
      .filter(t => t.status === 'approved')
      .reduce((total, t) => total + t.coins_earned, 0);
  };

  const getPendingCoins = (userId?: string) => {
    return getUserTransactions(userId)
      .filter(t => t.status === 'pending')
      .reduce((total, t) => total + t.coins_earned, 0);
  };

  return {
    transactions: coinTransactionsQuery.data || [],
    isLoading: coinTransactionsQuery.isLoading,
    error: coinTransactionsQuery.error,
    getUserTransactions,
    getTotalEarned,
    getPendingCoins,
  };
}