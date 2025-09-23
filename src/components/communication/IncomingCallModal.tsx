import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md mx-auto bg-background/95 backdrop-blur-lg border border-border/50 shadow-2xl">
        <div className="flex flex-col items-center space-y-6 p-6">
          {/* Caller Info */}
          <div className="text-center space-y-3">
            <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(callerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{callerName}</h3>
              <p className="text-sm text-muted-foreground">
                Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
              </p>
            </div>
          </div>

          {/* Call Actions */}
          <div className="flex items-center justify-center space-x-4">
            {/* Decline Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-500 hover:text-red-600"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Accept Button */}
            <Button
              size="lg"
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white border-0"
            >
              <Phone className="h-6 w-6" />
            </Button>

            {/* Accept with Video (for voice calls) */}
            {callType === 'voice' && onAcceptWithVideo && (
              <Button
                variant="outline"
                size="lg"
                onClick={onAcceptWithVideo}
                className="w-16 h-16 rounded-full bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-500 hover:text-blue-600"
              >
                <Video className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Action Labels */}
          <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
            <span>Decline</span>
            <span>Accept</span>
            {callType === 'voice' && onAcceptWithVideo && <span>Video</span>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}