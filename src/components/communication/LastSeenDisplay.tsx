import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

interface LastSeenDisplayProps {
  lastSeen?: string;
  isOnline: boolean;
  statusMessage?: string;
  variant?: 'inline' | 'full' | 'compact';
  className?: string;
}

export function LastSeenDisplay({
  lastSeen,
  isOnline,
  statusMessage,
  variant = 'inline',
  className
}: LastSeenDisplayProps) {
  const formatLastSeenTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'just now';
      if (diffMinutes < 5) return 'a few minutes ago';
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
      if (diffMinutes < 120) return '1 hour ago';
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
      
      if (isToday(date)) {
        return `today at ${format(date, 'h:mm a')}`;
      }
      
      if (isYesterday(date)) {
        return `yesterday at ${format(date, 'h:mm a')}`;
      }
      
      return format(date, 'MMM d, h:mm a');
    } catch {
      return 'Unknown';
    }
  };

  if (isOnline) {
    if (variant === 'compact') {
      return (
        <span className={cn("text-xs text-green-600 dark:text-green-400 font-medium", className)}>
          Online
        </span>
      );
    }
    
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
          {statusMessage || 'Online now'}
        </span>
      </div>
    );
  }

  if (!lastSeen) {
    if (variant === 'compact') {
      return (
        <span className={cn("text-xs text-muted-foreground", className)}>
          Offline
        </span>
      );
    }
    
    return (
      <div className={cn("flex items-center gap-1.5 text-muted-foreground", className)}>
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Offline</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Last seen {formatLastSeenTime(lastSeen)}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">Last seen</span>
        </div>
        <span className="text-xs text-muted-foreground pl-4">
          {formatLastSeenTime(lastSeen)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-muted-foreground", className)}>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400" />
      <span className="text-xs">
        Last seen {formatLastSeenTime(lastSeen)}
      </span>
    </div>
  );
}

export default LastSeenDisplay;
