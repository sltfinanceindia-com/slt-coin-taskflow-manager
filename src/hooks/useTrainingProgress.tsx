/**
 * Training Progress Hook
 * Track user progress through training videos and sections
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface VideoProgress {
  video_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
  completion_percentage: number;
  last_watched_at: string;
}

export interface SectionProgress {
  sectionId: string;
  totalVideos: number;
  completedVideos: number;
  progressPercent: number;
}

export function useTrainingProgress() {
  const { profile } = useAuth();

  const progressQuery = useQuery({
    queryKey: ['training-video-progress', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('training_video_progress')
        .select('video_id, is_completed, watch_time_seconds, completion_percentage, last_watched_at')
        .eq('user_id', profile.id);

      if (error) throw error;
      return (data || []) as VideoProgress[];
    },
    enabled: !!profile?.id,
  });

  const calculateSectionProgress = (sectionId: string, videoIds: string[]): SectionProgress => {
    const progressData = progressQuery.data || [];
    const completedVideos = videoIds.filter(videoId => 
      progressData.some(p => p.video_id === videoId && p.is_completed)
    ).length;

    return {
      sectionId,
      totalVideos: videoIds.length,
      completedVideos,
      progressPercent: videoIds.length > 0 ? Math.round((completedVideos / videoIds.length) * 100) : 0,
    };
  };

  const isVideoCompleted = (videoId: string): boolean => {
    return progressQuery.data?.some(p => p.video_id === videoId && p.is_completed) || false;
  };

  const getVideoProgress = (videoId: string): VideoProgress | undefined => {
    return progressQuery.data?.find(p => p.video_id === videoId);
  };

  return {
    progressData: progressQuery.data || [],
    isLoading: progressQuery.isLoading,
    calculateSectionProgress,
    isVideoCompleted,
    getVideoProgress,
  };
}
