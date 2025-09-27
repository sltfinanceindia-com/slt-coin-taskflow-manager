import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  MessageSquare, 
  Phone, 
  PhoneOff,
  Users,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface EnhancedNotificationsProps {
  className?: string;
}

export default function EnhancedNotifications({ className }: EnhancedNotificationsProps) {
  const {
    notifications,
    unreadCount,
    settings,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    getNotificationsByType,
    pushPermission
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Request permission for desktop notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'missed_call':
        return <PhoneOff className="h-4 w-4" />;
      case 'mention':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500';
      case 'call':
        return 'bg-green-500';
      case 'missed_call':
        return 'bg-red-500';
      case 'mention':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  if (showSettings) {
    return (
      <Card className={cn("p-4 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notification Settings</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound">Sound Notifications</Label>
            <Switch
              id="sound"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vibration">Vibration (Mobile)</Label>
            <Switch
              id="vibration"
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => handleSettingChange('vibrationEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="banners">Desktop Banners</Label>
            <Switch
              id="banners"
              checked={settings.showBanners}
              onCheckedChange={(checked) => handleSettingChange('showBanners', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoRead">Auto-mark as Read</Label>
            <Switch
              id="autoRead"
              checked={settings.autoMarkAsRead}
              onCheckedChange={(checked) => handleSettingChange('autoMarkAsRead', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Do Not Disturb</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enable DND Mode</span>
              <Switch
                checked={settings.dndEnabled}
                onCheckedChange={(checked) => handleSettingChange('dndEnabled', checked)}
              />
            </div>
          </div>

          {pushPermission !== 'granted' && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                Enable browser notifications for better experience
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => Notification.requestPermission()}
              >
                Enable Notifications
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {settings.soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 max-h-96 z-50 shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-64">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-muted/50 cursor-pointer",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white",
                        getNotificationColor(notification.type)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}