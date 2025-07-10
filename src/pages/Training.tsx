
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, GraduationCap, Clock, Award } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { useUIUXExams } from '@/hooks/useUIUXExams';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { UIUXExamPopup } from '@/components/UIUXExamPopup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Training() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examPopupOpen, setExamPopupOpen] = useState(false);

  // Fetch published training sections for interns
  const { data: sections = [], isLoading: sectionsLoading } = useTrainingSections(!!user);
  
  // Fetch UI/UX exams
  const { 
    exams, 
    attempts, 
    isLoading: examsLoading, 
    startExam, 
    isStarting,
    submitExam,
    isSubmitting 
  } = useUIUXExams();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin view - show training management
  if (profile?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-background">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <TrainingManagement />
        </div>
      </div>
    );
  }

  const handleStartExam = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    // Check if user already has an attempt for this exam
    const existingAttempt = attempts.find(a => a.exam_id === examId && !a.completed_at);
    
    if (existingAttempt) {
      // Resume existing attempt
      setSelectedExam({ exam, attempt: existingAttempt });
      setExamPopupOpen(true);
    } else {
      // Start new attempt - just set the exam and let the popup handle the creation
      setSelectedExam({ exam, attempt: null });
      setExamPopupOpen(true);
    }
  };

  const handleExamClick = (exam: any) => {
    const userAttempt = attempts.find(a => a.exam_id === exam.id);
    
    if (userAttempt?.completed_at) {
      // Show completed exam results
      setSelectedExam({ exam, attempt: userAttempt });
      setExamPopupOpen(true);
    } else if (userAttempt && !userAttempt.completed_at) {
      // Resume in-progress exam
      setSelectedExam({ exam, attempt: userAttempt });
      setExamPopupOpen(true);
    } else {
      // Start new exam
      setSelectedExam({ exam, attempt: null });
      setExamPopupOpen(true);
    }
  };

  const getExamStatus = (examId: string) => {
    const attempt = attempts.find(a => a.exam_id === examId);
    if (!attempt) return 'not_started';
    if (attempt.completed_at) return 'completed';
    return 'in_progress';
  };

  // Intern view - show training content
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <TrainingHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              UI/UX Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TrainingOverview sections={sections} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <TrainingCourses sections={sections} isLoading={sectionsLoading} />
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <div className="grid gap-6">
              {examsLoading ? (
                <LoadingSpinner />
              ) : exams.length === 0 ? (
                <Card className="card-gradient">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No exams available</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      UI/UX exams are being prepared for you. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                exams.map((exam) => {
                  const status = getExamStatus(exam.id);
                  const attempt = attempts.find(a => a.exam_id === exam.id && a.completed_at);
                  
                  return (
                    <Card key={exam.id} className="card-gradient hover-scale cursor-pointer" onClick={() => handleExamClick(exam)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{exam.title}</CardTitle>
                              <CardDescription className="mt-1">{exam.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {status === 'completed' && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                            {status === 'in_progress' && (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                            {status === 'not_started' && (
                              <Badge variant="secondary">Not Started</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {exam.questions?.length || 0} questions
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="text-sm">
                              {exam.time_limit_minutes} minutes
                            </span>
                          </div>
                          {attempt && (
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-secondary" />
                              <span className="text-sm">
                                Score: {attempt.score}/{attempt.total_questions}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExamClick(exam);
                          }}
                        >
                          {status === 'completed' ? 'View Results' : 
                           status === 'in_progress' ? 'Continue Exam' : 'Start Exam'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Exam Popup */}
      <UIUXExamPopup
        exam={selectedExam?.exam || null}
        attempt={selectedExam?.attempt || null}
        open={examPopupOpen}
        onOpenChange={setExamPopupOpen}
        onStartExam={startExam}
        onSubmitExam={submitExam}
        isStarting={isStarting}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
