import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Phone, 
  MessageCircle, 
  Video, 
  Clock, 
  Check,
  Reply,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  type: 'message' | 'call' | 'missed_call' | 'system' | 'mention';
  title: string;
  message: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isRead?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  callType?: 'voice' | 'video';
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
}

interface NotificationBannerProps {
  notifications: NotificationItem[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
  autoDismiss?: number; // seconds
  onDismiss: (id: string) => void;
  onAction?: (notificationId: string, actionIndex: number) => void;
}

export default function NotificationBanner({
  notifications,
  position = 'top-right',
  maxVisible = 3,
  autoDismiss = 5,
  onDismiss,
  onAction
}: NotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);
  const [dismissingNotifications, setDismissingNotifications] = useState<Set<string>>(new Set());

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: { [key: string]: NodeJS.Timeout } = {};

    notifications.forEach(notification => {
      if (notification.type !== 'call' && autoDismiss > 0) {
        timers[notification.id] = setTimeout(() => {
          handleDismiss(notification.id);
        }, autoDismiss * 1000);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [notifications, autoDismiss]);

  // Show notifications with animation
  useEffect(() => {
    notifications.forEach(notification => {
      if (!visibleNotifications.includes(notification.id)) {
        setTimeout(() => {
          setVisibleNotifications(prev => [...prev, notification.id]);
        }, 100);
      }
    });
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setDismissingNotifications(prev => new Set([...prev, id]));
    setTimeout(() => {
      setVisibleNotifications(prev => prev.filter(notifId => notifId !== id));
      setDismissingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      onDismiss(id);
    }, 300);
  };

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 space-y-2";
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  const getNotificationIcon = (type: string, callType?: string) => {
    switch (type) {
      case 'call':
        return callType === 'video' ? 
          <Video className="h-4 w-4 text-success" /> : 
          <Phone className="h-4 w-4 text-success" />;
      case 'missed_call':
        return callType === 'video' ? 
          <Video className="h-4 w-4 text-destructive" /> : 
          <Phone className="h-4 w-4 text-destructive" />;
      case 'message':
      case 'mention':
        return <MessageCircle className="h-4 w-4 text-info" />;
      case 'system':
        return <Info className="h-4 w-4 text-primary" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getPriorityClasses = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return "border-destructive bg-destructive/5 shadow-lg shadow-destructive/20";
      case 'high':
        return "border-warning bg-warning/5 shadow-lg shadow-warning/20";
      case 'normal':
        return "border-info bg-info/5 shadow-lg shadow-info/20";
      case 'low':
        return "border-muted bg-muted/5 shadow-md";
      default:
        return "border-border bg-card shadow-lg";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  const displayedNotifications = notifications
    .slice(0, maxVisible)
    .filter(notification => visibleNotifications.includes(notification.id));

  if (displayedNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      {displayedNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            "w-80 backdrop-blur-lg border transition-all duration-300 ease-out",
            getPriorityClasses(notification.priority),
            visibleNotifications.includes(notification.id) && !dismissingNotifications.has(notification.id)
              ? "animate-slide-in-right opacity-100 translate-x-0"
              : "opacity-0 translate-x-4",
            dismissingNotifications.has(notification.id) && "animate-slide-out-right"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Sender Avatar or Icon */}
              <div className="flex-shrink-0">
                {notification.sender ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.sender.avatar} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(notification.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                    {getNotificationIcon(notification.type, notification.callType)}
                  </div>
                )}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {notification.title}
                    </h4>
                    {notification.type === 'mention' && (
                      <Badge variant="secondary" className="h-4 px-1 text-xs">
                        @
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {notification.message}
                </p>

                {/* Quick Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => {
                          action.action();
                          onAction?.(notification.id, index);
                        }}
                        className="h-7 px-3 text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Type Indicator */}
              <div className="flex-shrink-0">
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </div>

            {/* Call-specific UI */}
            {notification.type === 'call' && (
              <div className="mt-3 p-2 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDismiss(notification.id)}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 bg-success hover:bg-success/90"
                    onClick={() => {
                      // Handle call accept
                      onAction?.(notification.id, 0);
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  {notification.callType === 'voice' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Handle video call accept
                        onAction?.(notification.id, 1);
                      }}
                      className="h-8 w-8 rounded-full p-0 border-info text-info hover:bg-info/10"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}