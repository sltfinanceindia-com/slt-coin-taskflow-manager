
import { useState } from 'react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { useAssessments } from '@/hooks/useAssessments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Play, FileText, BookOpen, Award, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrainingCourses() {
  const navigate = useNavigate();
  const { sections, isLoading } = useTrainingSections();
  const { assessments } = useAssessments();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading training courses...</div>
      </div>
    );
  }

  const publishedAssessments = assessments.filter(assessment => assessment.is_published);

  const handleTakeAssessment = (assessmentId: string) => {
    navigate(`/assessment/${assessmentId}`);
  };

  const calculateSectionProgress = (section: any) => {
    // This would calculate based on user progress data
    // For now, returning a mock value
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="space-y-6">
      {/* Assessment Section */}
      {publishedAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {publishedAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {assessment.time_limit_minutes} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {assessment.total_questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {assessment.passing_score}% to pass
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleTakeAssessment(assessment.id)}>
                    Start Assessment
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Sections */}
      <div className="grid gap-6">
        {sections.map((section) => {
          const progress = calculateSectionProgress(section);
          const sectionVideos = section.training_videos || [];
          const sectionAssignments = section.training_assignments || [];
          const totalItems = sectionVideos.length + sectionAssignments.length;
          
          return (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                    {section.description && (
                      <p className="text-muted-foreground mt-2">{section.description}</p>
                    )}
                  </div>
                  <Badge variant={section.is_published ? "default" : "secondary"}>
                    {section.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
              
              {totalItems > 0 && (
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`section-${section.id}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <span>Course Content</span>
                          <Badge variant="outline">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {/* Videos */}
                          {sectionVideos.map((video: any) => (
                            <div key={video.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                              <Play className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground">{video.description}</p>
                                )}
                                {video.duration_minutes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Duration: {video.duration_minutes} minutes
                                  </p>
                                )}
                              </div>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          ))}
                          
                          {/* Assignments */}
                          {sectionAssignments.map((assignment: any) => (
                            <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                              <FileText className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">{assignment.title}</h4>
                                {assignment.description && (
                                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  {assignment.due_days && (
                                    <span>Due in {assignment.due_days} days</span>
                                  )}
                                  {assignment.max_points && (
                                    <span>Max points: {assignment.max_points}</span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline">Assignment</Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {sections.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Training Courses Available</h3>
            <p className="text-muted-foreground">
              Training courses will appear here once they are published by administrators.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
