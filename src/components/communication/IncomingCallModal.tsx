import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Vibrate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { audioNotifications } from '@/utils/audioNotifications';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
  onAcceptWithVideo?: () => void;
}

export default function IncomingCallModal({
  isOpen,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
  onAcceptWithVideo
}: IncomingCallModalProps) {
  const [ringingAnimation, setRingingAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRingingAnimation(true);
      // Start ringtone
      audioNotifications.playIncomingCall();
    } else {
      setRingingAnimation(false);
    }
  }, [isOpen]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md mx-auto bg-background/95 backdrop-blur-lg border border-border/50 shadow-2xl animate-scale-in">
        <div className="flex flex-col items-center space-y-6 p-6">
          {/* Caller Info */}
          <div className="text-center space-y-4">
            <div className="relative">
              {/* Pulsing ring animation for incoming call */}
              {ringingAnimation && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-success animate-ping opacity-75" 
                       style={{ padding: '12px' }} />
                  <div className="absolute inset-0 rounded-full border-2 border-success/50 animate-pulse" 
                       style={{ padding: '16px' }} />
                </>
              )}
              
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-success/20 shadow-green">
                <AvatarImage src={callerAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(callerName)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground">{callerName}</h3>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                {callType === 'video' ? (
                  <>
                    <Video className="h-4 w-4" />
                    Incoming Video Call
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Incoming Voice Call
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Calling you...
              </p>
            </div>
          </div>

          {/* Call Actions */}
          <div className="flex items-center justify-center space-x-6">
            {/* Decline Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-destructive/10 border-destructive/20 hover:bg-destructive/20 text-destructive hover:text-destructive shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Accept Button */}
            <Button
              size="lg"
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-success hover:bg-success/90 text-success-foreground border-0 shadow-green hover:shadow-glow transition-all duration-200 hover:scale-105 pulse-glow"
            >
              <Phone className="h-6 w-6" />
            </Button>

            {/* Accept with Video (for voice calls) */}
            {callType === 'voice' && onAcceptWithVideo && (
              <Button
                variant="outline"
                size="lg"
                onClick={onAcceptWithVideo}
                className="w-16 h-16 rounded-full bg-info/10 border-info/20 hover:bg-info/20 text-info hover:text-info shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Video className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Action Labels */}
          <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
            <span className="flex flex-col items-center gap-1">
              <span>Decline</span>
            </span>
            <span className="flex flex-col items-center gap-1">
              <span>Accept</span>
            </span>
            {callType === 'voice' && onAcceptWithVideo && (
              <span className="flex flex-col items-center gap-1">
                <span>Video</span>
              </span>
            )}
          </div>

          {/* Mobile vibration indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Vibrate className="h-3 w-3 animate-pulse" />
            <span>Phone vibrating</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}