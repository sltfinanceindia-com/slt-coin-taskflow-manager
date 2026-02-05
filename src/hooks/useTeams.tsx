 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export interface Team {
   id: string;
   organization_id: string | null;
   name: string;
   description: string | null;
   department_id: string | null;
   lead_id: string | null;
   status: string | null;
   created_at: string | null;
   updated_at: string | null;
   department?: { id: string; name: string } | null;
   lead?: { id: string; full_name: string } | null;
   member_count?: number;
 }
 
 interface CreateTeamInput {
   name: string;
   description?: string;
   department_id?: string | null;
   lead_id?: string | null;
   status?: string;
 }
 
 export function useTeams() {
   const { profile } = useAuth();
   const queryClient = useQueryClient();
 
   const teamsQuery = useQuery({
     queryKey: ['teams', profile?.organization_id],
     queryFn: async () => {
       if (!profile?.organization_id) return [];
       
       const { data, error } = await supabase
         .from('teams')
         .select(`
           *,
           department:departments!teams_department_id_fkey(id, name),
           lead:profiles!teams_lead_id_fkey(id, full_name)
         `)
         .eq('organization_id', profile.organization_id)
         .order('name', { ascending: true });
       
       if (error) throw error;
 
       // For now, set member_count to 0 (would need a team_members junction table)
       return (data || []).map((team: any) => ({
         ...team,
         member_count: 0,
       })) as Team[];
     },
     enabled: !!profile?.organization_id,
   });
 
   const createTeam = useMutation({
     mutationFn: async (input: CreateTeamInput) => {
       const { data, error } = await supabase
         .from('teams')
         .insert({
           organization_id: profile?.organization_id,
           name: input.name,
           description: input.description,
           department_id: input.department_id,
           lead_id: input.lead_id,
           status: input.status || 'active',
         })
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['teams'] });
       toast.success('Team created successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const updateTeam = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<Team> & { id: string }) => {
       const { data, error } = await supabase
         .from('teams')
         .update({ ...updates, updated_at: new Date().toISOString() })
         .eq('id', id)
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['teams'] });
       toast.success('Team updated successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   const deleteTeam = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('teams')
         .delete()
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['teams'] });
       toast.success('Team deleted successfully');
     },
     onError: (error) => toast.error(error.message),
   });
 
   return {
     teams: teamsQuery.data || [],
     isLoading: teamsQuery.isLoading,
     error: teamsQuery.error,
     createTeam,
     updateTeam,
     deleteTeam,
   };
 }