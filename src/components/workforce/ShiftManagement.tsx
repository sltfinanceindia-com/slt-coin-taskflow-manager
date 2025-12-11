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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Shift Management</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Create schedules, assign shifts, and manage swap requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="overview" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Shifts</span>
            </TabsTrigger>
            <TabsTrigger value="swaps" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <ArrowLeftRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Swaps</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <ShiftOverview />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
          <ShiftScheduler />
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4 sm:space-y-6">
          <ShiftTypeManager />
        </TabsContent>

        <TabsContent value="swaps" className="space-y-4 sm:space-y-6">
          <ShiftSwapRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
