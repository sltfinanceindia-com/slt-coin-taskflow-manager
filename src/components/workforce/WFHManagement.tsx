import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { WFHRequestForm } from './WFHRequestForm';
import { WFHRequests } from './WFHRequests';
import { WFHCalendar } from './WFHCalendar';
import { WFHPolicySettings } from './WFHPolicySettings';
import { Home, Calendar, FileText, Settings } from 'lucide-react';

export const WFHManagement: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Work From Home</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Request and manage WFH days
        </p>
      </div>

      <Tabs defaultValue="request" className="space-y-4">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="request" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Request</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Calendar</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="policy" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:inline">Policy</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="request">
          <WFHRequestForm />
        </TabsContent>

        <TabsContent value="history">
          <WFHRequests />
        </TabsContent>

        <TabsContent value="calendar">
          <WFHCalendar />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="policy">
            <WFHPolicySettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
