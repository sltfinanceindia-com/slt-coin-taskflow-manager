 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export interface Location {
   id: string;
   organization_id: string | null;
   name: string;
   code: string;
   location_type: 'headquarters' | 'branch' | 'remote';
   address: string | null;
   city: string | null;
   country: string | null;
   timezone: string | null;
   status: string | null;
   created_at: string | null;
   updated_at: string | null;
   employee_count?: number;
 }
 
 interface CreateLocationInput {
   name: string;
   code: string;
   location_type?: 'headquarters' | 'branch' | 'remote';
   address?: string;
   city?: string;
   country?: string;
   timezone?: string;
   status?: string;
 }
 
 export function useLocations() {
   const { profile } = useAuth();
   const queryClient = useQueryClient();
 
   const locationsQuery = useQuery({
     queryKey: ['locations', profile?.organization_id],
     queryFn: async () => {
       if (!profile?.organization_id) return [];
       
       const { data, error } = await supabase
         .from('locations')
         .select('*')
         .eq('organization_id', profile.organization_id)
         .order('name', { ascending: true });
       
       if (error) throw error;
 
       // Count employees per location (using profiles.location field if available)
       return (data || []).map((loc: any) => ({
         ...loc,
         employee_count: 0, // Would need location_id in profiles
       })) as Location[];
     },
     enabled: !!profile?.organization_id,
   });
 
   const createLocation = useMutation({
     mutationFn: async (input: CreateLocationInput) => {
       const { data, error } = await supabase
         .from('locations')
         .insert({
           organization_id: profile?.organization_id,
           name: input.name,
           code: input.code,
           location_type: input.location_type || 'branch',
           address: input.address,
           city: input.city,
           country: input.country,
           timezone: input.timezone,
           status: input.status || 'active',
         })
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['locations'] });
       toast.success('Location created successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const updateLocation = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<Location> & { id: string }) => {
       const { data, error } = await supabase
         .from('locations')
         .update({ ...updates, updated_at: new Date().toISOString() })
         .eq('id', id)
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['locations'] });
       toast.success('Location updated successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const deleteLocation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('locations')
         .delete()
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['locations'] });
       toast.success('Location deleted successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   return {
     locations: locationsQuery.data || [],
     isLoading: locationsQuery.isLoading,
     error: locationsQuery.error,
     createLocation,
     updateLocation,
     deleteLocation,
   };
 }