import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LeaveOverview } from './LeaveOverview';
import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveRequests } from './LeaveRequests';
import { LeaveBalances } from './LeaveBalances';
import { Calendar, FileText, Clock, Settings } from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
        <p className="text-muted-foreground">
          Manage your leave requests and balances
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Apply</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Requests</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Balances</span>
            </TabsTrigger>
          )}
        </TabsList>

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
