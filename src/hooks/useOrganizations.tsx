import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  subscription_status: 'active' | 'trialing' | 'canceled' | 'suspended' | null;
  max_users: number | null;
  created_at: string;
  updated_at: string;
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Organization[];
    },
  });
}

export function useOrganizationUserCounts() {
  return useQuery({
    queryKey: ['organization-user-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('is_active', true);

      if (error) throw error;

      // Count users per organization
      const counts: Record<string, number> = {};
      data?.forEach((profile) => {
        if (profile.organization_id) {
          counts[profile.organization_id] = (counts[profile.organization_id] || 0) + 1;
        }
      });
      return counts;
    },
  });
}
