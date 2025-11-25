
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, BookOpen, FileText, BarChart3, Users, Sparkles } from 'lucide-react';
import { AssessmentManagement } from '@/components/assessment/AssessmentManagement';
import { TrainingAnalytics } from '@/components/training/TrainingAnalytics';
import { UserManagement } from '@/components/training/UserManagement';

export function TrainingManagement() {
  const [activeTab, setActiveTab] = useState('sections');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Management</h1>
          <p className="text-muted-foreground">
            Manage training content, assessments, and track learner progress.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">
          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Training Sections</CardTitle>
                  <CardDescription>
                    Create and manage training sections with videos and assignments.
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Sparkles}
                title="Coming Soon"
                description="Training section management is under development. You'll be able to create and manage training sections, upload videos, and assign courses to interns."
                actionLabel="Notify Me"
                onAction={() => {
                  // Placeholder for notification feature
                }}
              />
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
