import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkloadHeatmap } from './WorkloadHeatmap';
import { SkillsMatrix } from './SkillsMatrix';
import { Users, GraduationCap, BarChart3 } from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="workload" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Workload</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Skills Matrix</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workload" className="mt-0">
          <WorkloadHeatmap />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillsMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}
