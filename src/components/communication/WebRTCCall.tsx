import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Monitor,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  Camera,
  ScreenShare,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WebRTCCallProps {
  callId: string;
  isVideoCall: boolean;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onEndCall: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  stream?: MediaStream;
}

export function WebRTCCall({ 
  callId, 
  isVideoCall, 
  recipientId, 
  recipientName, 
  recipientAvatar,
  onEndCall,
  onMinimize,
  isMinimized = false
}: WebRTCCallProps) {
  const { profile } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callStartTimeRef = useRef<number>(Date.now());

  // Initialize WebRTC connection
  useEffect(() => {
    initializeCall();
    
    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);

    return () => {
      cleanupCall();
      clearInterval(timer);
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsConnected(true);
        setIsConnecting(false);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate through Supabase channel
          sendSignalingMessage('ice-candidate', event.candidate);
        }
      };

      // Simulate connection for demo
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        setParticipants([
          {
            id: recipientId,
            name: recipientName,
            avatar: recipientAvatar,
            isVideoEnabled: true,
            isAudioEnabled: true
          }
        ]);
      }, 2000);

    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: "Call Error",
        description: "Failed to initialize call. Please check your camera and microphone permissions.",
        variant: "destructive"
      });
      onEndCall();
    }
  };

  const sendSignalingMessage = async (type: string, data: any) => {
    try {
      await supabase
        .channel(`call-${callId}`)
        .send({
          type: 'broadcast',
          event: 'signaling',
          payload: { type, data, senderId: profile?.id }
        });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
              const newVideoTrack = stream.getVideoTracks()[0];
              if (peerConnectionRef.current) {
                const sender = peerConnectionRef.current.getSenders().find(s => 
                  s.track && s.track.kind === 'video'
                );
                if (sender) {
                  sender.replaceTrack(newVideoTrack);
                }
              }
            });
        };
      } else {
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast({
        title: "Screen Share Error",
        description: "Failed to share screen",
        variant: "destructive"
      });
    }
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{recipientName}</p>
                <p className="text-xs text-muted-foreground">{formatDuration(callDuration)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={isAudioEnabled ? "default" : "destructive"}
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onEndCall}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onMinimize}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 bg-background z-50 flex flex-col",
      isFullscreen ? "w-screen h-screen" : "w-full h-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <span className="text-sm text-muted-foreground">{formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onMinimize && (
            <Button variant="outline" size="sm" onClick={onMinimize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {isVideoCall && (
          <>
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </>
        )}

        {/* Audio Call UI */}
        {!isVideoCall && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-6">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="text-4xl">{recipientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">{recipientName}</h2>
              <p className="text-white/70">Audio Call • {formatDuration(callDuration)}</p>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isConnecting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xl">Connecting...</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-card border-t">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Video Toggle (only for video calls) */}
          {isVideoCall && (
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          )}

          {/* Screen Share (only for video calls) */}
          {isVideoCall && (
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={toggleScreenShare}
            >
              <ScreenShare className="h-6 w-6" />
            </Button>
          )}

          {/* Speaker Toggle */}
          <Button
            variant={isSpeakerEnabled ? "default" : "outline"}
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
          >
            {isSpeakerEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}