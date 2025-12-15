import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestPortal } from './RequestPortal';
import { TriageQueue } from './TriageQueue';
import { SLADashboard } from './SLADashboard';
import { RoutingRulesConfig } from './RoutingRulesConfig';
import { useUserRole } from '@/hooks/useUserRole';
import { FileText, Inbox, BarChart3, Settings2 } from 'lucide-react';

export function RequestHub() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'triage' : 'submit');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Requests</h1>
        <p className="text-muted-foreground">
          Submit and manage work requests across your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-1'} lg:w-auto lg:inline-grid`}>
          <TabsTrigger value="submit" className="gap-1.5 px-2 sm:px-3">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Submit</span>
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="triage" className="gap-1.5 px-2 sm:px-3">
                <Inbox className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm truncate">Triage</span>
              </TabsTrigger>
              <TabsTrigger value="sla" className="gap-1.5 px-2 sm:px-3">
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm truncate">SLA</span>
              </TabsTrigger>
              <TabsTrigger value="routing" className="gap-1.5 px-2 sm:px-3">
                <Settings2 className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm truncate">Rules</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="submit" className="mt-0">
          <RequestPortal />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="triage" className="mt-0">
              <TriageQueue />
            </TabsContent>
            <TabsContent value="sla" className="mt-0">
              <SLADashboard />
            </TabsContent>
            <TabsContent value="routing" className="mt-0">
              <RoutingRulesConfig />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
