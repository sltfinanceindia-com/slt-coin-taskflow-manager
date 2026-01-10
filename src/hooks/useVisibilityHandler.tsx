import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle app sleep mode / tab switching issues
 * - Refreshes data when user returns to the tab
 * - Keeps Supabase connection alive with heartbeat
 */
export function useVisibilityHandler() {
  const queryClient = useQueryClient();

  // Refresh data when tab becomes visible
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // Invalidate critical queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['project-updates'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  }, [queryClient]);

  useEffect(() => {
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat to keep Supabase connection alive (every 2 minutes)
    const heartbeatInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        try {
          // Lightweight ping to keep connection alive
          await supabase.from('profiles').select('id').limit(1);
        } catch (error) {
          console.warn('Heartbeat failed:', error);
        }
      }
    }, 2 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeatInterval);
    };
  }, [handleVisibilityChange]);
}

export default useVisibilityHandler;
