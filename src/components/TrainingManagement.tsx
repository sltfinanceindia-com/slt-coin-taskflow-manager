
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, FileText, BarChart3, Users } from 'lucide-react';
import { AssessmentManagement } from '@/components/assessment/AssessmentManagement';
import { TrainingAnalytics } from '@/components/training/TrainingAnalytics';
import { UserManagement } from '@/components/training/UserManagement';

export function TrainingManagement() {
  const [activeTab, setActiveTab] = useState('sections');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Training Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage training content, assessments, and track learner progress.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 gap-1">
            <TabsTrigger value="sections" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 min-h-[44px]">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sections</span>
              <span className="sm:hidden">Sec</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 min-h-[44px]">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Assessments</span>
              <span className="sm:hidden">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 min-h-[44px]">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 min-h-[44px]">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Users
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sections" className="space-y-4 sm:space-y-6">
          <Card className="card-gradient">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Training Sections</CardTitle>
                  <CardDescription className="text-sm">
                    Create and manage training sections with videos and assignments.
                  </CardDescription>
                </div>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Training section management will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <AssessmentManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <TrainingAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
