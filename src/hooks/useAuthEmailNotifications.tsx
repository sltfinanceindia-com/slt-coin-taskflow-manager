import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { supabase } from '@/integrations/supabase/client';

export function useAuthEmailNotifications() {
  const { profile, user } = useAuth();
  const emailNotifications = useEmailNotifications();
  const { startSession, endSession } = useSessionLogs();
  const currentSessionId = useRef<string | null>(null);
  const profileRef = useRef(profile);

  // Keep profile ref updated
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    // Set up auth state listener for email notifications and session tracking
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          // Start session tracking immediately
          setTimeout(() => {
            startSession();
          }, 0);

          // Login notification emails disabled per user request
          // setTimeout(async () => {
          //   const currentProfile = profileRef.current;
          //   if (currentProfile) {
          //     try {
          //       await emailNotifications.sendLoginNotificationEmail({
          //         to: currentProfile.email,
          //         recipientName: currentProfile.full_name,
          //       });
          //     } catch (error) {
          //       console.error('Failed to send login notification:', error);
          //     }
          //   }
          // }, 2000);
        }

        if (event === 'SIGNED_OUT') {
          // Logout notification emails disabled per user request
          // const currentProfile = profileRef.current;
          // if (currentProfile) {
          //   // Send logout notification immediately
          //   setTimeout(async () => {
          //     try {
          //       await emailNotifications.sendLogoutNotificationEmail({
          //         to: currentProfile.email,
          //         recipientName: currentProfile.full_name,
          //       });
          //     } catch (error) {
          //       console.error('Failed to send logout notification:', error);
          //     }
          //   }, 0);
          // }

          // End session if we have an active session
          if (currentSessionId.current) {
            setTimeout(() => {
              endSession(currentSessionId.current!);
              currentSessionId.current = null;
            }, 0);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [emailNotifications, startSession, endSession]);
}