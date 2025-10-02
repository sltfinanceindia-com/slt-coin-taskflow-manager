import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CallRecord {
  id: string;
  caller_id: string | null;
  receiver_id: string | null;
  caller_name: string | null;
  receiver_name: string | null;
  call_type: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string | null;
}

export function useCallHistory() {
  const { user } = useAuth();
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCallHistory = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // First get the profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .or(`caller_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching call history:', error);
        return;
      }

      setCallHistory(data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistory();

    // Set up real-time subscription for call history
    const channel = supabase
      .channel('call_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_history'
        },
        () => {
          fetchCallHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getMissedCalls = async () => {
    if (!user) return [];
    
    // Get profile id first
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return [];

    return callHistory.filter(
      (call) => call.status === 'no_answer' && call.receiver_id === profile.id
    );
  };

  const getIncomingCalls = () => {
    return callHistory.filter((call) => call.receiver_id === user?.id);
  };

  const getOutgoingCalls = () => {
    return callHistory.filter((call) => call.caller_id === user?.id);
  };

  return {
    callHistory,
    isLoading,
    fetchCallHistory,
    getMissedCalls,
    getIncomingCalls,
    getOutgoingCalls
  };
}
