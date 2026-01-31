/**
 * My Work Center
 * Unified workspace showing all assigned items
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMyWork, WorkItemType, MyWorkFilters } from '@/hooks/useMyWork';
import { WorkItemCard } from './WorkItemCard';
import { WorkItemFilters } from './WorkItemFilters';
import { QuickActionPanel } from './QuickActionPanel';
import { 
  CheckSquare, 
  Inbox, 
  Ticket, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Activity,
} from 'lucide-react';

export function MyWorkCenter() {
  const [filters, setFilters] = useState<MyWorkFilters>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { items, summary, isLoading, refetch } = useMyWork(filters);

  const typeIcons: Record<WorkItemType, typeof CheckSquare> = {
    task: CheckSquare,
    request: Inbox,
    ticket: Ticket,
    approval: Clock,
    meeting: Calendar,
  };

  const handleFilterChange = (newFilters: Partial<MyWorkFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Work</h1>
          <p className="text-muted-foreground">All your assigned items in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            {summary.total} items
          </Badge>
          {summary.overdue > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summary.overdue} overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleFilterChange({ period: 'overdue' })}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleFilterChange({ period: 'today' })}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.today}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleFilterChange({ period: 'this_week' })}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.thisWeek}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleFilterChange({ showBlocked: true })}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.blocked}</p>
                <p className="text-xs text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleClearFilters()}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <WorkItemFilters 
        filters={filters} 
        onChange={handleFilterChange} 
        onClear={handleClearFilters}
        summary={summary}
      />

      {/* Work Items */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Work Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="border-b px-4">
                  <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
                    <TabsTrigger 
                      value="all" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      onClick={() => handleFilterChange({ types: undefined })}
                    >
                      All ({summary.total})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tasks"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      onClick={() => handleFilterChange({ types: ['task'] })}
                    >
                      Tasks ({summary.byType.task})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="requests"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      onClick={() => handleFilterChange({ types: ['request'] })}
                    >
                      Requests ({summary.byType.request})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tickets"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      onClick={() => handleFilterChange({ types: ['ticket'] })}
                    >
                      Tickets ({summary.byType.ticket})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="approvals"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      onClick={() => handleFilterChange({ types: ['approval'] })}
                    >
                      Approvals ({summary.byType.approval})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {items.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          No work items match your current filters
                        </p>
                      </div>
                    ) : (
                      items.map(item => (
                        <WorkItemCard
                          key={`${item.type}-${item.id}`}
                          item={item}
                          isSelected={selectedItem === item.id}
                          onSelect={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                          onActionComplete={refetch}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1">
          <QuickActionPanel 
            selectedItemId={selectedItem}
            items={items}
            onActionComplete={refetch}
          />
        </div>
      </div>
    </div>
  );
}

export default MyWorkCenter;
