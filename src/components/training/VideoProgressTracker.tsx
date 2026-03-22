import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface VideoProgressTrackerProps {
  videoId: string;
  videoUrl: string;
  durationMinutes?: number;
  onComplete?: () => void;
}

// Local storage based progress tracking (no database required)
function getStoredProgress(videoId: string, userId: string): { position: number; completed: boolean } {
  const key = `video_progress_${userId}_${videoId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { position: 0, completed: false };
    }
  }
  return { position: 0, completed: false };
}

function saveProgress(videoId: string, userId: string, position: number, completed: boolean) {
  const key = `video_progress_${userId}_${videoId}`;
  localStorage.setItem(key, JSON.stringify({ position, completed }));
}

export function VideoProgressTracker({ 
  videoId, 
  videoUrl, 
  durationMinutes = 0,
  onComplete 
}: VideoProgressTrackerProps) {
  const { profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalSeconds = durationMinutes * 60;

  // Initialize from local storage
  useEffect(() => {
    if (profile?.id && videoId) {
      const stored = getStoredProgress(videoId, profile.id);
      setCurrentPosition(stored.position);
      setIsCompleted(stored.completed);
    }
  }, [videoId, profile?.id]);

  // Simulate video playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentPosition < totalSeconds && !isCompleted) {
      interval = setInterval(() => {
        setCurrentPosition(prev => {
          const newPosition = Math.min(prev + 1, totalSeconds);
          
          // Save progress every 10 seconds
          if (profile?.id && newPosition % 10 === 0) {
            saveProgress(videoId, profile.id, newPosition, newPosition >= totalSeconds * 0.9);
          }
          
          // Auto-complete at 90%
          if (newPosition >= totalSeconds * 0.9 && !isCompleted) {
            setIsCompleted(true);
            if (profile?.id) {
              saveProgress(videoId, profile.id, newPosition, true);
            }
            toast.success('Video completed! Great job!');
            onComplete?.();
          }
          
          return newPosition;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds, isCompleted, videoId, profile?.id]);

  const progressPercent = totalSeconds > 0 ? (currentPosition / totalSeconds) * 100 : 0;
  const watchedMinutes = Math.floor(currentPosition / 60);
  const watchedSeconds = currentPosition % 60;
  const remainingMinutes = Math.floor((totalSeconds - currentPosition) / 60);

  const handleReset = () => {
    setCurrentPosition(0);
    setIsCompleted(false);
    if (profile?.id) {
      saveProgress(videoId, profile.id, 0, false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {isCompleted && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-primary text-primary-foreground gap-1" data-testid="badge-video-completed">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            </div>
          )}
          {videoUrl ? (
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-primary" />
                ) : (
                  <Play className="h-8 w-8 text-primary ml-1" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPlaying ? 'Playing...' : currentPosition > 0 ? 'Paused' : 'Ready to play'}
              </p>
            </div>
          ) : (
            <div className="text-center p-4">
              <Play className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No video URL provided</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {watchedMinutes}:{watchedSeconds.toString().padStart(2, '0')} / {durationMinutes}:00
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {remainingMinutes} min remaining
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1"
            disabled={isCompleted}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {currentPosition > 0 ? 'Resume' : 'Play'}
              </>
            )}
          </Button>
          {currentPosition > 0 && (
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isCompleted && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-sm text-primary font-medium">
              🎉 You've completed this video!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for tracking overall course progress (local storage based)
export function useCourseProgress(sectionId: string, videoIds: string[]) {
  const { profile } = useAuth();
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    if (!profile?.id || !videoIds.length) return;

    let completedCount = 0;
    videoIds.forEach(videoId => {
      const stored = getStoredProgress(videoId, profile.id);
      if (stored.completed) completedCount++;
    });

    setProgress({
      completed: completedCount,
      total: videoIds.length,
      percentage: videoIds.length > 0 ? Math.round((completedCount / videoIds.length) * 100) : 0
    });
  }, [sectionId, videoIds, profile?.id]);

  return progress;
}
