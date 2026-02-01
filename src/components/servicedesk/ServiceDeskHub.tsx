/**
 * Service Desk Hub
 * Main interface for ITSM ticketing system
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useServiceDesk, TicketStatus, TicketType, TicketPriority } from '@/hooks/useServiceDesk';
import { TicketList } from './TicketList';
import { TicketMetrics } from './TicketMetrics';
import { TicketForm } from './TicketForm';
import { SLARulesConfig } from './SLARulesConfig';
import { TicketAnalytics } from './TicketAnalytics';
import { 
  Plus, 
  Ticket, 
  BarChart3,
  Settings,
  RefreshCw,
} from 'lucide-react';

export function ServiceDeskHub() {
  const [activeTab, setActiveTab] = useState('queue');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<{
    status?: TicketStatus[];
    type?: TicketType[];
    priority?: TicketPriority[];
  }>({});

  const { tickets, metrics, isLoading, refetch } = useServiceDesk(filters);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Desk</h1>
          <p className="text-muted-foreground">Manage incidents, requests, and changes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <TicketMetrics metrics={metrics} onFilterChange={setFilters} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue" className="gap-2">
            <Ticket className="h-4 w-4" />
            Ticket Queue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="sla-rules" className="gap-2">
            <Settings className="h-4 w-4" />
            SLA Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <TicketList 
            tickets={tickets} 
            isLoading={isLoading}
            filters={filters}
            onFilterChange={setFilters}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <TicketAnalytics metrics={metrics} tickets={tickets} />
        </TabsContent>

        <TabsContent value="sla-rules" className="mt-4">
          <SLARulesConfig />
        </TabsContent>
      </Tabs>

      {/* Create Ticket Dialog */}
      <TicketForm 
        open={showCreateForm} 
        onOpenChange={setShowCreateForm}
      />
    </div>
  );
}

export default ServiceDeskHub;
