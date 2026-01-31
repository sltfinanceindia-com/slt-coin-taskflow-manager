/**
 * Ticket Detail
 * Full ticket view with timeline and actions
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ServiceTicket, TicketStatus, useServiceDesk } from '@/hooks/useServiceDesk';
import { SLATracker } from './SLATracker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

interface TicketDetailProps {
  ticket: ServiceTicket | null;
  open: boolean;
  onClose: () => void;
}

const statusFlow: TicketStatus[] = ['open', 'in_progress', 'pending', 'resolved', 'closed'];

export function TicketDetail({ ticket, open, onClose }: TicketDetailProps) {
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const { updateTicket, isUpdating } = useServiceDesk();

  if (!ticket) return null;

  const handleStatusChange = () => {
    if (!newStatus) return;
    
    updateTicket({
      id: ticket.id,
      status: newStatus,
      resolution_notes: resolutionNotes || undefined,
    });
    setNewStatus('');
    setResolutionNotes('');
  };

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground">{ticket.ticket_number}</p>
              <SheetTitle className="text-lg mt-1">{ticket.title}</SheetTitle>
            </div>
            {ticket.is_major_incident && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Major Incident
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status & Priority */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {ticket.ticket_type}
            </Badge>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityColors[ticket.priority])}>
              {ticket.priority}
            </span>
            <Badge variant="secondary" className="capitalize">
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* SLA Status */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <SLATracker ticket={ticket} />
          </div>

          {/* Description */}
          {ticket.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}

          <Separator />

          {/* People */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Requester</Label>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {ticket.requester?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{ticket.requester?.full_name || 'Unknown'}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Assignee</Label>
              <div className="flex items-center gap-2 mt-1">
                {ticket.assignee ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {ticket.assignee.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticket.assignee.full_name}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p>{format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}</p>
            </div>
            {ticket.first_response_at && (
              <div>
                <Label className="text-xs text-muted-foreground">First Response</Label>
                <p>{format(new Date(ticket.first_response_at), 'MMM d, yyyy HH:mm')}</p>
              </div>
            )}
            {ticket.resolved_at && (
              <div>
                <Label className="text-xs text-muted-foreground">Resolved</Label>
                <p>{format(new Date(ticket.resolved_at), 'MMM d, yyyy HH:mm')}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Resolution Notes */}
          {ticket.resolution_notes && (
            <div>
              <Label className="text-sm font-medium">Resolution Notes</Label>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.resolution_notes}
              </p>
            </div>
          )}

          {/* Actions */}
          {!['closed', 'cancelled'].includes(ticket.status) && (
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-sm font-medium">Update Ticket</Label>
              
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {statusFlow.map(status => (
                    <SelectItem 
                      key={status} 
                      value={status}
                      disabled={status === ticket.status}
                    >
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(newStatus === 'resolved' || newStatus === 'closed') && (
                <div>
                  <Label className="text-sm">Resolution Notes</Label>
                  <Textarea
                    placeholder="Describe how the issue was resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}

              <Button 
                onClick={handleStatusChange}
                disabled={!newStatus || isUpdating}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Update Ticket
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
