import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Users, ArrowLeftRight } from 'lucide-react';
import { ShiftScheduler } from './ShiftScheduler';
import { ShiftTypeManager } from './ShiftTypeManager';
import { ShiftSwapRequests } from './ShiftSwapRequests';
import { ShiftOverview } from './ShiftOverview';

export function ShiftManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
        <p className="text-muted-foreground">
          Create schedules, assign shifts, and manage swap requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="shifts" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Shift Types</span>
          </TabsTrigger>
          <TabsTrigger value="swaps" className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Swap Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ShiftOverview />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <ShiftScheduler />
        </TabsContent>

        <TabsContent value="shifts" className="space-y-6">
          <ShiftTypeManager />
        </TabsContent>

        <TabsContent value="swaps" className="space-y-6">
          <ShiftSwapRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
