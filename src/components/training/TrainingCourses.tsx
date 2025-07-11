
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users, Play, FileText, CheckCircle } from 'lucide-react';
import { TrainingSection } from '@/types/training';
import { useAssessments } from '@/hooks/useAssessments';
import { useAssessmentAttempts } from '@/hooks/useAssessmentAttempts';
import { AssessmentInterface } from '@/components/assessment/AssessmentInterface';

interface TrainingCoursesProps {
  sections: TrainingSection[];
  isLoading: boolean;
}

export function TrainingCourses({ sections, isLoading }: TrainingCoursesProps) {
  const { assessments } = useAssessments();
  const { attempts } = useAssessmentAttempts();
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  // Find UI/UX assessment
  const uiuxAssessment = assessments.find(a => a.title.includes('UI/UX'));
  const userAttempts = attempts.filter(a => a.assessment_id === uiuxAssessment?.id);
  const passedAttempt = userAttempts.find(a => a.is_passed);
  const latestAttempt = userAttempts[0]; // Most recent attempt

  if (selectedAssessment) {
    return <AssessmentInterface assessmentId={selectedAssessment} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="card-gradient animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UI/UX Assessment Card */}
      {uiuxAssessment && (
        <Card className="card-gradient border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">{uiuxAssessment.title}</CardTitle>
                  {passedAttempt && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passed
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">
                  {uiuxAssessment.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{uiuxAssessment.time_limit_minutes} minutes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{uiuxAssessment.total_questions} questions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Passing: {uiuxAssessment.passing_score}%</span>
                </div>
              </div>

              {/* Show latest attempt results */}
              {latestAttempt && (
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Latest Attempt: {latestAttempt.score}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {latestAttempt.correct_answers}/{latestAttempt.total_questions} correct
                        • {new Date(latestAttempt.submitted_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={latestAttempt.is_passed ? "default" : "destructive"}>
                      {latestAttempt.is_passed ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setSelectedAssessment(uiuxAssessment.id)}
                  className="flex-1"
                  variant={passedAttempt ? "outline" : "default"}
                >
                  {passedAttempt ? "Review Assessment" : "Take Assessment"}
                </Button>
                {userAttempts.length > 0 && (
                  <Badge variant="secondary">
                    {userAttempts.length} attempt{userAttempts.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Sections */}
      <div className="grid grid-cols-1 gap-6">
        {sections.length === 0 ? (
          <Card className="card-gradient">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Training Content Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Training sections will appear here once they are published by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => (
            <Card key={section.id} className="card-gradient hover-scale">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription className="text-base">
                      {section.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {section.training_videos?.length || 0} videos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress bar placeholder */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  {/* Video list */}
                  {section.training_videos && section.training_videos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Videos</h4>
                      <div className="space-y-2">
                        {section.training_videos.slice(0, 3).map((video) => (
                          <div key={video.id} className="flex items-center space-x-3 text-sm">
                            <Play className="h-4 w-4 text-primary" />
                            <span className="flex-1">{video.title}</span>
                            <span className="text-muted-foreground">
                              {video.duration_minutes}min
                            </span>
                          </div>
                        ))}
                        {section.training_videos.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {section.training_videos.length - 3} more videos
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
