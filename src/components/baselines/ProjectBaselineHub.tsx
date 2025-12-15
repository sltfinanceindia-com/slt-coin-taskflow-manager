import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaselineManager } from './BaselineManager';
import { VarianceDashboard } from './VarianceDashboard';
import { EarnedValueChart } from './EarnedValueChart';
import { ProjectHealthScorecard } from './ProjectHealthScorecard';
import { BaselineComparisonChart } from './BaselineComparisonChart';
import { GitBranch, TrendingUp, Activity, Heart, BarChart3, FolderOpen } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function ProjectBaselineHub() {
  const [activeTab, setActiveTab] = useState('baselines');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { projects, isLoading } = useProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Baselines & Variance</h1>
        <p className="text-muted-foreground">
          Track project performance against baselines with earned value metrics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="baselines" className="gap-1.5 px-2 sm:px-3">
            <GitBranch className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Base</span>
          </TabsTrigger>
          <TabsTrigger value="variance" className="gap-1.5 px-2 sm:px-3">
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Var</span>
          </TabsTrigger>
          <TabsTrigger value="earned-value" className="gap-1.5 px-2 sm:px-3">
            <Activity className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">EV</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5 px-2 sm:px-3">
            <Heart className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Health</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1.5 px-2 sm:px-3">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Comp</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="baselines" className="mt-0">
          <BaselineManager />
        </TabsContent>

        <TabsContent value="variance" className="mt-0">
          <VarianceDashboard />
        </TabsContent>

        <TabsContent value="earned-value" className="mt-0">
          <div className="space-y-4">
            <div className="w-full sm:w-64">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProjectId ? (
              <EarnedValueChart projectId={selectedProjectId} />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                    <p className="text-muted-foreground">
                      Choose a project above to view earned value metrics
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-0">
          <ProjectHealthScorecard />
        </TabsContent>

        <TabsContent value="comparison" className="mt-0">
          <BaselineComparisonChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
