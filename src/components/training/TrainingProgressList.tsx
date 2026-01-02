import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlayCircle, CheckCircle } from 'lucide-react';

export function TrainingProgressList() {
  const { profile } = useAuth();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['training-videos-progress', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*, training_sections(title)')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Progress</CardTitle>
        <CardDescription>Track your video completion progress</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <PlayCircle className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">{video.title}</h4>
                  <p className="text-sm text-muted-foreground">{(video.training_sections as any)?.title}</p>
                  <Progress value={0} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No training videos available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
