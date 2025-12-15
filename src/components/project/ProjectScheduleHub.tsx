import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { TaskDependencyManager } from './TaskDependencyManager';
import { GanttChartView } from './GanttChartView';
import { CriticalPathView } from './CriticalPathView';
import { Calendar, Link2, Route, LayoutDashboard } from 'lucide-react';

export function ProjectScheduleHub() {
  const [activeTab, setActiveTab] = useState('gantt');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { projects, isLoading } = useEnhancedProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Schedule</h1>
          <p className="text-muted-foreground">
            Manage task dependencies, view Gantt charts, and track critical paths
          </p>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="gantt" className="gap-1.5 px-2 sm:px-3">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Gantt</span>
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="gap-1.5 px-2 sm:px-3">
            <Link2 className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Deps</span>
          </TabsTrigger>
          <TabsTrigger value="critical-path" className="gap-1.5 px-2 sm:px-3">
            <Route className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Critical</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="space-y-4 mt-0">
          <GanttChartView projectId={selectedProjectId || undefined} />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4 mt-0">
          <TaskDependencyManager projectId={selectedProjectId || undefined} />
        </TabsContent>

        <TabsContent value="critical-path" className="space-y-4 mt-0">
          <CriticalPathView projectId={selectedProjectId || undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
