import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { audioNotifications } from '@/utils/audioNotifications';
import { toast } from 'sonner';

export default function IncomingCallNotification() {
  const { callState, answerCall, declineCall } = useWebRTC();

  // Debug: Log when call state changes
  useEffect(() => {
    console.log('📱 IncomingCallNotification - State Update:');
    console.log('  isIncoming:', callState.isIncoming);
    console.log('  isActive:', callState.isActive);
    console.log('  hasData:', !!callState.incomingCallData);
    if (callState.incomingCallData) {
      console.log('  caller:', callState.incomingCallData.callerName);
    }
  }, [callState.isIncoming, callState.isActive, callState.incomingCallData]);

  // Play ringtone when incoming call arrives
  useEffect(() => {
    if (callState.isIncoming && callState.incomingCallData && !callState.isActive) {
      console.log('🔔 Starting ringtone');
      try {
        audioNotifications.playIncomingCall();
      } catch (error) {
        console.error('Error playing ringtone:', error);
      }

      return () => {
        console.log('🔕 Stopping ringtone');
        try {
          audioNotifications.stopIncomingCall?.();
        } catch (error) {
          console.error('Error stopping ringtone:', error);
        }
      };
    }
  }, [callState.isIncoming, callState.isActive, callState.incomingCallData]);

  // Don't render if no incoming call
  if (!callState.isIncoming || callState.isActive || !callState.incomingCallData) {
    return null;
  }

  console.log('✅ Rendering incoming call notification');

  const { callerName, callerAvatar, callType } = callState.incomingCallData;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAccept = async () => {
    console.log('✅ User accepted call');
    try {
      await answerCall();
      toast.success('Call connected');
    } catch (error: any) {
      console.error('Error answering call:', error);
      toast.error(`Failed to answer: ${error.message}`);
    }
  };

  const handleDecline = async () => {
    console.log('❌ User declined call');
    try {
      await declineCall();
      toast.info('Call declined');
    } catch (error: any) {
      console.error('Error declining call:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <Card className="w-96 bg-card/95 backdrop-blur shadow-2xl border-2 animate-in zoom-in duration-300">
        <CardContent className="p-8 text-center space-y-6">
          {/* Caller Avatar with Pulse */}
          <div className="relative mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Avatar className="h-24 w-24 mx-auto ring-4 ring-primary/20 relative z-10">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(callerName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 z-20">
              {callType === 'video' ? (
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Video className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Phone className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Call Info */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{callerName}</h3>
            <p className="text-muted-foreground text-lg">
              Incoming {callType} call
            </p>
            <p className="text-xs text-muted-foreground animate-pulse">
              Ringing...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {/* Decline */}
            <div className="text-center">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDecline}
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all hover:scale-110"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Decline</p>
            </div>

            {/* Answer */}
            <div className="text-center">
              <Button
                variant="default"
                size="lg"
                onClick={handleAccept}
                className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse"
              >
                {callType === 'video' ? (
                  <Video className="h-7 w-7" />
                ) : (
                  <Phone className="h-7 w-7" />
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Answer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
