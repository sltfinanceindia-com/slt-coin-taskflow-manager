import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function CommunicationDebug() {
  const { user, profile } = useAuth();
  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    if (user || profile) {
      runDebugAnalysis();
    }
  }, [user, profile]);

  const runDebugAnalysis = async () => {
    try {
      setIsDebugging(true);
      
      console.log('=== COMMUNICATION DEBUG START ===');
      console.log('Auth User:', user);
      console.log('Auth Profile:', profile);

      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      console.log('All Profiles:', allProfiles);
      console.log('Profiles Error:', profilesError);

      // Get team members excluding current user
      if (profile?.id) {
        const { data: teammates, error: teammatesError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', profile.id)
          .order('full_name');

        console.log('Team Members Query Result:', teammates);
        console.log('Team Members Error:', teammatesError);

        // Test channel queries
        const { data: channels, error: channelsError } = await supabase
          .from('communication_channels')
          .select(`
            *,
            channel_members(
              user_id,
              profiles(
                id,
                full_name,
                avatar_url,
                role
              )
            )
          `)
          .order('created_at', { ascending: false });

        console.log('All Channels:', channels);
        console.log('Channels Error:', channelsError);

        // Test user's channels
        const { data: userChannels, error: userChannelsError } = await supabase
          .from('communication_channels')
          .select(`
            *,
            channel_members!inner(
              user_id,
              profiles(
                id,
                full_name,
                avatar_url,
                role
              )
            )
          `)
          .eq('channel_members.user_id', profile.id)
          .order('created_at', { ascending: false });

        console.log('User Channels:', userChannels);
        console.log('User Channels Error:', userChannelsError);
      }

      // Get current session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('Current Session:', session);
      console.log('Session Error:', sessionError);

      // Test RPC functions
      console.log('Testing RPC functions...');
      
      console.log('=== COMMUNICATION DEBUG END ===');
      
    } catch (error) {
      console.error('Debug analysis error:', error);
    } finally {
      setIsDebugging(false);
    }
  };

  // This component renders nothing but runs debug analysis
  return null;
}
