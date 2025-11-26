import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Video, BookOpen } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { EmptyState } from '@/components/ui/empty-state';

export function TrainingSectionsCRUD() {
  const { data: sections, isLoading } = useTrainingSections();

  if (isLoading) {
    return <div className="text-center py-12">Loading sections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training Sections</h2>
          <p className="text-muted-foreground">View and manage training content</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Section (Coming Soon)
        </Button>
      </div>

      {!sections || sections.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No training sections yet"
          description="Training sections will appear here once they are created and published by administrators"
        />
      ) : (
        <div className="space-y-4">
          {sections.map((section: any) => (
            <Card key={section.id} className="card-gradient hover-scale">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    {section.description && (
                      <CardDescription className="mt-1">{section.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {section.training_videos?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>{section.training_videos.length} video(s)</span>
                    </div>
                  )}
                  {section.training_assignments?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{section.training_assignments.length} assignment(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
