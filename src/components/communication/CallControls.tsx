import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Monitor, MonitorOff, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CallControlsProps {
  recipientName?: string;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
  onEndCall?: () => void;
}

export function CallControls({ 
  recipientName, 
  onStartCall, 
  onStartVideoCall,
  onEndCall 
}: CallControlsProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && !isConnecting) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isConnecting]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startAudioCall = async () => {
    setIsConnecting(true);
    setIsCallActive(true);
    setIsVideoOn(false);
    setCallDuration(0);
    
    try {
      await onStartCall?.();
      toast({
        title: "Audio Call Started",
        description: `Connected to ${recipientName || 'team member'}`,
      });
    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Unable to start the call. Please try again.",
        variant: "destructive"
      });
      setIsCallActive(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const startVideoCall = async () => {
    setIsConnecting(true);
    setIsCallActive(true);
    setIsVideoOn(true);
    setCallDuration(0);
    
    try {
      await onStartVideoCall?.();
      toast({
        title: "Video Call Started",
        description: `Video connected to ${recipientName || 'team member'}`,
      });
    } catch (error) {
      toast({
        title: "Video Call Failed",
        description: "Unable to start video call. Please try again.",
        variant: "destructive"
      });
      setIsCallActive(false);
      setIsVideoOn(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    setIsVideoOn(false);
    setIsScreenSharing(false);
    setCallDuration(0);
    setIsConnecting(false);
    
    onEndCall?.();
    toast({
      title: "Call Ended",
      description: `Call with ${recipientName || 'team member'} has ended.`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone On" : "Microphone Off",
      description: `You are now ${isMuted ? 'unmuted' : 'muted'}.`,
    });
  };

  const toggleVideo = () => {
    if (isCallActive) {
      setIsVideoOn(!isVideoOn);
      toast({
        title: isVideoOn ? "Camera Off" : "Camera On",
        description: `Your camera is now ${isVideoOn ? 'off' : 'on'}.`,
      });
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen Share Stopped" : "Screen Share Started",
      description: `Screen sharing ${isScreenSharing ? 'ended' : 'started'}.`,
    });
  };

  // Initial call buttons (Teams-like styling)
  if (!isCallActive) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={startAudioCall}
          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors"
          title="Start audio call"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={startVideoCall}
          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
          title="Start video call"
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Active call dialog (Teams-like interface)
  return (
    <Dialog open={isCallActive} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg max-w-[95vw] p-0 gap-0 bg-gray-900 text-white border-gray-700"
      >
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isConnecting ? (
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                ) : (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
                <span className="text-sm font-medium">
                  {isConnecting ? 'Connecting...' : recipientName || 'Team Member'}
                </span>
              </div>
              {!isConnecting && (
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  {formatDuration(callDuration)}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-4">
          {/* Video/Avatar Display Area */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-32 w-32 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-700">
                {isVideoOn ? (
                  <div className="text-center">
                    <Video className="h-8 w-8 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Video Active</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mb-1">
                      {(recipientName || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">Audio Only</div>
                  </div>
                )}
              </div>
              {isMuted && (
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                  <MicOff className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Call Status */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Badge 
                variant={isVideoOn ? "default" : "secondary"} 
                className={`${isVideoOn ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
              >
                {isVideoOn ? "Video Call" : "Audio Call"}
              </Badge>
              {isScreenSharing && (
                <Badge className="bg-green-600 text-white">
                  <Monitor className="h-3 w-3 mr-1" />
                  Sharing
                </Badge>
              )}
            </div>
            {isConnecting && (
              <div className="text-sm text-gray-400">Establishing connection...</div>
            )}
          </div>

          {/* Call Controls (Teams-style) */}
          <div className="flex justify-center items-center gap-3">
            <Button
              variant={isMuted ? "default" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className={`h-12 w-12 rounded-full p-0 ${
                isMuted 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={toggleVideo}
              className={`h-12 w-12 rounded-full p-0 ${
                isVideoOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isVideoOn ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={toggleScreenShare}
              className={`h-12 w-12 rounded-full p-0 ${
                isScreenSharing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="h-12 w-12 rounded-full p-0 bg-red-600 hover:bg-red-700"
              title="End call"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
