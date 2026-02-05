 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export interface InvestmentDeclaration {
   id: string;
   organization_id: string | null;
   employee_id: string;
   section: string;
   category: string;
   declared_amount: number;
   verified_amount: number;
   max_limit: number;
   proof_url: string | null;
   proof_submitted: boolean;
   financial_year: string;
   status: 'pending' | 'verified' | 'rejected';
   verified_by: string | null;
   verified_at: string | null;
   created_at: string | null;
   updated_at: string | null;
 }
 
 interface CreateDeclarationInput {
   section: string;
   category: string;
   declared_amount: number;
   max_limit?: number;
   financial_year: string;
   proof_url?: string;
 }
 
 export function useInvestmentDeclarations() {
   const { profile } = useAuth();
   const queryClient = useQueryClient();
 
   const declarationsQuery = useQuery({
     queryKey: ['investment-declarations', profile?.id, profile?.organization_id],
     queryFn: async () => {
       if (!profile?.id) return [];
       
       const { data, error } = await supabase
         .from('investment_declarations')
         .select('*')
         .eq('employee_id', profile.id)
         .order('section', { ascending: true })
         .order('category', { ascending: true });
       
       if (error) throw error;
       return (data || []) as InvestmentDeclaration[];
     },
     enabled: !!profile?.id,
   });
 
   const createDeclaration = useMutation({
     mutationFn: async (input: CreateDeclarationInput) => {
       const { data, error } = await supabase
         .from('investment_declarations')
         .insert({
           organization_id: profile?.organization_id,
           employee_id: profile?.id,
           section: input.section,
           category: input.category,
           declared_amount: input.declared_amount,
           max_limit: input.max_limit || 0,
           financial_year: input.financial_year,
           proof_url: input.proof_url,
           proof_submitted: !!input.proof_url,
           status: 'pending',
         })
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['investment-declarations'] });
       toast.success('Declaration saved successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const updateDeclaration = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<InvestmentDeclaration> & { id: string }) => {
       const { data, error } = await supabase
         .from('investment_declarations')
         .update({ ...updates, updated_at: new Date().toISOString() })
         .eq('id', id)
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['investment-declarations'] });
       toast.success('Declaration updated successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const deleteDeclaration = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('investment_declarations')
         .delete()
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['investment-declarations'] });
       toast.success('Declaration deleted successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   return {
     declarations: declarationsQuery.data || [],
     isLoading: declarationsQuery.isLoading,
     error: declarationsQuery.error,
     createDeclaration,
     updateDeclaration,
     deleteDeclaration,
   };
 }