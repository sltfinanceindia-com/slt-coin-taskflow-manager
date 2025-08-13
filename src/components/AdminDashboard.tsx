import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckSquare, Trophy, BookOpen } from 'lucide-react';
import { TaskManager } from '@/components/TaskManager';
import { InternManager } from '@/components/InternManager';
import { ProfileSettings } from '@/components/ProfileSettings';
import { TrainingAdmin } from '@/components/TrainingAdmin';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Manage interns, tasks, and system settings.
            </p>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-12 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="h-10 px-6 font-medium text-sm transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="interns" 
              className="h-10 px-6 font-medium text-sm transition-all duration-200"
            >
              Interns
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="h-10 px-6 font-medium text-sm transition-all duration-200"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="h-10 px-6 font-medium text-sm transition-all duration-200"
            >
              Training
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="h-10 px-6 font-medium text-sm transition-all duration-200"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Stats Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Total Interns
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">-</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Active interns in system
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Active Tasks
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">-</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Currently assigned
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Coins Distributed
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">-</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Total rewards given
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Training Modules
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">-</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Available modules
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Activity Card */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="px-6 py-6 border-b border-border">
                <CardTitle className="text-xl font-semibold text-foreground">
                  System Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-8">
                <div className="flex items-center justify-center min-h-[120px]">
                  <p className="text-muted-foreground text-center leading-relaxed">
                    No recent system activity to display.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tab Contents */}
          <TabsContent value="interns" className="mt-8">
            <InternManager />
          </TabsContent>

          <TabsContent value="tasks" className="mt-8">
            <TaskManager />
          </TabsContent>

          <TabsContent value="training" className="mt-8">
            <TrainingAdmin />
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
