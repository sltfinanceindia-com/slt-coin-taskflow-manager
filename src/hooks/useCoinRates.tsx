import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface CoinRate {
  id: string;
  rate: number;
  rate_date: string;
  change_percentage: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useCoinRates() {
  const queryClient = useQueryClient();
  
  const coinRatesQuery = useQuery({
    queryKey: ['coin-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_rates')
        .select('*')
        .order('rate_date', { ascending: false });

      if (error) throw error;
      return data as CoinRate[];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const latestRateQuery = useQuery({
    queryKey: ['latest-coin-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_rates')
        .select('*')
        .order('rate_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as CoinRate;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscription for coin rate changes
  useEffect(() => {
    const channel = supabase
      .channel('coin-rates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coin_rates'
        },
        (payload) => {
          console.log('🔄 Coin rate changed:', payload);
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['coin-rates'] });
          queryClient.invalidateQueries({ queryKey: ['latest-coin-rate'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    rates: coinRatesQuery.data || [],
    latestRate: latestRateQuery.data,
    isLoading: coinRatesQuery.isLoading || latestRateQuery.isLoading,
    error: coinRatesQuery.error || latestRateQuery.error,
  };
}
