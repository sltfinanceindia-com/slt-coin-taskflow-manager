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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Time & Attendance</h2>
        <p className="text-muted-foreground">
          Clock in/out with location tracking
        </p>
      </div>

      <Tabs defaultValue="clock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="clock" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Clock In/Out</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

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
