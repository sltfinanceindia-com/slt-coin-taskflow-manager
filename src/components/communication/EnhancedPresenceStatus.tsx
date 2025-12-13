import React from 'react';
import { cn } from '@/lib/utils';
import { Circle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedPresenceStatusProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
  showLastSeen?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  statusMessage?: string;
  className?: string;
}

export function EnhancedPresenceStatus({
  status,
  lastSeen,
  showLastSeen = true,
  size = 'sm',
  showText = false,
  statusMessage,
  className
}: EnhancedPresenceStatusProps) {
  const sizeClasses = {
    xs: 'h-2 w-2',
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  const statusLabels = {
    online: 'Online',
    away: 'Away',
    busy: 'Busy',
    offline: 'Offline'
  };

  const formatLastSeen = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* Status Dot with pulse animation for online */}
      <span className="relative flex items-center justify-center">
        <span className={cn(
          "rounded-full",
          sizeClasses[size],
          statusColors[status]
        )} />
        {status === 'online' && (
          <span className={cn(
            "absolute rounded-full animate-ping opacity-75",
            sizeClasses[size],
            statusColors[status]
          )} />
        )}
      </span>

      {/* Status Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-medium",
            status === 'online' && "text-green-600 dark:text-green-400",
            status === 'away' && "text-yellow-600 dark:text-yellow-400",
            status === 'busy' && "text-red-600 dark:text-red-400",
            status === 'offline' && "text-muted-foreground"
          )}>
            {statusMessage || statusLabels[status]}
          </span>
          
          {/* Last Seen for offline users */}
          {status === 'offline' && showLastSeen && lastSeen && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {formatLastSeen(lastSeen)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Inline badge version for avatars
interface PresenceBadgeProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function PresenceBadge({ status, size = 'sm', className }: PresenceBadgeProps) {
  const sizeClasses = {
    xs: 'h-2 w-2 border',
    sm: 'h-2.5 w-2.5 border-[1.5px]',
    md: 'h-3 w-3 border-2',
    lg: 'h-4 w-4 border-2'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  return (
    <span className={cn(
      "absolute rounded-full border-background",
      sizeClasses[size],
      statusColors[status],
      className
    )} />
  );
}

export default EnhancedPresenceStatus;
