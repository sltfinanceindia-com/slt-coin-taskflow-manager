import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  type: 'employees' | 'attendance' | 'leaves' | 'salaries' | 'departments';
  status: 'completed' | 'failed' | 'processing';
  recordsProcessed: number;
  recordsFailed: number;
  createdAt: string;
}

export function useImportHistory() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['import-history', profile?.organization_id],
    queryFn: async (): Promise<ImportHistoryItem[]> => {
      // Return empty array - no import history table exists yet
      // When a table is created, this can be updated to fetch real data
      return [];
    },
    enabled: !!profile?.organization_id,
  });
}
