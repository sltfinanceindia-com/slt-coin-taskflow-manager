import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, Award, Clock } from 'lucide-react';
import { TrainingSection } from '@/types/training';

interface TrainingCoursesProps {
  sections: TrainingSection[];
  isLoading: boolean;
}

export function TrainingCourses({ sections, isLoading }: TrainingCoursesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BookOpen className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Card className="card-gradient">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No training content available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Training courses are being prepared for you. Check back soon for exciting learning opportunities!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {sections.map((section) => (
        <Card key={section.id} className="card-gradient hover-scale">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-success text-success-foreground">
                Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {section.videos?.length || 0} video{(section.videos?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  {section.assignments?.length || 0} assignment{(section.assignments?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-sm">
                  {section.videos?.reduce((acc, video) => acc + (video.duration_minutes || 0), 0) || 0} minutes
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">0%</span>
              </div>
              <Progress value={0} className="h-1" />
            </div>

            <Button className="w-full btn-primary">
              <Play className="h-4 w-4 mr-2" />
              Start Learning
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}