import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface ReadReceipt {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  read_at: string;
}

interface ReadReceiptsProps {
  status: MessageStatus;
  readBy?: ReadReceipt[];
  isOwnMessage?: boolean;
  showDetailedReceipts?: boolean;
  maxAvatars?: number;
  className?: string;
}

export default function ReadReceipts({
  status,
  readBy = [],
  isOwnMessage = false,
  showDetailedReceipts = false,
  maxAvatars = 3,
  className
}: ReadReceiptsProps) {
  // For messages sent by others, we don't show status
  if (!isOwnMessage && !showDetailedReceipts) return null;

  // Status icon for own messages
  const StatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
            </TooltipTrigger>
            <TooltipContent>Sending...</TooltipContent>
          </Tooltip>
        );
      case 'sent':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Check className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Sent</TooltipContent>
          </Tooltip>
        );
      case 'delivered':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <CheckCheck className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Delivered</TooltipContent>
          </Tooltip>
        );
      case 'read':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <CheckCheck className="h-3 w-3 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent>
              {readBy.length > 0 
                ? `Read by ${readBy.length} ${readBy.length === 1 ? 'person' : 'people'}`
                : 'Read'}
            </TooltipContent>
          </Tooltip>
        );
      case 'failed':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>Failed to send</TooltipContent>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  // Simple status indicator
  if (!showDetailedReceipts || readBy.length === 0) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1", className)}>
          <StatusIcon />
        </div>
      </TooltipProvider>
    );
  }

  // Detailed read receipts with avatars
  const visibleReceipts = readBy.slice(0, maxAvatars);
  const remainingCount = readBy.length - maxAvatars;

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <StatusIcon />
        
        {status === 'read' && readBy.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex -space-x-1.5">
                {visibleReceipts.map((receipt, index) => (
                  <Avatar 
                    key={receipt.user_id} 
                    className="h-4 w-4 border border-background"
                    style={{ zIndex: maxAvatars - index }}
                  >
                    <AvatarImage src={receipt.avatar_url} />
                    <AvatarFallback className="text-[8px] bg-muted">
                      {receipt.user_name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium border border-background">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium text-xs">Read by</p>
                {readBy.map((receipt) => (
                  <div key={receipt.user_id} className="flex items-center gap-2 text-xs">
                    <span>{receipt.user_name}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(receipt.read_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Compact version for inline display
interface CompactStatusProps {
  status: MessageStatus;
  className?: string;
}

export function CompactMessageStatus({ status, className }: CompactStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <span className={cn("inline-flex items-center", className)}>
      {getStatusIcon()}
    </span>
  );
}
