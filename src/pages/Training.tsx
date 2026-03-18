import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { TrainingProgramsList } from '@/components/training/TrainingProgramsList';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';

export default function Training() {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch published training sections for interns
  const { data: sections = [], isLoading: sectionsLoading } = useTrainingSections(!!user);

  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin view - show training management
  if (isAdmin) {
    return (
      <StandalonePageLayout activeTab="training">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Training Management</h1>
        <TrainingManagement />
      </StandalonePageLayout>
    );
  }

  // Intern view - show training content
  return (
    <StandalonePageLayout activeTab="training">
      <TrainingHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2 text-xs sm:text-sm">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2 text-xs sm:text-sm">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
            Programs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <TrainingOverview sections={sections} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4 sm:space-y-6">
          <TrainingCourses sections={sections} isLoading={sectionsLoading} />
        </TabsContent>

        <TabsContent value="programs" className="space-y-4 sm:space-y-6">
          <TrainingProgramsList />
        </TabsContent>
      </Tabs>
    </StandalonePageLayout>
  );
}