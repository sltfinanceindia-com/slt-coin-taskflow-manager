import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayrollDashboard } from './PayrollDashboard';
import { PayslipsList } from './PayslipsList';
import { BulkPayrollProcessor } from './BulkPayrollProcessor';
import { AutomatedPayrollProcessor } from './AutomatedPayrollProcessor';
import { LayoutDashboard, FileText, Users, Zap } from 'lucide-react';

export function PayrollManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="payslips" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Payslips</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Process</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Automation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <PayrollDashboard />
        </TabsContent>

        <TabsContent value="payslips" className="mt-6">
          <PayslipsList />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkPayrollProcessor />
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <AutomatedPayrollProcessor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
