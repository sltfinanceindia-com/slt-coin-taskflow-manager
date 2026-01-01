import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, ChevronLeft } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';

export default function Training() {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gradient-background">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/dashboard');
              }}
              className="flex items-center gap-2 self-start"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Training Management</h1>
          </div>
          <TrainingManagement />
        </div>
      </div>
    );
  }

  // Intern view - show training content
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/dashboard');
            }}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
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
    </div>
  );
}
