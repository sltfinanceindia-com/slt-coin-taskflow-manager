import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  });

  return {
    rates: coinRatesQuery.data || [],
    latestRate: latestRateQuery.data,
    isLoading: coinRatesQuery.isLoading || latestRateQuery.isLoading,
    error: coinRatesQuery.error || latestRateQuery.error,
  };
}
