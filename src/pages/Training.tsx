
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, Clock } from 'lucide-react';
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { TrainingHeader } from '@/components/training/TrainingHeader';
import { TrainingOverview } from '@/components/training/TrainingOverview';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { LoadingSpinner } from '@/components/training/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';

export default function Training() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch published training sections for interns
  const { data: sections = [], isLoading: sectionsLoading } = useTrainingSections(!!user);

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
            <TrainingCourses sections={sections} isLoading={sectionsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
