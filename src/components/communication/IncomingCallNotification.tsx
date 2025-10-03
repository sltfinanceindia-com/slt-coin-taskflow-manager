import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function IncomingCallNotification() {
  const { callState, answerCall, declineCall } = useWebRTC();

  if (!callState.isIncoming || !callState.incomingCallData) {
    return null;
  }

  const { callerName, callerAvatar, callType } = callState.incomingCallData;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-96 bg-card/95 backdrop-blur shadow-2xl border-2">
        <CardContent className="p-8 text-center space-y-6">
          {/* Caller Avatar */}
          <div className="relative mx-auto">
            <Avatar className="h-24 w-24 mx-auto ring-4 ring-primary/20">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(callerName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2">
              {callType === 'video' ? (
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Video className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Call Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{callerName}</h3>
            <p className="text-muted-foreground">
              Incoming {callType} call
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Decline */}
            <Button
              variant="destructive"
              size="lg"
              onClick={declineCall}
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Answer */}
            <Button
              variant="default"
              size="lg"
              onClick={answerCall}
              className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700"
            >
              {callType === 'video' ? (
                <Video className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Additional Actions for Video Calls */}
          {callType === 'video' && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Answer as audio only
                  answerCall();
                }}
                className="text-xs"
              >
                <Phone className="h-3 w-3 mr-1" />
                Answer as Audio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}