 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export interface Department {
   id: string;
   name: string;
   description: string | null;
   head_id: string | null;
   organization_id: string | null;
   color: string | null;
   code: string | null;
   parent_id: string | null;
   status: string | null;
   created_at: string | null;
   updated_at: string | null;
   head?: { id: string; full_name: string } | null;
   parent?: { id: string; name: string } | null;
   employee_count?: number;
 }
 
 interface CreateDepartmentInput {
   name: string;
   description?: string;
   code?: string;
   head_id?: string | null;
   parent_id?: string | null;
   color?: string;
   status?: string;
 }
 
 export function useDepartments() {
   const { profile } = useAuth();
   const queryClient = useQueryClient();
 
   const departmentsQuery = useQuery({
     queryKey: ['departments', profile?.organization_id],
     queryFn: async () => {
       if (!profile?.organization_id) return [];
       
       // Fetch departments with head info
       const { data: departments, error: deptError } = await supabase
         .from('departments')
         .select(`
           *,
           head:profiles!departments_head_id_fkey(id, full_name)
         `)
         .eq('organization_id', profile.organization_id)
         .order('name', { ascending: true });
       
       if (deptError) throw deptError;
 
       // Fetch employee counts per department
       const { data: profiles, error: profilesError } = await supabase
         .from('profiles')
         .select('department_id')
         .eq('organization_id', profile.organization_id);
 
       if (profilesError) throw profilesError;
 
       // Count employees per department
       const countMap = profiles?.reduce((acc: Record<string, number>, p) => {
         if (p.department_id) {
           acc[p.department_id] = (acc[p.department_id] || 0) + 1;
         }
         return acc;
       }, {}) || {};
 
       // Add parent info and employee count
       return (departments || []).map((dept: any) => {
         const parentDept = departments?.find((d: any) => d.id === dept.parent_id);
         return {
           ...dept,
           parent: parentDept ? { id: parentDept.id, name: parentDept.name } : null,
           employee_count: countMap[dept.id] || 0,
         };
       }) as Department[];
     },
     enabled: !!profile?.organization_id,
   });
 
   const createDepartment = useMutation({
     mutationFn: async (input: CreateDepartmentInput) => {
       const { data, error } = await supabase
         .from('departments')
         .insert({
           organization_id: profile?.organization_id,
           name: input.name,
           description: input.description,
           code: input.code,
           head_id: input.head_id,
           parent_id: input.parent_id,
           color: input.color || '#3B82F6',
           status: input.status || 'active',
         })
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['departments'] });
       toast.success('Department created successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const updateDepartment = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<Department> & { id: string }) => {
       const { data, error } = await supabase
         .from('departments')
         .update({ ...updates, updated_at: new Date().toISOString() })
         .eq('id', id)
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['departments'] });
       toast.success('Department updated successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const deleteDepartment = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('departments')
         .delete()
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['departments'] });
       toast.success('Department deleted successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   return {
     departments: departmentsQuery.data || [],
     isLoading: departmentsQuery.isLoading,
     error: departmentsQuery.error,
     createDepartment,
     updateDepartment,
     deleteDepartment,
   };
 }