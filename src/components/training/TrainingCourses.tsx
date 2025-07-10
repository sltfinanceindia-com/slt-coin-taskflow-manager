import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, Award, Clock, GraduationCap, Trophy, AlertCircle } from 'lucide-react';
import { TrainingSection } from '@/types/training';
import { useTrainingAssessments } from '@/hooks/useTrainingAssessments';
import { AssessmentTaker } from './AssessmentTaker';
import { useState } from 'react';

interface TrainingCoursesProps {
  sections: TrainingSection[];
  isLoading: boolean;
}

export function TrainingCourses({ sections, isLoading }: TrainingCoursesProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const { submitAttempt } = useTrainingAssessments();

  const SectionWithAssessments = ({ section }: { section: TrainingSection }) => {
    const { assessments, attempts, startAttempt, submitAttempt, isStarting } = useTrainingAssessments(section.id);
    
    const handleStartAssessment = async (assessment: any) => {
      try {
        const attempt = await startAttempt({ assessmentId: assessment.id });
        setSelectedAssessment(assessment);
        setSelectedAttempt(attempt);
        setIsAssessmentOpen(true);
      } catch (error) {
        console.error('Failed to start assessment:', error);
      }
    };

    const handleSubmitAssessment = async (answers: any, score: number) => {
      if (!selectedAttempt) return;
      
      try {
        await submitAttempt({
          attemptId: selectedAttempt.id,
          answers,
          score
        });
        setSelectedAssessment(null);
        setSelectedAttempt(null);
      } catch (error) {
        console.error('Failed to submit assessment:', error);
      }
    };

    const getAttemptStatus = (assessmentId: string) => {
      const userAttempts = attempts.filter(a => a.assessment_id === assessmentId);
      if (userAttempts.length === 0) return { status: 'not_started', attempts: 0 };
      
      const lastAttempt = userAttempts[0];
      const totalAttempts = userAttempts.length;
      
      if (lastAttempt.completed_at) {
        return { 
          status: lastAttempt.is_passed ? 'passed' : 'failed', 
          attempts: totalAttempts,
          score: lastAttempt.score,
          maxScore: lastAttempt.max_score
        };
      }
      
      return { status: 'in_progress', attempts: totalAttempts };
    };

    return (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              <GraduationCap className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                {assessments.length || 0} exam{assessments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm">
                {section.videos?.reduce((acc, video) => acc + (video.duration_minutes || 0), 0) || 0} minutes
              </span>
            </div>
          </div>
          
          {/* Assessments Section */}
          {assessments.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Available Exams
              </h4>
              <div className="grid gap-3">
                {assessments.map((assessment) => {
                  const status = getAttemptStatus(assessment.id);
                  const canRetake = !assessment.max_attempts || status.attempts < assessment.max_attempts;
                  
                  return (
                    <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{assessment.title}</h5>
                          {status.status === 'passed' && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Passed
                            </Badge>
                          )}
                          {status.status === 'failed' && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                          {status.status === 'in_progress' && (
                            <Badge variant="outline">In Progress</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{assessment.description}</p>
                        {status.status !== 'not_started' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Attempts: {status.attempts}/{assessment.max_attempts || '∞'}
                            {status.score !== undefined && ` • Score: ${status.score}/${status.maxScore}`}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {status.status === 'not_started' || (status.status === 'failed' && canRetake) ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartAssessment(assessment)}
                            disabled={isStarting}
                          >
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {status.status === 'not_started' ? 'Start Exam' : 'Retake'}
                          </Button>
                        ) : status.status === 'in_progress' ? (
                          <Button size="sm" variant="outline" disabled>
                            In Progress
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            {status.status === 'passed' ? 'Completed' : 'Max Attempts'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
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
    );
  };
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
    <>
      <div className="grid gap-6">
        {sections.map((section) => (
          <SectionWithAssessments key={section.id} section={section} />
        ))}
      </div>
      
      {/* Assessment Dialog */}
      {selectedAssessment && (
        <AssessmentTaker
          assessment={selectedAssessment}
          attempt={selectedAttempt}
          open={isAssessmentOpen}
          onOpenChange={setIsAssessmentOpen}
          onSubmit={async (answers, score) => {
            if (!selectedAttempt) return;
            
            try {
              await submitAttempt({
                attemptId: selectedAttempt.id,
                answers,
                score
              });
              setSelectedAssessment(null);
              setSelectedAttempt(null);
            } catch (error) {
              console.error('Failed to submit assessment:', error);
            }
          }}
        />
      )}
    </>
  );
}