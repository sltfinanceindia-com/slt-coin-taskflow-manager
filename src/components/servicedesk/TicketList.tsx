/**
 * Ticket List
 * Filterable queue of service tickets with SLA indicators
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceTicket, TicketStatus, TicketType, TicketPriority } from '@/hooks/useServiceDesk';
import { SLATracker } from './SLATracker';
import { TicketDetail } from './TicketDetail';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';

interface TicketListProps {
  tickets: ServiceTicket[];
  isLoading: boolean;
  filters: {
    status?: TicketStatus[];
    type?: TicketType[];
    priority?: TicketPriority[];
  };
  onFilterChange: (filters: any) => void;
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const typeOptions: { value: TicketType; label: string }[] = [
  { value: 'incident', label: 'Incident' },
  { value: 'request', label: 'Service Request' },
  { value: 'change', label: 'Change' },
  { value: 'problem', label: 'Problem' },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const priorityColors: Record<TicketPriority, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-500',
  in_progress: 'bg-indigo-500',
  pending: 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
  cancelled: 'bg-gray-400',
};

export function TicketList({ tickets, isLoading, filters, onFilterChange }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.ticket_number.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ticket Queue</CardTitle>
            <Badge variant="secondary">{filteredTickets.length} tickets</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => onFilterChange({ 
                ...filters, 
                status: value === 'all' ? undefined : [value as TicketStatus] 
              })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type?.[0] || 'all'}
              onValueChange={(value) => onFilterChange({ 
                ...filters, 
                type: value === 'all' ? undefined : [value as TicketType] 
              })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority?.[0] || 'all'}
              onValueChange={(value) => onFilterChange({ 
                ...filters, 
                priority: value === 'all' ? undefined : [value as TicketPriority] 
              })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket List */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No tickets found</p>
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    {/* Status Indicator */}
                    <div className={cn("w-1 h-full min-h-[60px] rounded-full", statusColors[ticket.status])} />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {ticket.ticket_number}
                            </span>
                            {ticket.is_major_incident && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Major
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium line-clamp-1">{ticket.title}</h4>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="capitalize">
                          {ticket.ticket_type}
                        </Badge>
                        <span className={cn("px-2 py-0.5 rounded-full font-medium", priorityColors[ticket.priority])}>
                          {ticket.priority}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="capitalize text-muted-foreground">
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {ticket.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{ticket.assignee.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(ticket.created_at), 'MMM d, HH:mm')}</span>
                          </div>
                        </div>
                        
                        {/* SLA Status */}
                        <SLATracker ticket={ticket} compact />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ticket Detail Drawer */}
      <TicketDetail 
        ticket={selectedTicket} 
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </>
  );
}
