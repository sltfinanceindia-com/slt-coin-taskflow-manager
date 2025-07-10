import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, FileText } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { UIUXExamPopup } from '@/components/UIUXExamPopup';
import { useUIUXExams } from '@/hooks/useUIUXExams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Training() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [examPopupOpen, setExamPopupOpen] = useState(false);

  // Fetch published training sections for interns
  const { data: sections = [], isLoading } = useTrainingSections(!!user);
  
  // Fetch active exam for interns
  const { activeExam, isLoadingActiveExam, userAttempts } = useUIUXExams();

  // Check if user has an active exam and hasn't completed it
  useEffect(() => {
    if (profile?.role === 'intern' && activeExam && !isLoadingActiveExam) {
      // Check if user has already completed this exam
      const hasCompleted = userAttempts.some(
        attempt => attempt.exam_id === activeExam.id && attempt.completed_at
      );
      
      if (!hasCompleted) {
        setExamPopupOpen(true);
      }
    }
  }, [profile?.role, activeExam, isLoadingActiveExam, userAttempts]);

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

  // Intern view - show training content
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <TrainingHeader />

        {/* Active Exam Notice for Interns */}
        {profile?.role === 'intern' && activeExam && !isLoadingActiveExam && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                UI/UX Exam Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                There's an active UI/UX exam ready for you to take: <strong>{activeExam.title}</strong>
              </p>
              <Button 
                onClick={() => setExamPopupOpen(true)}
                className="w-full sm:w-auto"
              >
                Take Exam
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TrainingOverview sections={sections} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <TrainingCourses sections={sections} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* UI/UX Exam Popup for Interns */}
        {activeExam && (
          <UIUXExamPopup
            open={examPopupOpen}
            onOpenChange={setExamPopupOpen}
            exam={activeExam}
          />
        )}
      </div>
    </div>
  );
}