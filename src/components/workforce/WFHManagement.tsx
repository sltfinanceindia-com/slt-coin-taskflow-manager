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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Work From Home</h2>
        <p className="text-muted-foreground">
          Request and manage WFH days
        </p>
      </div>

      <Tabs defaultValue="request" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="request" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Request</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="policy" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Policy</span>
            </TabsTrigger>
          )}
        </TabsList>

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
