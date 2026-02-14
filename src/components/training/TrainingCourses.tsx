import { useTrainingSections } from '@/hooks/useTrainingSections';
import { useAssessments } from '@/hooks/useAssessments';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Play, FileText, BookOpen, Award, Clock, CheckCircle, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrainingSection } from '@/types/training';

interface TrainingCoursesProps {
  sections?: TrainingSection[];
  isLoading?: boolean;
}

export function TrainingCourses({ sections: propSections, isLoading: propIsLoading }: TrainingCoursesProps) {
  const navigate = useNavigate();
  const { data: hookSections = [], isLoading: hookIsLoading } = useTrainingSections();
  const { assessments } = useAssessments();
  const { calculateSectionProgress: calcProgress, isVideoCompleted } = useTrainingProgress();
  
  // Use props if provided, otherwise use hook data
  const sections = propSections || hookSections;
  const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;

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

  // Calculate real progress based on training_video_progress data
  const calculateSectionProgress = (section: TrainingSection) => {
    const sectionVideos = section.training_videos || [];
    if (sectionVideos.length === 0) return 0;
    
    const videoIds = sectionVideos.map((v: any) => v.id);
    const progress = calcProgress(section.id, videoIds);
    return progress.progressPercent;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Assessment Section */}
      {publishedAssessments.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Assessments & Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid gap-3 sm:gap-4">
              {publishedAssessments.map((assessment) => (
                <div 
                  key={assessment.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{assessment.title}</h3>
                    {assessment.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{assessment.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        {assessment.time_limit_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        {assessment.total_questions} Q
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                        {assessment.passing_score}%
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleTakeAssessment(assessment.id)}
                    className="w-full sm:w-auto min-h-[40px] text-xs sm:text-sm"
                    size="sm"
                  >
                    Start Assessment
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Sections */}
      <div className="grid gap-4 sm:gap-6">
        {sections.map((section) => {
          const progress = calculateSectionProgress(section);
          const sectionVideos = section.training_videos || [];
          const sectionAssignments = section.training_assignments || [];
          const totalItems = sectionVideos.length + sectionAssignments.length;
          
          return (
            <Card key={section.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </CardTitle>
                    {section.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{section.description}</p>
                    )}
                  </div>
                  <Badge 
                    variant={section.is_published ? "default" : "secondary"}
                    className="self-start text-xs"
                  >
                    {section.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" aria-label={`Course progress: ${progress}%`} />
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
                            <button
                              key={video.id}
                              className="w-full flex items-center gap-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all text-left group"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Play className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">{video.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {video.duration_minutes && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {video.duration_minutes} min
                                    </span>
                                  )}
                                  <Badge variant="outline" className="text-xs">Video</Badge>
                                </div>
                              </div>
                              {isVideoCompleted(video.id) ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                          ))}
                          
                          {/* Assignments */}
                          {sectionAssignments.map((assignment: any) => (
                            <button
                              key={assignment.id}
                              className="w-full flex items-center gap-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all text-left group"
                            >
                              <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                <FileText className="h-4 w-4 text-amber-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{assignment.title}</h4>
                                {assignment.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">{assignment.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                  {assignment.due_days && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Due in {assignment.due_days} days
                                    </span>
                                  )}
                                  {assignment.max_points && (
                                    <span className="flex items-center gap-1">
                                      <Award className="h-3 w-3" />
                                      {assignment.max_points} pts
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="flex-shrink-0">Assignment</Badge>
                            </button>
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

      {sections.length === 0 && publishedAssessments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No Training Courses Available</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Training courses will appear here once they are published by administrators.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
