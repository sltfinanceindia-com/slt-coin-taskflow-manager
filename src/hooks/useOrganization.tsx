import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from './useAuth';
export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  slug: string | null;
  logo_url: string | null;
  description: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  subscription_plan_id: string | null;
  max_users: number;
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  billing_email: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  coin_name: string | null;
  coin_rate: number | null;
  two_fa_policy: string | null;
  subscription_plan?: {
    name: string;
    code: string;
    max_users: number;
    features: any;
  };
}

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
  refreshOrganization: () => Promise<void>;
  userCount: number;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userCount, setUserCount] = useState(0);

  const fetchOrganization = async () => {
    if (!profile?.organization_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select(`
          *,
          subscription_plan:subscription_plans(name, code, max_users, features)
        `)
        .eq('id', profile.organization_id)
        .single() as { data: any; error: any };

      if (fetchError) throw fetchError;

      setOrganization(data as Organization);

      // Fetch user count for this organization
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      setUserCount(count || 0);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [profile?.organization_id]);

  const value = {
    organization,
    isLoading,
    error,
    refreshOrganization: fetchOrganization,
    userCount,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
