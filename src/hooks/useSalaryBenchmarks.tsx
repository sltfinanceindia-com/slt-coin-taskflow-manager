import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SalaryBenchmark {
  id: string;
  organization_id: string | null;
  role: string;
  industry: string;
  region: string;
  internal_avg: number | null;
  market_25: number | null;
  market_50: number | null;
  market_75: number | null;
  status: 'above' | 'at' | 'below' | null;
  last_updated: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useSalaryBenchmarks() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const benchmarksQuery = useQuery({
    queryKey: ['salary-benchmarks', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('salary_benchmarks')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('role', { ascending: true });
      if (error) throw error;
      return data as SalaryBenchmark[];
    },
    enabled: !!profile?.organization_id,
  });

  const createBenchmark = useMutation({
    mutationFn: async (benchmark: Omit<SalaryBenchmark, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      const { data, error } = await supabase
        .from('salary_benchmarks')
        .insert({ ...benchmark, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-benchmarks'] });
      toast.success('Benchmark created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateBenchmark = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SalaryBenchmark> & { id: string }) => {
      const { data, error } = await supabase
        .from('salary_benchmarks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-benchmarks'] });
      toast.success('Benchmark updated successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteBenchmark = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salary_benchmarks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-benchmarks'] });
      toast.success('Benchmark deleted successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    benchmarks: benchmarksQuery.data || [],
    isLoading: benchmarksQuery.isLoading,
    error: benchmarksQuery.error,
    createBenchmark,
    updateBenchmark,
    deleteBenchmark,
  };
}
