import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkloadHeatmap } from './WorkloadHeatmap';
import { SkillsMatrix } from './SkillsMatrix';
import { WorkloadForecast } from './WorkloadForecast';
import { WhatIfScenarioBuilder } from './WhatIfScenarioBuilder';
import { ScenarioComparison } from './ScenarioComparison';
import { ResourceUtilizationChart } from './ResourceUtilizationChart';
import { CapacityGapAlert } from './CapacityGapAlert';
import { Users, GraduationCap, TrendingUp, FlaskConical, AlertTriangle } from 'lucide-react';

export function CapacityHub() {
  const [activeTab, setActiveTab] = useState('workload');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Capacity Planning</h1>
        <p className="text-muted-foreground">
          Monitor team workload, manage skills, and optimize resource allocation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="workload" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Workload</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Forecast</span>
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Scenarios</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
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
