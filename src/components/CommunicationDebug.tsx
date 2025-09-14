import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CommunicationDebug() {
  const { user, profile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (user || profile) {
      fetchDebugInfo();
    }
  }, [user, profile]);

  const fetchDebugInfo = async () => {
    try {
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
        setTeamMembers(teammates || []);
      }

      // Get current session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('Current Session:', session);
      console.log('Session Error:', sessionError);

      setDebugInfo({
        user,
        profile,
        allProfiles,
        profilesError,
        session,
        sessionError
      });

      console.log('=== COMMUNICATION DEBUG END ===');
    } catch (error) {
      console.error('Debug fetch error:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Communication Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchDebugInfo}>Refresh Debug Info</Button>
          
          <div>
            <h3 className="font-semibold">Auth User:</h3>
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Profile:</h3>
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Team Members Count: {teamMembers.length}</h3>
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(teamMembers, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Debug Info:</h3>
            <pre className="text-xs bg-muted p-2 rounded max-h-64 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}