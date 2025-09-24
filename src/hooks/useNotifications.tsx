import { useState, useCallback, useEffect } from 'react';
import { NotificationItem } from '@/components/communication/NotificationBanner';
import { audioNotifications } from '@/utils/audioNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showBanners: boolean;
  autoMarkAsRead: boolean;
  dndEnabled: boolean;
  dndStart?: string; // HH:MM format
  dndEnd?: string; // HH:MM format
}

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    showBanners: true,
    autoMarkAsRead: true,
    dndEnabled: false
  });

  // Initialize audio notifications
  useEffect(() => {
    audioNotifications.initialize();
  }, []);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const isDNDActive = useCallback(() => {
    if (!settings.dndEnabled || !settings.dndStart || !settings.dndEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= settings.dndStart && currentTime <= settings.dndEnd;
  }, [settings]);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound if enabled and not in DND
    if (settings.soundEnabled && !isDNDActive()) {
      switch (notification.type) {
        case 'message':
        case 'mention':
          audioNotifications.playMessageReceived();
          break;
        case 'call':
          audioNotifications.playIncomingCall();
          break;
        case 'missed_call':
          audioNotifications.playMissedCall();
          break;
        case 'system':
          audioNotifications.playSuccess();
          break;
      }
    }

    return newNotification.id;
  }, [settings.soundEnabled, isDNDActive]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Message notification
  const notifyMessage = useCallback((sender: { name: string; avatar?: string }, message: string, isDirectMessage = false) => {
    const notification: Omit<NotificationItem, 'id' | 'timestamp'> = {
      type: isDirectMessage ? 'mention' : 'message',
      title: sender.name,
      message: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      sender,
      priority: isDirectMessage ? 'high' : 'normal',
      actions: [
        {
          label: 'Reply',
          action: () => {
            // Handle reply action
            console.log('Reply to message');
          },
          variant: 'outline'
        },
        {
          label: 'Mark Read',
          action: () => {
            // Handle mark as read
            console.log('Mark as read');
          },
          variant: 'secondary'
        }
      ]
    };

    return addNotification(notification);
  }, [addNotification]);

  // Call notification
  const notifyIncomingCall = useCallback((caller: { name: string; avatar?: string }, callType: 'voice' | 'video' = 'voice') => {
    const notification: Omit<NotificationItem, 'id' | 'timestamp'> = {
      type: 'call',
      title: 'Incoming Call',
      message: `${caller.name} is calling you`,
      sender: caller,
      callType,
      priority: 'urgent',
      actions: [
        {
          label: 'Accept',
          action: () => {
            // Handle accept call
            console.log('Accept call');
          },
          variant: 'default'
        },
        {
          label: 'Decline',
          action: () => {
            // Handle decline call
            console.log('Decline call');
          },
          variant: 'outline'
        }
      ]
    };

    return addNotification(notification);
  }, [addNotification]);

  // Missed call notification
  const notifyMissedCall = useCallback((caller: { name: string; avatar?: string }, callType: 'voice' | 'video' = 'voice') => {
    const notification: Omit<NotificationItem, 'id' | 'timestamp'> = {
      type: 'missed_call',
      title: 'Missed Call',
      message: `You missed a ${callType} call from ${caller.name}`,
      sender: caller,
      callType,
      priority: 'high',
      actions: [
        {
          label: 'Call Back',
          action: () => {
            // Handle call back
            console.log('Call back');
          },
          variant: 'default'
        },
        {
          label: 'Message',
          action: () => {
            // Handle send message
            console.log('Send message');
          },
          variant: 'outline'
        }
      ]
    };

    return addNotification(notification);
  }, [addNotification]);

  // System notification
  const notifySystem = useCallback((title: string, message: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
    const notification: Omit<NotificationItem, 'id' | 'timestamp'> = {
      type: 'system',
      title,
      message,
      priority
    };

    return addNotification(notification);
  }, [addNotification]);

  // Mention notification
  const notifyMention = useCallback((sender: { name: string; avatar?: string }, message: string, channelName: string) => {
    const notification: Omit<NotificationItem, 'id' | 'timestamp'> = {
      type: 'mention',
      title: `${sender.name} mentioned you`,
      message: `In ${channelName}: ${message.length > 80 ? `${message.substring(0, 80)}...` : message}`,
      sender,
      priority: 'high',
      actions: [
        {
          label: 'View',
          action: () => {
            // Handle view mention
            console.log('View mention');
          },
          variant: 'default'
        },
        {
          label: 'Reply',
          action: () => {
            // Handle reply
            console.log('Reply to mention');
          },
          variant: 'outline'
        }
      ]
    };

    return addNotification(notification);
  }, [addNotification]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: NotificationItem['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get badge count for specific types
  const getUnreadCountByType = useCallback((type: NotificationItem['type']) => {
    return notifications.filter(n => n.type === type && !n.isRead).length;
  }, [notifications]);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    
    // Core functions
    addNotification,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    
    // Specific notification types
    notifyMessage,
    notifyIncomingCall,
    notifyMissedCall,
    notifySystem,
    notifyMention,
    
    // Settings
    updateSettings,
    isDNDActive: isDNDActive(),
    
    // Utility functions
    getNotificationsByType,
    getUnreadCountByType
  };
}