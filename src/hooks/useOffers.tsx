import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Offer {
  id: string;
  organization_id: string | null;
  job_posting_id: string | null;
  candidate_name: string;
  candidate_email: string | null;
  position: string;
  department: string | null;
  salary_offered: number;
  joining_date: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'negotiating' | 'withdrawn';
  offer_letter_url: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useOffers() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const offersQuery = useQuery({
    queryKey: ['offers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from('offers').select('*').eq('organization_id', profile.organization_id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Offer[];
    },
    enabled: !!profile?.organization_id,
  });

  const createOffer = useMutation({
    mutationFn: async (offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('offers').insert({ ...offer, organization_id: profile?.organization_id, created_by: profile?.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offers'] }); toast.success('Offer created'); },
    onError: (error) => toast.error(error.message),
  });

  const updateOffer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Offer> & { id: string }) => {
      const { data, error } = await supabase.from('offers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offers'] }); toast.success('Offer updated'); },
    onError: (error) => toast.error(error.message),
  });

  const deleteOffer = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('offers').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offers'] }); toast.success('Offer deleted'); },
    onError: (error) => toast.error(error.message),
  });

  return { offers: offersQuery.data || [], isLoading: offersQuery.isLoading, error: offersQuery.error, createOffer, updateOffer, deleteOffer };
}
