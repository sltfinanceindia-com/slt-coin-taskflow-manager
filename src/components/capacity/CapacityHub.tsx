import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { WorkloadHeatmap } from './WorkloadHeatmap';
import { SkillsMatrix } from './SkillsMatrix';
import { WorkloadForecast } from './WorkloadForecast';
import { WhatIfScenarioBuilder } from './WhatIfScenarioBuilder';
import { ScenarioComparison } from './ScenarioComparison';
import { ResourceUtilizationChart } from './ResourceUtilizationChart';
import { CapacityGapAlert } from './CapacityGapAlert';
import { Users, GraduationCap, TrendingUp, FlaskConical, AlertTriangle, Download } from 'lucide-react';
import { useWorkload } from '@/hooks/useWorkload';
import { exportToCSV } from '@/lib/export';

export function CapacityHub() {
  const [activeTab, setActiveTab] = useState('workload');
  const { workloads } = useWorkload();

  const handleExportCapacity = () => {
    const exportData = workloads.map(w => ({
      employee: w.full_name,
      email: w.email,
      role: w.role,
      weekly_hours: w.weekly_hours,
      assigned_hours: w.assigned_hours,
      utilization: `${w.utilization}%`,
      task_count: w.task_count,
      status: w.status,
    }));

    exportToCSV(exportData, 'capacity_export', [
      { key: 'employee', label: 'Employee' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'weekly_hours', label: 'Weekly Hours' },
      { key: 'assigned_hours', label: 'Assigned Hours' },
      { key: 'utilization', label: 'Utilization' },
      { key: 'task_count', label: 'Tasks' },
      { key: 'status', label: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Capacity Planning</h1>
          <p className="text-muted-foreground">
            Monitor team workload, manage skills, and optimize resource allocation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCapacity}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="workload" className="gap-1.5 px-2 sm:px-3">
            <Users className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Load</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5 px-2 sm:px-3">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-1.5 px-2 sm:px-3">
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Cast</span>
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-1.5 px-2 sm:px-3">
            <FlaskConical className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">What-If</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5 px-2 sm:px-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workload" className="mt-0">
          <WorkloadHeatmap />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillsMatrix />
        </TabsContent>

        <TabsContent value="forecast" className="mt-0">
          <div className="space-y-6">
            <WorkloadForecast weeksToShow={12} />
            <ResourceUtilizationChart weeksToShow={12} showDetails />
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-0">
          <div className="space-y-6">
            <WhatIfScenarioBuilder />
            <ScenarioComparison />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <div className="space-y-6">
            <CapacityGapAlert overloadThreshold={100} weeksAhead={8} />
            <ResourceUtilizationChart weeksToShow={8} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
