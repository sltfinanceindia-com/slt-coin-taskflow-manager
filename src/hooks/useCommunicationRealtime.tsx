import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TypingUser {
  user_id: string;
  channel_id: string;
  full_name: string;
  avatar_url?: string;
  started_at: Date;
}

interface MessageDeliveryStatus {
  message_id: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
}

interface RealtimeCallNotification {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: 'voice' | 'video';
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  caller_name?: string;
  caller_avatar?: string;
}

export function useCommunicationRealtime() {
  const { profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageDeliveryStatus>>(new Map());
  const [callNotifications, setCallNotifications] = useState<RealtimeCallNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const channelSubscriptions = useRef<Map<string, any>>(new Map());
  const presenceChannel = useRef<any>(null);
  const callChannel = useRef<any>(null);

  // Initialize real-time subscriptions
  useEffect(() => {
    if (!profile?.id) return;

    setupPresenceChannel();
    setupCallNotifications();
    
    return () => {
      cleanup();
    };
  }, [profile?.id]);

  const setupPresenceChannel = async () => {
    if (!profile?.id) return;

    presenceChannel.current = supabase
      .channel('user_presence_broadcast')
      .on('presence', { event: 'sync' }, () => {
        setConnectionStatus('connected');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'typing_start' }, ({ payload }) => {
        handleTypingStart(payload);
      })
      .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
        handleTypingStop(payload);
      })
      .on('broadcast', { event: 'message_status' }, ({ payload }) => {
        handleMessageStatusUpdate(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await presenceChannel.current.track({
            user_id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            online_at: new Date().toISOString(),
          });
          console.log('Presence tracking status:', presenceTrackStatus);
        }
      });
  };

  const setupCallNotifications = () => {
    if (!profile?.id) return;

    callChannel.current = supabase
      .channel('call_notifications')
      .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
        handleIncomingCall(payload);
      })
      .on('broadcast', { event: 'call_status_update' }, ({ payload }) => {
        handleCallStatusUpdate(payload);
      })
      .subscribe();
  };

  const subscribeToChannelMessages = (channelId: string) => {
    if (channelSubscriptions.current.has(channelId)) return;

    const subscription = supabase
      .channel(`messages_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          handleNewMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          handleMessageUpdate(payload.new);
        }
      )
      .subscribe();

    channelSubscriptions.current.set(channelId, subscription);
  };

  const unsubscribeFromChannelMessages = (channelId: string) => {
    const subscription = channelSubscriptions.current.get(channelId);
    if (subscription) {
      supabase.removeChannel(subscription);
      channelSubscriptions.current.delete(channelId);
    }
  };

  const handleNewMessage = (message: any) => {
    // Emit message delivery status
    broadcastMessageStatus(message.id, 'delivered');
    
    // Show notification if not from current user
    if (message.sender_id !== profile?.id) {
      playMessageSound();
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: `${message.sender_name}: ${message.content}`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleMessageUpdate = (message: any) => {
    console.log('Message updated:', message);
  };

  const handleTypingStart = (payload: any) => {
    if (payload.user_id === profile?.id) return;

    const typingUser: TypingUser = {
      user_id: payload.user_id,
      channel_id: payload.channel_id,
      full_name: payload.full_name,
      avatar_url: payload.avatar_url,
      started_at: new Date()
    };

    setTypingUsers(prev => {
      const filtered = prev.filter(u => u.user_id !== payload.user_id || u.channel_id !== payload.channel_id);
      return [...filtered, typingUser];
    });

    // Clear existing timeout
    const timeoutKey = `${payload.user_id}_${payload.channel_id}`;
    const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout to remove typing indicator
    const timeout = setTimeout(() => {
      setTypingUsers(prev => 
        prev.filter(u => u.user_id !== payload.user_id || u.channel_id !== payload.channel_id)
      );
      typingTimeoutRef.current.delete(timeoutKey);
    }, 3000);

    typingTimeoutRef.current.set(timeoutKey, timeout);
  };

  const handleTypingStop = (payload: any) => {
    setTypingUsers(prev => 
      prev.filter(u => u.user_id !== payload.user_id || u.channel_id !== payload.channel_id)
    );

    const timeoutKey = `${payload.user_id}_${payload.channel_id}`;
    const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeoutRef.current.delete(timeoutKey);
    }
  };

  const handleMessageStatusUpdate = (payload: MessageDeliveryStatus) => {
    setMessageStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(payload.message_id, payload);
      return newMap;
    });
  };

  const handleIncomingCall = (payload: RealtimeCallNotification) => {
    if (payload.receiver_id !== profile?.id) return;

    setCallNotifications(prev => [...prev, payload]);
    playRingtone();
    
    toast({
      title: "Incoming Call",
      description: `${payload.caller_name} is calling you`,
      duration: 10000,
    });
  };

  const handleCallStatusUpdate = (payload: any) => {
    setCallNotifications(prev => 
      prev.map(call => 
        call.id === payload.call_id 
          ? { ...call, status: payload.status }
          : call
      )
    );

    if (payload.status === 'ended' || payload.status === 'declined') {
      stopRingtone();
    }
  };

  // Broadcast functions
  const broadcastTypingStart = (channelId: string) => {
    if (!profile?.id || !presenceChannel.current) return;

    presenceChannel.current.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        user_id: profile.id,
        channel_id: channelId,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
    });
  };

  const broadcastTypingStop = (channelId: string) => {
    if (!profile?.id || !presenceChannel.current) return;

    presenceChannel.current.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        user_id: profile.id,
        channel_id: channelId
      }
    });
  };

  const broadcastMessageStatus = (messageId: string, status: MessageDeliveryStatus['status']) => {
    if (!presenceChannel.current) return;

    const statusUpdate: MessageDeliveryStatus = {
      message_id: messageId,
      status,
      timestamp: new Date()
    };

    presenceChannel.current.send({
      type: 'broadcast',
      event: 'message_status',
      payload: statusUpdate
    });
  };

  const broadcastCallNotification = (notification: Omit<RealtimeCallNotification, 'id'>) => {
    if (!callChannel.current) return;

    const callNotification = {
      ...notification,
      id: Date.now().toString()
    };

    callChannel.current.send({
      type: 'broadcast',
      event: 'incoming_call',
      payload: callNotification
    });
  };

  const broadcastCallStatusUpdate = (callId: string, status: RealtimeCallNotification['status']) => {
    if (!callChannel.current) return;

    callChannel.current.send({
      type: 'broadcast',
      event: 'call_status_update',
      payload: {
        call_id: callId,
        status
      }
    });
  };

  // Audio functions
  const playMessageSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Could not play message sound:', error);
    }
  };

  const playRingtone = () => {
    try {
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.volume = 0.8;
      audio.play().catch(console.warn);
      
      // Store reference to stop later
      (window as any).currentRingtone = audio;
    } catch (error) {
      console.warn('Could not play ringtone:', error);
    }
  };

  const stopRingtone = () => {
    const ringtone = (window as any).currentRingtone;
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
      (window as any).currentRingtone = null;
    }
  };

  const cleanup = () => {
    // Clear all typing timeouts
    typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    typingTimeoutRef.current.clear();

    // Unsubscribe from all channels
    if (presenceChannel.current) {
      supabase.removeChannel(presenceChannel.current);
    }
    if (callChannel.current) {
      supabase.removeChannel(callChannel.current);
    }
    
    channelSubscriptions.current.forEach(subscription => {
      supabase.removeChannel(subscription);
    });
    channelSubscriptions.current.clear();

    stopRingtone();
  };

  const getTypingUsersForChannel = (channelId: string) => {
    return typingUsers.filter(user => user.channel_id === channelId);
  };

  const getMessageStatus = (messageId: string) => {
    return messageStatuses.get(messageId);
  };

  return {
    // State
    typingUsers,
    messageStatuses,
    callNotifications,
    connectionStatus,
    
    // Channel management
    subscribeToChannelMessages,
    unsubscribeFromChannelMessages,
    
    // Broadcasting
    broadcastTypingStart,
    broadcastTypingStop,
    broadcastMessageStatus,
    broadcastCallNotification,
    broadcastCallStatusUpdate,
    
    // Utilities
    getTypingUsersForChannel,
    getMessageStatus,
    playMessageSound,
    playRingtone,
    stopRingtone
  };
}