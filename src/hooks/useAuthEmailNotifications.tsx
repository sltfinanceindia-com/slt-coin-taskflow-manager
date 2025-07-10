
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

        // For logout, we need to capture profile data before it's cleared
        if (event === 'SIGNED_OUT') {
          // Only send logout email if we have profile data from before logout
          const currentProfile = profile;
          if (currentProfile) {
            try {
              await emailNotifications.sendLogoutNotificationEmail({
                to: currentProfile.email,
                recipientName: currentProfile.full_name,
              });
            } catch (error) {
              console.error('Failed to send logout notification:', error);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [profile, emailNotifications]);
}
