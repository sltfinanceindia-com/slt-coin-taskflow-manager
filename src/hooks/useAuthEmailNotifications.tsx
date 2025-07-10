import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { supabase } from '@/integrations/supabase/client';

export function useAuthEmailNotifications() {
  const { profile, user } = useAuth();
  const emailNotifications = useEmailNotifications();

  useEffect(() => {
    // Set up auth state listener for email notifications
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && profile) {
          // Send login notification email
          setTimeout(async () => {
            try {
              await emailNotifications.sendLoginNotificationEmail({
                to: profile.email,
                recipientName: profile.full_name,
              });
            } catch (error) {
              console.error('Failed to send login notification:', error);
            }
          }, 2000); // Delay to ensure profile is loaded
        }

        if (event === 'SIGNED_OUT' && profile) {
          // Send logout notification email
          try {
            await emailNotifications.sendLogoutNotificationEmail({
              to: profile.email,
              recipientName: profile.full_name,
            });
          } catch (error) {
            console.error('Failed to send logout notification:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [profile, emailNotifications]);
}