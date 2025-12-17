import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { useTasks } from '@/hooks/useTasks';
import { TaskDependencyManager } from './TaskDependencyManager';
import { GanttChartView } from './GanttChartView';
import { CriticalPathView } from './CriticalPathView';
import { Calendar, Link2, Route, Download } from 'lucide-react';
import { exportToCSV, formatDateForExport } from '@/lib/export';

export function ProjectScheduleHub() {
  const [activeTab, setActiveTab] = useState('gantt');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const { projects, isLoading } = useEnhancedProjects();
  const { tasks } = useTasks();

  const filteredTasks = selectedProjectId === 'all' 
    ? tasks 
    : tasks.filter(t => t.project_id === selectedProjectId);

  const handleExportSchedule = () => {
    const exportData = filteredTasks.map(task => ({
      title: task.title,
      status: task.status,
      start_date: formatDateForExport(task.start_date),
      end_date: formatDateForExport(task.end_date),
      assigned_to: task.assigned_profile?.full_name || 'Unassigned',
      project: projects.find(p => p.id === task.project_id)?.name || 'No Project',
      priority: task.priority,
      estimated_hours: task.estimated_hours || 0,
    }));

    exportToCSV(exportData, 'schedule_export', [
      { key: 'title', label: 'Task' },
      { key: 'status', label: 'Status' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'assigned_to', label: 'Assigned To' },
      { key: 'project', label: 'Project' },
      { key: 'priority', label: 'Priority' },
      { key: 'estimated_hours', label: 'Est. Hours' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Schedule</h1>
          <p className="text-muted-foreground">
            Manage task dependencies, view Gantt charts, and track critical paths
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExportSchedule} title="Export Schedule">
            <Download className="h-4 w-4" />
          </Button>
        </div>
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
          <GanttChartView projectId={selectedProjectId === 'all' ? undefined : selectedProjectId} />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4 mt-0">
          <TaskDependencyManager projectId={selectedProjectId === 'all' ? undefined : selectedProjectId} />
        </TabsContent>

        <TabsContent value="critical-path" className="space-y-4 mt-0">
          <CriticalPathView projectId={selectedProjectId === 'all' ? undefined : selectedProjectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
