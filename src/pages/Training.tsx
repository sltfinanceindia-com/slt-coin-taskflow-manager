import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Training() {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

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
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-background">
          <AppSidebar activeTab="training" onTabChange={() => {}} />
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader />
            <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0">
              <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
                <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Training Management</h1>
                <TrainingManagement />
              </div>
            </main>
            {isMobile && <BottomNavigation variant="private" activeTab="training" onTabChange={() => {}} />}
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Intern view - show training content
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab="training" onTabChange={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
              <TrainingHeader />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center gap-2 text-xs sm:text-sm">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                    Courses
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                  <TrainingOverview sections={sections} />
                </TabsContent>

                <TabsContent value="courses" className="space-y-4 sm:space-y-6">
                  <TrainingCourses sections={sections} isLoading={sectionsLoading} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
          {isMobile && <BottomNavigation variant="private" activeTab="training" onTabChange={() => {}} />}
        </div>
      </div>
    </SidebarProvider>
  );
}