import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Circle, Minus, Clock, Zap, Coffee, Moon } from 'lucide-react';

type StatusType = 'online' | 'away' | 'busy' | 'offline' | 'dnd' | 'invisible';

interface UserStatusBadgeProps {
  status: StatusType;
  customStatus?: string;
  showIcon?: boolean;
  variant?: 'dot' | 'badge' | 'pill';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function UserStatusBadge({
  status,
  customStatus,
  showIcon = true,
  variant = 'badge',
  size = 'sm',
  className
}: UserStatusBadgeProps) {
  const statusConfig: Record<StatusType, {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = {
    online: {
      label: 'Online',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
      icon: Circle
    },
    away: {
      label: 'Away',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
      icon: Clock
    },
    busy: {
      label: 'Busy',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      icon: Minus
    },
    dnd: {
      label: 'Do Not Disturb',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      icon: Minus
    },
    offline: {
      label: 'Offline',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
      icon: Circle
    },
    invisible: {
      label: 'Invisible',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
      icon: Moon
    }
  };

  const config = statusConfig[status] || statusConfig.offline;
  const StatusIcon = config.icon;

  const sizeClasses = {
    xs: { text: 'text-[10px]', icon: 'h-2 w-2', padding: 'px-1.5 py-0' },
    sm: { text: 'text-xs', icon: 'h-2.5 w-2.5', padding: 'px-2 py-0.5' },
    md: { text: 'text-sm', icon: 'h-3 w-3', padding: 'px-2.5 py-1' }
  };

  const sizes = sizeClasses[size];

  if (variant === 'dot') {
    return (
      <span 
        className={cn(
          "rounded-full",
          sizes.icon,
          status === 'online' && "bg-green-500",
          status === 'away' && "bg-yellow-500",
          status === 'busy' && "bg-red-500",
          status === 'dnd' && "bg-red-500",
          status === 'offline' && "bg-gray-400",
          status === 'invisible' && "bg-gray-400",
          className
        )} 
      />
    );
  }

  if (variant === 'pill') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border",
        sizes.text,
        sizes.padding,
        config.color,
        config.bgColor,
        className
      )}>
        {showIcon && <StatusIcon className={cn(sizes.icon, "fill-current")} />}
        <span>{customStatus || config.label}</span>
      </span>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border",
        sizes.text,
        config.color,
        config.bgColor,
        className
      )}
    >
      {showIcon && <StatusIcon className={cn(sizes.icon, "mr-1 fill-current")} />}
      {customStatus || config.label}
    </Badge>
  );
}

export default UserStatusBadge;
