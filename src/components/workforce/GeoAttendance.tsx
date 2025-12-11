import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceClockIn } from './AttendanceClockIn';
import { AttendanceHistory } from './AttendanceHistory';
import { AttendanceSettings } from './AttendanceSettings';
import { AttendanceDashboard } from './AttendanceDashboard';
import { Clock, History, Settings, BarChart3 } from 'lucide-react';

export const GeoAttendance: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Time & Attendance</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Clock in/out with location tracking
        </p>
      </div>

      <Tabs defaultValue="clock" className="space-y-4">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="clock" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px]">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Clock</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px]">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">History</span>
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="dashboard" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px]">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px]">
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">Settings</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="clock">
          <AttendanceClockIn />
        </TabsContent>

        <TabsContent value="history">
          <AttendanceHistory />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="dashboard">
              <AttendanceDashboard />
            </TabsContent>
            <TabsContent value="settings">
              <AttendanceSettings />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};
