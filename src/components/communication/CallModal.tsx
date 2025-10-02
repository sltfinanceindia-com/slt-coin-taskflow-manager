import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Monitor,
  MonitorOff,
  Users,
  Maximize2,
  Minimize2,
  Settings,
  Camera,
  CameraOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CallState } from '@/hooks/useWebRTC';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callState: CallState;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  recipientName: string;
  recipientAvatar?: string;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
}

export default function CallModal({
  isOpen,
  onClose,
  callState,
  localStream,
  remoteStreams,
  localVideoRef,
  recipientName,
  recipientAvatar,
  onAnswer,
  onDecline,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onStartScreenShare,
  onStopScreenShare
}: CallModalProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Set up remote stream
  useEffect(() => {
    const remoteStream = Array.from(remoteStreams.values())[0];
    if (remoteStream) {
      console.log('Setting remote stream:', remoteStream.id);
      
      // For video calls, show remote video
      if (remoteVideoRef.current && callState.callType === 'video') {
        remoteVideoRef.current.srcObject = remoteStream;
        console.log('Remote video stream set');
      }
      
      // Always play remote audio
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        console.log('Remote audio stream set');
      }
    }
  }, [remoteStreams, callState.callType]);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream && callState.callType === 'video') {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true; // Always mute local video to prevent echo
      console.log('Local video stream set');
    }
  }, [localStream, localVideoRef, callState.callType]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Incoming call UI
  if (callState.isIncoming && !callState.isActive) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-6 py-8">
            {/* Caller Avatar with Pulse Animation */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <Avatar className="h-32 w-32 border-4 border-primary relative z-10">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="text-3xl">
                  {getInitials(callState.incomingCallData?.callerName || 'Unknown')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Caller Info */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                {callState.incomingCallData?.callerName || 'Unknown Caller'}
              </h2>
              <Badge variant="secondary" className="text-sm px-4 py-1">
                {callState.callType === 'video' ? (
                  <><Video className="h-3 w-3 mr-1 inline" /> Video Call</>
                ) : (
                  <><Phone className="h-3 w-3 mr-1 inline" /> Voice Call</>
                )}
              </Badge>
              <p className="text-muted-foreground text-sm animate-pulse">
                Ringing...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={onDecline}
                  className="rounded-full w-16 h-16 shadow-lg hover:scale-110 transition-transform"
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Decline</p>
              </div>
              
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={onAnswer}
                  className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600 shadow-lg hover:scale-110 transition-transform"
                >
                  <Phone className="h-7 w-7" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Answer</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Active call UI
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 gap-0",
          isFullscreen ? "w-screen h-screen max-w-none" : "sm:max-w-4xl h-[80vh]"
        )}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
          {/* Remote Video/Avatar */}
          {callState.callType === 'video' ? (
            <div className="relative w-full h-full">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Overlay if video is disabled */}
              {!callState.participants[0]?.isVideoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <Avatar className="h-40 w-40 mb-4">
                    <AvatarImage src={recipientAvatar} />
                    <AvatarFallback className="text-5xl">
                      {getInitials(recipientName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white text-lg">Camera is off</p>
                </div>
              )}
            </div>
          ) : (
            // Voice call - show avatar
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                {/* Speaking indicator */}
                {callState.participants[0]?.isSpeaking && (
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
                )}
                <Avatar className="h-40 w-40 border-4 border-primary/50 relative z-10">
                  <AvatarImage src={recipientAvatar} />
                  <AvatarFallback className="text-5xl">
                    {getInitials(recipientName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-white text-3xl font-semibold">{recipientName}</h2>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {formatDuration(callState.duration)}
              </Badge>
            </div>
          )}

          {/* Remote Audio (always present) */}
          <audio ref={remoteAudioRef} autoPlay />

          {/* Local Video (Picture-in-Picture) */}
          {callState.callType === 'video' && localStream && (
            <div className="absolute top-4 right-4 w-56 h-40 rounded-lg overflow-hidden border-2 border-white shadow-2xl bg-black">
              {callState.isVideoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                  <CameraOff className="h-8 w-8 text-white mb-2" />
                  <p className="text-white text-xs">Camera off</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                You
              </div>
            </div>
          )}

          {/* Call Info Overlay - Top Left */}
          <div className="absolute top-4 left-4 text-white space-y-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-3">
              <h3 className="text-lg font-semibold">{recipientName}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-80">{formatDuration(callState.duration)}</span>
                {callState.participants.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      callState.participants[0].connectionQuality === 'excellent' && 'bg-green-500/80',
                      callState.participants[0].connectionQuality === 'good' && 'bg-yellow-500/80',
                      callState.participants[0].connectionQuality === 'poor' && 'bg-red-500/80'
                    )}
                  >
                    {callState.participants[0].connectionQuality === 'excellent' && '🟢'}
                    {callState.participants[0].connectionQuality === 'good' && '🟡'}
                    {callState.participants[0].connectionQuality === 'poor' && '🔴'}
                    {' '}
                    {callState.participants[0].connectionQuality}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Status Indicators - Top Right (under local video) */}
          <div className="absolute top-4 left-4 flex gap-2">
            {callState.isMuted && (
              <Badge variant="destructive" className="gap-1">
                <MicOff className="h-3 w-3" /> Muted
              </Badge>
            )}
            {callState.isScreenSharing && (
              <Badge variant="default" className="gap-1">
                <Monitor className="h-3 w-3" /> Sharing
              </Badge>
            )}
          </div>

          {/* Call Controls - Bottom Center */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <Card className="p-4 bg-black/60 backdrop-blur-md border-white/20">
              <div className="flex items-center gap-3">
                {/* Mute Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    variant={callState.isMuted ? "destructive" : "secondary"}
                    onClick={onToggleMute}
                    className="rounded-full w-14 h-14 hover:scale-110 transition-transform"
                    title={callState.isMuted ? "Unmute" : "Mute"}
                  >
                    {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  <p className="text-xs text-white/80 mt-1">
                    {callState.isMuted ? 'Unmute' : 'Mute'}
                  </p>
                </div>

                {/* Video Button (only for video calls) */}
                {callState.callType === 'video' && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      variant={callState.isVideoEnabled ? "secondary" : "destructive"}
                      onClick={onToggleVideo}
                      className="rounded-full w-14 h-14 hover:scale-110 transition-transform"
                      title={callState.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                    >
                      {callState.isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </Button>
                    <p className="text-xs text-white/80 mt-1">
                      {callState.isVideoEnabled ? 'Camera' : 'Camera'}
                    </p>
                  </div>
                )}

                {/* End Call Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={onEndCall}
                    className="rounded-full w-16 h-16 hover:scale-110 transition-transform shadow-lg"
                    title="End call"
                  >
                    <PhoneOff className="h-7 w-7" />
                  </Button>
                  <p className="text-xs text-white/80 mt-1">End</p>
                </div>

                {/* Speaker Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    variant={callState.isSpeakerOn ? "default" : "secondary"}
                    onClick={onToggleSpeaker}
                    className="rounded-full w-14 h-14 hover:scale-110 transition-transform"
                    title={callState.isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
                  >
                    {callState.isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                  </Button>
                  <p className="text-xs text-white/80 mt-1">Speaker</p>
                </div>

                {/* Screen Share Button (only for video calls) */}
                {callState.callType === 'video' && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      variant={callState.isScreenSharing ? "default" : "secondary"}
                      onClick={callState.isScreenSharing ? onStopScreenShare : onStartScreenShare}
                      className="rounded-full w-14 h-14 hover:scale-110 transition-transform"
                      title={callState.isScreenSharing ? "Stop sharing" : "Share screen"}
                    >
                      {callState.isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                    </Button>
                    <p className="text-xs text-white/80 mt-1">Share</p>
                  </div>
                )}

                {/* Fullscreen Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={toggleFullscreen}
                    className="rounded-full w-14 h-14 hover:scale-110 transition-transform"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                  </Button>
                  <p className="text-xs text-white/80 mt-1">
                    {isFullscreen ? 'Exit' : 'Full'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Participants Count (if more than 1) */}
          {callState.participants.length > 1 && (
            <div className="absolute bottom-8 right-8">
              <Badge variant="secondary" className="gap-2 py-2 px-3">
                <Users className="h-4 w-4" />
                {callState.participants.length} participants
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
