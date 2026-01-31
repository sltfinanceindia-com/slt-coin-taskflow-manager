/**
 * SLA Tracker
 * SLA countdown timer component
 */

import { ServiceTicket } from '@/hooks/useServiceDesk';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLATrackerProps {
  ticket: ServiceTicket;
  compact?: boolean;
}

export function SLATracker({ ticket, compact = false }: SLATrackerProps) {
  const { slaStatus } = ticket;
  
  if (!slaStatus) return null;

  const hasResponseSLA = ticket.sla_response_due && !ticket.first_response_at;
  const hasResolutionSLA = ticket.sla_resolution_due && !ticket.resolved_at;
  const responseComplete = !!ticket.first_response_at;
  const resolutionComplete = !!ticket.resolved_at;

  if (compact) {
    // Compact view for list items
    if (slaStatus.responseBreached || slaStatus.resolutionBreached) {
      return (
        <Badge variant="destructive" className="text-xs gap-1">
          <AlertTriangle className="h-3 w-3" />
          SLA Breached
        </Badge>
      );
    }

    if (slaStatus.resolutionTimeRemaining && !resolutionComplete) {
      return (
        <Badge variant="outline" className="text-xs gap-1">
          <Clock className="h-3 w-3" />
          {slaStatus.resolutionTimeRemaining}
        </Badge>
      );
    }

    if (resolutionComplete) {
      return (
        <Badge variant="secondary" className="text-xs gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3" />
          Resolved
        </Badge>
      );
    }

    return null;
  }

  // Full view
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        SLA Status
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Response SLA */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Response SLA</p>
          {responseComplete ? (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Met</span>
            </div>
          ) : slaStatus.responseBreached ? (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{slaStatus.responseTimeRemaining}</span>
            </div>
          ) : hasResponseSLA ? (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>{slaStatus.responseTimeRemaining}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>

        {/* Resolution SLA */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Resolution SLA</p>
          {resolutionComplete ? (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Met</span>
            </div>
          ) : slaStatus.resolutionBreached ? (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{slaStatus.resolutionTimeRemaining}</span>
            </div>
          ) : hasResolutionSLA ? (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>{slaStatus.resolutionTimeRemaining}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      </div>

      {/* Breach Warning */}
      {(slaStatus.responseBreached || slaStatus.resolutionBreached) && (
        <div className="p-2 rounded bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>SLA has been breached. Immediate attention required.</span>
        </div>
      )}
    </div>
  );
}
