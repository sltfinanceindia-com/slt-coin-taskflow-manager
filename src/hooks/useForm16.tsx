 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useUserRole } from '@/hooks/useUserRole';
 import { toast } from 'sonner';
 
 export interface Form16Record {
   id: string;
   organization_id: string | null;
   employee_id: string;
   financial_year: string;
   gross_salary: number;
   total_deductions: number;
   taxable_income: number;
   tax_paid: number;
   status: 'pending' | 'generated' | 'sent';
   generated_date: string | null;
   sent_date: string | null;
   document_url: string | null;
   created_at: string | null;
   updated_at: string | null;
   employee?: { id: string; full_name: string; email: string; pan_number?: string } | null;
 }
 
 export function useForm16() {
   const { profile } = useAuth();
   const { isAdmin, isHRAdmin } = useUserRole();
   const queryClient = useQueryClient();
 
   const recordsQuery = useQuery({
     queryKey: ['form16-records', profile?.organization_id, isAdmin],
     queryFn: async () => {
       if (!profile?.organization_id) return [];
       
       let query = supabase
         .from('form16_records')
         .select(`
           *,
           employee:profiles!form16_records_employee_id_fkey(id, full_name, email)
         `)
         .eq('organization_id', profile.organization_id)
         .order('financial_year', { ascending: false });
 
       // Non-admins only see their own records
       if (!isAdmin && !isHRAdmin) {
         query = query.eq('employee_id', profile.id);
       }
       
       const { data, error } = await query;
       if (error) throw error;
       return (data || []) as Form16Record[];
     },
     enabled: !!profile?.organization_id,
   });
 
   const generateForm16 = useMutation({
     mutationFn: async (employeeIds: string[]) => {
       // Mark records as generated
       const { error } = await supabase
         .from('form16_records')
         .update({
           status: 'generated',
           generated_date: new Date().toISOString(),
         })
         .in('employee_id', employeeIds)
         .eq('organization_id', profile?.organization_id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['form16-records'] });
       toast.success('Form 16 generated successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const sendForm16 = useMutation({
     mutationFn: async (employeeIds: string[]) => {
       const { error } = await supabase
         .from('form16_records')
         .update({
           status: 'sent',
           sent_date: new Date().toISOString(),
         })
         .in('employee_id', employeeIds)
         .eq('organization_id', profile?.organization_id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['form16-records'] });
       toast.success('Form 16 sent to employees');
     },
     onError: (error) => toast.error(error.message),
   });
 
   return {
     records: recordsQuery.data || [],
     isLoading: recordsQuery.isLoading,
     error: recordsQuery.error,
     generateForm16,
     sendForm16,
   };
 }