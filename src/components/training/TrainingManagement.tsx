import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingCourses } from './TrainingCourses';
import { TrainingAnalytics } from './TrainingAnalytics';
import { TrainingProgressList } from './TrainingProgressList';
import { CertificatesList } from './CertificatesList';
import { AssessmentsList } from './AssessmentsList';
import { LayoutDashboard, BookOpen, BarChart, Award, ClipboardCheck } from 'lucide-react';

export function TrainingManagement() {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Training Management</h1>
        <p className="text-muted-foreground">Manage courses, track progress, and generate certificates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Certificates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <TrainingCourses />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <TrainingProgressList />
        </TabsContent>

        <TabsContent value="assessments" className="mt-6">
          <AssessmentsList />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <CertificatesList />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <TrainingAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
