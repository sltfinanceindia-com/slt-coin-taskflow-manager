import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Video, PhoneIncoming } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function CallTestButtons() {
  const { simulateIncomingCall, startVoiceCall, startVideoCall } = useWebRTC();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Call Testing (Demo)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => startVoiceCall('demo-user-1')}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Voice Call
          </Button>
          
          <Button
            onClick={() => startVideoCall('demo-user-1')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Video Call
          </Button>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Simulate incoming calls:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => simulateIncomingCall('demo-caller-1', 'John Doe', 'voice')}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <PhoneIncoming className="h-3 w-3" />
              Voice
            </Button>
            
            <Button
              onClick={() => simulateIncomingCall('demo-caller-2', 'Jane Smith', 'video')}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <PhoneIncoming className="h-3 w-3" />
              Video
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}