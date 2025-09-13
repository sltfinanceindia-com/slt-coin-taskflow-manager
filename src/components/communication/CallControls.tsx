import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Monitor } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CallControlsProps {
  recipientName?: string;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
}

export function CallControls({ recipientName, onStartCall, onStartVideoCall }: CallControlsProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const startAudioCall = () => {
    setIsCallActive(true);
    setIsVideoOn(false);
    onStartCall?.();
    toast({
      title: "Audio Call Started",
      description: `Calling ${recipientName || 'team member'}...`,
    });
  };

  const startVideoCall = () => {
    setIsCallActive(true);
    setIsVideoOn(true);
    onStartVideoCall?.();
    toast({
      title: "Video Call Started",
      description: `Video calling ${recipientName || 'team member'}...`,
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    setIsVideoOn(false);
    setIsScreenSharing(false);
    toast({
      title: "Call Ended",
      description: "The call has been disconnected.",
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: `Microphone is now ${isMuted ? 'on' : 'off'}.`,
    });
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      title: isVideoOn ? "Video Off" : "Video On",
      description: `Camera is now ${isVideoOn ? 'off' : 'on'}.`,
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen Share Stopped" : "Screen Share Started",
      description: `Screen sharing is now ${isScreenSharing ? 'off' : 'on'}.`,
    });
  };

  if (!isCallActive) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startAudioCall}
          className="hover:bg-green-50 hover:border-green-500"
        >
          <Phone className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={startVideoCall}
          className="hover:bg-blue-50 hover:border-blue-500"
        >
          <Video className="h-4 w-4 text-blue-600" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isCallActive} onOpenChange={setIsCallActive}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            Call with {recipientName || 'Team Member'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                {isVideoOn ? (
                  <Video className="h-8 w-8 text-primary" />
                ) : (
                  <Phone className="h-8 w-8 text-primary" />
                )}
              </div>
              <Badge variant={isVideoOn ? "default" : "secondary"}>
                {isVideoOn ? "Video Call" : "Audio Call"}
              </Badge>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            {isVideoOn && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="sm"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={endCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}