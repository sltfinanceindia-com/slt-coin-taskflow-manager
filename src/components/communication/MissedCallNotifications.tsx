import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  PhoneMissed, 
  Video, 
  Phone, 
  X, 
  Clock,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { audioNotifications } from '@/utils/audioNotifications';
import { useToast } from '@/hooks/use-toast';

export interface MissedCall {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  type: 'audio' | 'video';
  missedAt: Date;
  attempts: number;
}

interface MissedCallNotificationsProps {
  onCallBack?: (participantId: string, type: 'audio' | 'video') => void;
  onDismiss?: (callId: string) => void;
  className?: string;
}

export function MissedCallNotifications({ 
  onCallBack, 
  onDismiss, 
  className 
}: MissedCallNotificationsProps) {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio notifications
    audioNotifications.initialize();
    
    // Load missed calls from localStorage or API
    loadMissedCalls();
    
    // Simulate receiving a missed call for demo
    const timeout = setTimeout(() => {
      addMissedCall({
        id: 'missed-1',
        participantId: 'user-1',
        participantName: 'Sarah Wilson',
        participantAvatar: '/avatar-sarah.jpg',
        type: 'video',
        missedAt: new Date(),
        attempts: 1
      });
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const loadMissedCalls = () => {
    try {
      const stored = localStorage.getItem('missedCalls');
      if (stored) {
        const calls = JSON.parse(stored).map((call: any) => ({
          ...call,
          missedAt: new Date(call.missedAt)
        }));
        setMissedCalls(calls);
      }
    } catch (error) {
      console.error('Failed to load missed calls:', error);
    }
  };

  const saveMissedCalls = (calls: MissedCall[]) => {
    try {
      localStorage.setItem('missedCalls', JSON.stringify(calls));
    } catch (error) {
      console.error('Failed to save missed calls:', error);
    }
  };

  const addMissedCall = async (call: MissedCall) => {
    setMissedCalls(prev => {
      // Check if there's already a missed call from this participant
      const existingIndex = prev.findIndex(c => c.participantId === call.participantId);
      
      let updatedCalls;
      if (existingIndex >= 0) {
        // Update existing missed call with new attempt
        updatedCalls = [...prev];
        updatedCalls[existingIndex] = {
          ...updatedCalls[existingIndex],
          missedAt: call.missedAt,
          attempts: updatedCalls[existingIndex].attempts + 1
        };
      } else {
        // Add new missed call
        updatedCalls = [call, ...prev];
      }
      
      // Keep only the latest 10 missed calls
      const trimmedCalls = updatedCalls.slice(0, 10);
      saveMissedCalls(trimmedCalls);
      
      return trimmedCalls;
    });

    // Play missed call notification
    await audioNotifications.playMissedCall();
    
    // Show toast notification
    toast({
      title: "Missed Call",
      description: `${call.participantName} tried to call you`,
      action: (
        <Button
          size="sm"
          onClick={() => handleCallBack(call.participantId, call.type)}
        >
          Call Back
        </Button>
      ),
    });
  };

  const handleCallBack = (participantId: string, type: 'audio' | 'video') => {
    onCallBack?.(participantId, type);
    
    // Remove the missed call notification after calling back
    handleDismiss(participantId, true);
  };

  const handleDismiss = (callId: string, isCallBack = false) => {
    setMissedCalls(prev => {
      const updatedCalls = prev.filter(call => call.id !== callId);
      saveMissedCalls(updatedCalls);
      return updatedCalls;
    });
    
    onDismiss?.(callId);
    
    if (!isCallBack) {
      toast({
        title: "Notification Dismissed",
        description: "Missed call notification removed",
      });
    }
  };

  const handleDismissAll = () => {
    setMissedCalls([]);
    saveMissedCalls([]);
    toast({
      title: "All Notifications Cleared",
      description: "All missed call notifications have been dismissed",
    });
  };

  if (missedCalls.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PhoneMissed className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">
            Missed Calls ({missedCalls.length})
          </span>
        </div>
        {missedCalls.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Missed Call Cards */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {missedCalls.map((call) => (
          <Card key={call.id} className="border-l-4 border-l-destructive">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={call.participantAvatar} />
                  <AvatarFallback>{call.participantName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium truncate">{call.participantName}</p>
                    {call.type === 'video' && <Video className="h-3 w-3 text-muted-foreground" />}
                    {call.attempts > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {call.attempts} calls
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(call.missedAt, { addSuffix: true })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCallBack(call.participantId, 'audio')}
                    className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                    title="Call back (audio)"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  
                  {call.type === 'video' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCallBack(call.participantId, 'video')}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                      title="Call back (video)"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(call.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Hook to use missed call notifications
export function useMissedCalls() {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);

  const addMissedCall = (call: Omit<MissedCall, 'id'>) => {
    const newCall: MissedCall = {
      ...call,
      id: `missed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setMissedCalls(prev => {
      const existingIndex = prev.findIndex(c => c.participantId === call.participantId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          missedAt: call.missedAt,
          attempts: updated[existingIndex].attempts + 1
        };
        return updated;
      } else {
        return [newCall, ...prev.slice(0, 9)]; // Keep max 10
      }
    });
    
    return newCall;
  };

  const removeMissedCall = (callId: string) => {
    setMissedCalls(prev => prev.filter(call => call.id !== callId));
  };

  const clearAllMissedCalls = () => {
    setMissedCalls([]);
  };

  return {
    missedCalls,
    addMissedCall,
    removeMissedCall,
    clearAllMissedCalls
  };
}
