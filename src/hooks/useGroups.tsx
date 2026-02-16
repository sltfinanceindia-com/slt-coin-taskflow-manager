import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
}

export const useGroups = () => {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's groups
  const fetchGroups = async () => {
    if (!user || !profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new group
  const createGroup = async (name: string, description?: string, isPrivate = false): Promise<Group | null> => {
    if (!user || !profile?.organization_id) return null;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          created_by: user.id,
          is_private: isPrivate,
          member_count: 1,
          organization_id: profile.organization_id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      toast({
        title: "Success",
        description: "Group created successfully"
      });

      fetchGroups();
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive"
      });
      return null;
    }
  };

  // Get group members
  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profile:profiles!inner(
            id,
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      return (data || []) as GroupMember[];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  // Add member to group
  const addMember = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      // Update member count
      const { data: currentGroup } = await supabase
        .from('groups')
        .select('member_count')
        .eq('id', groupId)
        .single();
      
      if (currentGroup) {
        await supabase
          .from('groups')
          .update({ member_count: currentGroup.member_count + 1 })
          .eq('id', groupId);
      }

      toast({
        title: "Success",
        description: "Member added to group"
      });

      return true;
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remove member from group
  const removeMember = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from group"
      });

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user, profile?.organization_id]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('groups_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups'
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    groups,
    loading,
    createGroup,
    getGroupMembers,
    addMember,
    removeMember,
    refetch: fetchGroups
  };
};