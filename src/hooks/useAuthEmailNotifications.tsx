import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { supabase } from '@/integrations/supabase/client';

export function useAuthEmailNotifications() {
  const { profile, user } = useAuth();
  const emailNotifications = useEmailNotifications();

  useEffect(() => {
    // Only set up listener once when component mounts
    let hasTriggeredLogin = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && !hasTriggeredLogin) {
          hasTriggeredLogin = true;
          
          // Get profile data if not available
          if (!profile) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('user_id', session.user.id)
              .single();
            
            if (userProfile) {
              try {
                await emailNotifications.sendLoginNotificationEmail({
                  to: userProfile.email,
                  recipientName: userProfile.full_name,
                });
              } catch (error) {
                console.error('Failed to send login notification:', error);
              }
            }
          } else {
            try {
              await emailNotifications.sendLoginNotificationEmail({
                to: profile.email,
                recipientName: profile.full_name,
              });
            } catch (error) {
              console.error('Failed to send login notification:', error);
            }
          }
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
  }, []); // Empty dependency array to run only once
}