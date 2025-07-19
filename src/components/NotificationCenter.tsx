import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, LogIn, LogOut, UserPlus, MessageSquare, Coins, Clock, Play, Pause, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'login' | 'logout' | 'task_assigned' | 'task_updated' | 'comment' | 'coins' | 'time_log' | 'task_progress';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId: string;
  metadata?: any;
}

export function NotificationCenter() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    if (!profile) return;

    // Initial notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'login',
        title: 'Welcome Back!',
        message: 'You have successfully logged in.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        userId: profile.id,
      },
      {
        id: '2',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: "Complete Project Documentation"',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        userId: profile.id,
      },
      {
        id: '3',
        type: 'coins',
        title: 'SLT Coins Earned!',
        message: 'You earned 50 SLT coins for completing a task.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        userId: profile.id,
      },
    ];

    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);

    // Simulate periodic notifications (less frequent)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 2 minutes
        const notificationTypes = [
          'task_updated', 'comment', 'coins', 'time_log', 'task_progress'
        ];
        
        const messages = {
          task_updated: 'A task status has been updated.',
          comment: 'Someone commented on your task.',
          coins: 'You earned SLT coins!',
          time_log: 'Time log has been submitted.',
          task_progress: 'Task progress updated.',
        };

        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)] as keyof typeof messages;
        
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: randomType,
          title: randomType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          message: messages[randomType],
          timestamp: new Date(),
          read: false,
          userId: profile.id,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);

        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [profile]);

  // Listen for real-time updates from multiple tables
  useEffect(() => {
    if (!profile) return;

    const channels = [];

    // Listen to task changes
    const taskChannel = supabase
      .channel('task-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks' 
        }, 
        (payload) => {
          try {
            if (payload.eventType === 'UPDATE' && payload.new?.assigned_to === profile.id) {
              const newNotification: Notification = {
                id: `task-${Date.now()}`,
                type: 'task_updated',
                title: 'Task Updated',
                message: `Task "${payload.new.title}" status changed to ${payload.new.status}.`,
                timestamp: new Date(),
                read: false,
                userId: profile.id,
                metadata: payload.new,
              };
              
              setNotifications(prev => [newNotification, ...prev].slice(0, 50));
              setUnreadCount(prev => prev + 1);
              
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          } catch (error) {
            console.error('Error processing task notification:', error);
          }
        }
      )
      .subscribe();

    // Listen to comment changes
    const commentChannel = supabase
      .channel('comment-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'task_comments' 
        }, 
        (payload) => {
          try {
            if (payload.new && payload.new.user_id !== profile.id) {
              const newNotification: Notification = {
                id: `comment-${Date.now()}`,
                type: 'comment',
                title: 'New Comment',
                message: 'Someone commented on a task you\'re involved in.',
                timestamp: new Date(),
                read: false,
                userId: profile.id,
                metadata: payload.new,
              };
              
              setNotifications(prev => [newNotification, ...prev].slice(0, 50));
              setUnreadCount(prev => prev + 1);
              
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          } catch (error) {
            console.error('Error processing comment notification:', error);
          }
        }
      )
      .subscribe();

    channels.push(taskChannel, commentChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [profile]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      login: LogIn,
      logout: LogOut,
      task_assigned: UserPlus,
      task_updated: CheckCircle,
      comment: MessageSquare,
      coins: Coins,
      time_log: Clock,
      task_progress: Play,
    };
    
    const Icon = iconMap[type] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colorMap = {
      login: 'text-green-500',
      logout: 'text-muted-foreground',
      task_assigned: 'text-blue-500',
      task_updated: 'text-purple-500',
      comment: 'text-orange-500',
      coins: 'text-yellow-500',
      time_log: 'text-indigo-500',
      task_progress: 'text-pink-500',
    };
    
    return colorMap[type] || 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
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
          </CardHeader>
          
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}