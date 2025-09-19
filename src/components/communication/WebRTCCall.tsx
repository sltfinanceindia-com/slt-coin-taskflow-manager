import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Minimize2,
  Maximize2,
  Speaker,
  Settings,
  MoreVertical,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WebRTCCallProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'audio' | 'video';
  recipient?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isIncoming?: boolean;
  onMinimize?: () => void;
}

export function WebRTCCall({ 
  isOpen, 
  onClose, 
  callType, 
  recipient,
  isIncoming = false,
  onMinimize 
}: WebRTCCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  const [isAnswering, setIsAnswering] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { toast } = useToast();

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected && connectionStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected, connectionStatus]);

  // Initialize call when opened
  useEffect(() => {
    if (isOpen && !isIncoming) {
      initializeCall();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const initializeCall = async () => {
    try {
      setConnectionStatus('connecting');
      
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Prevent echo
      }
      
      // Initialize peer connection with STUN servers
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;
      
      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log('Connection state:', state);
        
        switch (state) {
          case 'connected':
            setIsConnected(true);
            setConnectionStatus('connected');
            toast({
              title: "Call Connected",
              description: `Connected to ${recipient?.name || 'participant'}`,
            });
            break;
          case 'disconnected':
          case 'failed':
            setConnectionStatus('disconnected');
            if (isConnected) {
              toast({
                title: "Call Ended",
                description: "The call has been disconnected",
                variant: "destructive"
              });
            }
            handleEndCall();
            break;
        }
      };
      
      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
      };
      
      // Simulate successful connection for demo
      setTimeout(() => {
        if (peerConnection.connectionState !== 'closed') {
          setIsConnected(true);
          setConnectionStatus('connected');
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('Error initializing call:', error);
      setConnectionStatus('failed');
      toast({
        title: "Call Failed",
        description: error.message || "Unable to access camera/microphone",
        variant: "destructive"
      });
    }
  };

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsConnected(false);
    setCallDuration(0);
    setConnectionStatus('disconnected');
  }, []);

  const handleAnswerCall = async () => {
    setIsAnswering(true);
    await initializeCall();
    setIsAnswering(false);
  };

  const handleEndCall = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast({
          title: audioTrack.enabled ? "Microphone On" : "Microphone Off",
          description: audioTrack.enabled ? "You are now unmuted" : "You are now muted",
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && callType === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        toast({
          title: videoTrack.enabled ? "Camera On" : "Camera Off",
          description: videoTrack.enabled ? "Your camera is now on" : "Your camera is now off",
        });
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker control is limited in web browsers
    toast({
      title: isSpeakerOn ? "Speaker Off" : "Speaker On",
      description: isSpeakerOn ? "Audio output normal" : "Speaker mode enabled",
    });
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Incoming call UI
  if (isIncoming && !isConnected) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center justify-center h-full">
          <Card className="w-96 mx-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={recipient?.avatar} />
                    <AvatarFallback className="text-2xl">{recipient?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    {callType === 'video' ? 'Video Call' : 'Audio Call'}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold">{recipient?.name || 'Unknown User'}</h3>
                  <p className="text-muted-foreground">
                    Incoming {callType} call...
                  </p>
                </div>

                <div className="flex justify-center space-x-8">
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndCall}
                    className="rounded-full w-16 h-16 p-0"
                    disabled={isAnswering}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleAnswerCall}
                    className="rounded-full w-16 h-16 p-0 bg-green-600 hover:bg-green-700"
                    disabled={isAnswering}
                  >
                    <Phone className="h-6 w-6" />
                  </Button>
                </div>
                
                {isAnswering && (
                  <p className="text-sm text-muted-foreground">Connecting...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Minimized call UI
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={recipient?.avatar} />
                  <AvatarFallback className="text-xs">{recipient?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{recipient?.name || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isConnected ? formatDuration(callDuration) : 'Connecting...'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEndCall}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <PhoneOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full call UI
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <Card className={cn(
        "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
        callType === 'video' ? "w-[95vw] h-[95vh] max-w-6xl max-h-[800px]" : "w-96 h-auto"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipient?.avatar} />
              <AvatarFallback>{recipient?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{recipient?.name || 'Unknown User'}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'} className="text-xs">
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'failed' && 'Connection Failed'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                </Badge>
                {isConnected && (
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(callDuration)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleMinimize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          {callType === 'video' && (
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border">
              {/* Remote video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Connection status overlay */}
              {!isConnected && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-pulse mb-4">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={recipient?.avatar} />
                        <AvatarFallback className="text-2xl">{recipient?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-lg">
                      {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Lost'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Local video */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audio-only call display */}
          {callType === 'audio' && (
            <div className="py-12 text-center">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={recipient?.avatar} />
                  <AvatarFallback className="text-4xl">{recipient?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {isConnected && (
                  <div className="absolute -bottom-2 -right-2">
                    <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-semibold mb-2">{recipient?.name || 'Unknown User'}</h3>
              <p className="text-muted-foreground">
                {isConnected ? 'Call in progress' : 'Connecting...'}
              </p>
            </div>
          )}

          {/* Call controls */}
          <div className="flex justify-center items-center space-x-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-14 h-14 p-0 transition-all hover:scale-105"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {callType === 'video' && (
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-14 h-14 p-0 transition-all hover:scale-105"
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}

            <Button
              variant={isSpeakerOn ? "default" : "secondary"}
              size="lg"
              onClick={toggleSpeaker}
              className="rounded-full w-14 h-14 p-0 transition-all hover:scale-105"
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <Speaker className="h-6 w-6" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14 p-0 transition-all hover:scale-105"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          {/* Status indicators */}
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
            {isMuted && (
              <div className="flex items-center space-x-1">
                <MicOff className="h-3 w-3" />
                <span>Muted</span>
              </div>
            )}
            {callType === 'video' && !isVideoEnabled && (
              <div className="flex items-center space-x-1">
                <VideoOff className="h-3 w-3" />
                <span>Camera off</span>
              </div>
            )}
            {isSpeakerOn && (
              <div className="flex items-center space-x-1">
                <Volume2 className="h-3 w-3" />
                <span>Speaker</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}