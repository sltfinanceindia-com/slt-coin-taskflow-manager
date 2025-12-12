import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectUpdate {
  id: string;
  project_id: string | null;
  task_id: string | null;
  user_id: string;
  update_type: string;
  content: string | null;
  metadata: Record<string, unknown>;
  mentions: string[];
  is_important: boolean;
  organization_id: string | null;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
  project?: {
    name: string;
  };
  task?: {
    title: string;
  };
}

export interface DigestSettings {
  id: string;
  user_id: string;
  digest_frequency: string;
  digest_time: string;
  include_mentions: boolean;
  include_updates: boolean;
  include_files: boolean;
  include_tasks: boolean;
  last_digest_sent: string | null;
}

export const useProjectUpdates = (projectId?: string, taskId?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: updates = [], isLoading, refetch } = useQuery({
    queryKey: ['project-updates', projectId, taskId],
    queryFn: async () => {
      let query = supabase
        .from('project_updates')
        .select(`
          *,
          user:profiles!project_updates_user_id_fkey(full_name, avatar_url),
          project:projects(name),
          task:tasks(title)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectUpdate[];
    },
    enabled: !!profile,
  });

  const createUpdate = useMutation({
    mutationFn: async (update: {
      project_id?: string;
      task_id?: string;
      update_type: string;
      content: string;
      metadata?: Record<string, unknown>;
      mentions?: string[];
      is_important?: boolean;
    }) => {
      if (!profile) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('project_updates')
        .insert([{
          project_id: update.project_id,
          task_id: update.task_id,
          update_type: update.update_type,
          content: update.content,
          metadata: update.metadata ? JSON.parse(JSON.stringify(update.metadata)) : undefined,
          mentions: update.mentions,
          is_important: update.is_important,
          user_id: profile.id,
          organization_id: profile.organization_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-updates'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create update',
        variant: 'destructive',
      });
    },
  });

  const deleteUpdate = useMutation({
    mutationFn: async (updateId: string) => {
      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-updates'] });
      toast({ title: 'Update deleted' });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel('project-updates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_updates',
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, refetch]);

  return {
    updates,
    isLoading,
    createUpdate,
    deleteUpdate,
    refetch,
  };
};

export const useDigestSettings = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['digest-settings', profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const { data, error } = await supabase
        .from('digest_settings')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      return data as DigestSettings | null;
    },
    enabled: !!profile,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<DigestSettings>) => {
      if (!profile) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('digest_settings')
        .upsert({
          user_id: profile.id,
          organization_id: profile.organization_id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digest-settings'] });
      toast({ title: 'Digest settings updated' });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
};
