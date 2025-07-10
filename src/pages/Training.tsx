
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { useUIUXExams } from '@/hooks/useUIUXExams';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { UIUXExamPopup } from '@/components/UIUXExamPopup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Training() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isExamPopupOpen, setIsExamPopupOpen] = useState(false);

  // Fetch published training sections for interns
  const { data: sections = [], isLoading: sectionsLoading } = useTrainingSections(!!user);
  const { exams, getBestScore, getLatestAttempt, isLoading: examsLoading } = useUIUXExams();

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

  const handleStartExam = (exam: any) => {
    setSelectedExam(exam);
    setIsExamPopupOpen(true);
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
              Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TrainingOverview sections={sections} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <TrainingCourses sections={sections} isLoading={sectionsLoading} />
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Available Exams</h2>
                <p className="text-muted-foreground">
                  Test your knowledge with our comprehensive UI/UX exams
                </p>
              </div>

              {examsLoading ? (
                <LoadingSpinner />
              ) : exams.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Exams Available</h3>
                    <p className="text-muted-foreground">
                      Check back later for new exams and assessments.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {exams.map((exam) => {
                    const bestScore = getBestScore(exam.id);
                    const latestAttempt = getLatestAttempt(exam.id);
                    const hasAttempted = latestAttempt !== null;

                    return (
                      <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{exam.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {exam.description}
                              </CardDescription>
                            </div>
                            {bestScore !== null && (
                              <Badge variant={bestScore >= 70 ? "default" : "secondary"}>
                                {bestScore}%
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Questions:</span>
                                <div>{Array.isArray(exam.questions) ? exam.questions.length : 0}</div>
                              </div>
                              <div>
                                <span className="font-medium">Time Limit:</span>
                                <div>{exam.time_limit_minutes} min</div>
                              </div>
                            </div>

                            {hasAttempted && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Last attempt:</span> {' '}
                                {new Date(latestAttempt.started_at).toLocaleDateString()}
                              </div>
                            )}

                            <Button 
                              onClick={() => handleStartExam(exam)}
                              className="w-full"
                              variant={hasAttempted ? "outline" : "default"}
                            >
                              {hasAttempted ? 'Retake Exam' : 'Start Exam'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <UIUXExamPopup
          exam={selectedExam}
          isOpen={isExamPopupOpen}
          onClose={() => {
            setIsExamPopupOpen(false);
            setSelectedExam(null);
          }}
        />
      </div>
    </div>
  );
}
