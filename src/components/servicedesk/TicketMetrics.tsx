/**
 * Ticket Metrics
 * Summary cards for service desk metrics
 */

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pause,
  Activity,
} from 'lucide-react';

interface TicketMetricsProps {
  metrics: {
    total: number;
    open: number;
    inProgress: number;
    pending: number;
    resolved: number;
    slaBreached: number;
    majorIncidents: number;
    byPriority: {
      critical: number;
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  onFilterChange: (filters: any) => void;
}

export function TicketMetrics({ metrics, onFilterChange }: TicketMetricsProps) {
  const cards = [
    {
      label: 'Open',
      value: metrics.open,
      icon: Ticket,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      onClick: () => onFilterChange({ status: ['open'] }),
    },
    {
      label: 'In Progress',
      value: metrics.inProgress,
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      onClick: () => onFilterChange({ status: ['in_progress'] }),
    },
    {
      label: 'Pending',
      value: metrics.pending,
      icon: Pause,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      onClick: () => onFilterChange({ status: ['pending'] }),
    },
    {
      label: 'Resolved',
      value: metrics.resolved,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      onClick: () => onFilterChange({ status: ['resolved'] }),
    },
    {
      label: 'SLA Breached',
      value: metrics.slaBreached,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      onClick: () => onFilterChange({}), // Would need custom filter
      highlight: metrics.slaBreached > 0,
    },
    {
      label: 'Major Incidents',
      value: metrics.majorIncidents,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      onClick: () => onFilterChange({}), // Would need custom filter
      highlight: metrics.majorIncidents > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.label}
            className={cn(
              "cursor-pointer hover:bg-accent/50 transition-colors",
              card.highlight && "border-destructive"
            )}
            onClick={card.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", card.bgColor)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
