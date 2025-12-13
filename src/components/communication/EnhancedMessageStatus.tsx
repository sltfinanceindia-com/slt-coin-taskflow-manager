import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

export type MessageDeliveryState = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface EnhancedMessageStatusProps {
  state: MessageDeliveryState;
  timestamp?: string;
  readAt?: string;
  deliveredAt?: string;
  showTooltip?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function EnhancedMessageStatus({
  state,
  timestamp,
  readAt,
  deliveredAt,
  showTooltip = true,
  size = 'sm',
  className
}: EnhancedMessageStatusProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4'
  };

  const getStateIcon = () => {
    const iconClass = cn(sizeClasses[size]);
    
    switch (state) {
      case 'sending':
        return <Clock className={cn(iconClass, "text-muted-foreground animate-pulse")} />;
      case 'sent':
        return <Check className={cn(iconClass, "text-muted-foreground")} />;
      case 'delivered':
        return <CheckCheck className={cn(iconClass, "text-muted-foreground")} />;
      case 'read':
        return <CheckCheck className={cn(iconClass, "text-blue-500")} />;
      case 'failed':
        return <AlertCircle className={cn(iconClass, "text-destructive")} />;
      default:
        return null;
    }
  };

  const getTooltipContent = () => {
    const formatTime = (ts: string) => {
      try {
        return format(new Date(ts), 'MMM d, h:mm a');
      } catch {
        return '';
      }
    };

    switch (state) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return `Sent${timestamp ? ` at ${formatTime(timestamp)}` : ''}`;
      case 'delivered':
        return `Delivered${deliveredAt ? ` at ${formatTime(deliveredAt)}` : ''}`;
      case 'read':
        return `Read${readAt ? ` at ${formatTime(readAt)}` : ''}`;
      case 'failed':
        return 'Failed to send. Tap to retry.';
      default:
        return '';
    }
  };

  const StatusIcon = getStateIcon();

  if (!StatusIcon) return null;

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("inline-flex items-center cursor-default", className)}>
              {StatusIcon}
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      {StatusIcon}
    </span>
  );
}

// Double tick component for inline display
interface MessageTicksProps {
  isDelivered: boolean;
  isRead: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function MessageTicks({ isDelivered, isRead, size = 'sm', className }: MessageTicksProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4'
  };

  const iconClass = cn(sizeClasses[size]);

  if (isRead) {
    return <CheckCheck className={cn(iconClass, "text-blue-500", className)} />;
  }
  
  if (isDelivered) {
    return <CheckCheck className={cn(iconClass, "text-muted-foreground", className)} />;
  }
  
  return <Check className={cn(iconClass, "text-muted-foreground", className)} />;
}

export default EnhancedMessageStatus;
