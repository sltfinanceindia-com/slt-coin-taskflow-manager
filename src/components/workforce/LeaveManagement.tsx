import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveOverview } from './LeaveOverview';
import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveRequests } from './LeaveRequests';
import { LeaveBalances } from './LeaveBalances';
import { Calendar, FileText, Clock, Settings } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export const LeaveManagement: React.FC = () => {
  const { isAdmin } = useUserRole();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Leave Management</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Manage your leave requests and balances
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="apply" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Apply</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Requests</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="balances" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px]">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:inline">Balances</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <LeaveOverview />
        </TabsContent>

        <TabsContent value="apply">
          <LeaveRequestForm />
        </TabsContent>

        <TabsContent value="requests">
          <LeaveRequests />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="balances">
            <LeaveBalances />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
