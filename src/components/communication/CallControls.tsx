import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Video, PhoneOff, VideoOff, Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CallControlsProps {
  recipientName?: string;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
}

export function CallControls({ recipientName, onStartCall, onStartVideoCall }: CallControlsProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const startAudioCall = () => {
    setIsCallActive(true);
    setIsVideoCall(false);
    toast({
      title: 'Audio Call Started',
      description: `Calling ${recipientName || 'user'}...`,
    });
    onStartCall?.();
  };

  const startVideoCall = () => {
    setIsCallActive(true);
    setIsVideoCall(true);
    toast({
      title: 'Video Call Started',
      description: `Video calling ${recipientName || 'user'}...`,
    });
    onStartVideoCall?.();
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsVideoCall(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    toast({
      title: 'Call Ended',
      description: 'Call has been ended',
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Unmuted' : 'Muted',
      description: `Microphone ${isMuted ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? 'Video Off' : 'Video On',
      description: `Camera ${isVideoEnabled ? 'disabled' : 'enabled'}`,
    });
  };

  if (!isCallActive) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={startAudioCall}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={startVideoCall}>
          <Video className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isCallActive} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isVideoCall ? 'Video Call' : 'Audio Call'} with {recipientName || 'User'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          {isVideoCall && (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              {isVideoEnabled ? (
                <div className="text-muted-foreground">Video feed would appear here</div>
              ) : (
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            {isVideoCall && (
              <Button
                variant={isVideoEnabled ? "outline" : "destructive"}
                size="lg"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            )}
            
            <Button variant="destructive" size="lg" onClick={endCall}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}