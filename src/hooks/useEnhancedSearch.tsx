import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SearchResult {
  id: string;
  type: 'user' | 'message' | 'file' | 'channel';
  title: string;
  content?: string;
  metadata?: any;
  created_at?: string;
}

export const useEnhancedSearch = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .or(`full_name.ilike.%${query}%, email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.id,
        type: 'user' as const,
        title: profile.full_name,
        content: profile.email,
        metadata: { role: profile.role, avatar_url: profile.avatar_url }
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const searchMessages = async (query: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, 
          content, 
          created_at,
          sender_id,
          channel_id,
          profiles!messages_sender_id_fkey(full_name)
        `)
        .textSearch('content', query)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(message => ({
        id: message.id,
        type: 'message' as const,
        title: `Message from ${message.profiles?.full_name || 'Unknown'}`,
        content: message.content,
        metadata: { 
          sender_id: message.sender_id, 
          channel_id: message.channel_id 
        },
        created_at: message.created_at
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };

  const searchFiles = async (query: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select(`
          id,
          file_name,
          file_type,
          file_size,
          created_at,
          message_id,
          profiles!file_attachments_uploaded_by_fkey(full_name)
        `)
        .ilike('file_name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(file => ({
        id: file.id,
        type: 'file' as const,
        title: file.file_name,
        content: `${file.file_type} • ${Math.round(file.file_size / 1024)}KB`,
        metadata: { 
          message_id: file.message_id,
          file_type: file.file_type,
          uploader: file.profiles?.full_name
        },
        created_at: file.created_at
      }));
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  };

  const searchChannels = async (query: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select('id, name, description, type, member_count')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map(channel => ({
        id: channel.id,
        type: 'channel' as const,
        title: channel.name,
        content: channel.description || `${channel.type} channel • ${channel.member_count} members`,
        metadata: { type: channel.type, member_count: channel.member_count }
      }));
    } catch (error) {
      console.error('Error searching channels:', error);
      return [];
    }
  };

  const performSearch = useCallback(async (
    query: string, 
    filters: {
      includeUsers?: boolean;
      includeMessages?: boolean;
      includeFiles?: boolean;
      includeChannels?: boolean;
      dateRange?: { start: Date; end: Date };
    } = {}
  ) => {
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchPromises: Promise<SearchResult[]>[] = [];

      if (filters.includeUsers !== false) {
        searchPromises.push(searchUsers(query));
      }
      if (filters.includeMessages !== false) {
        searchPromises.push(searchMessages(query));
      }
      if (filters.includeFiles !== false) {
        searchPromises.push(searchFiles(query));
      }
      if (filters.includeChannels !== false) {
        searchPromises.push(searchChannels(query));
      }

      const searchResults = await Promise.all(searchPromises);
      const allResults = searchResults.flat();

      // Apply date filter if specified
      let filteredResults = allResults;
      if (filters.dateRange) {
        filteredResults = allResults.filter(result => {
          if (!result.created_at) return true;
          const resultDate = new Date(result.created_at);
          return resultDate >= filters.dateRange!.start && resultDate <= filters.dateRange!.end;
        });
      }

      // Sort by relevance and date
      filteredResults.sort((a, b) => {
        // Prioritize exact matches in title
        const aExactMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bExactMatch = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Then sort by date
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        return 0;
      });

      setResults(filteredResults);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    loading,
    performSearch,
    clearResults
  };
};