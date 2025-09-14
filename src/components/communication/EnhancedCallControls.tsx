import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  VideoOff, 
  Mic, 
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  MoreVertical,
  Circle,
  VolumeX,
  Volume2,
  Settings,
  UserPlus,
  Shield,
  Hand,
  Grid3X3,
  Maximize,
  Minimize,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHost?: boolean;
  isHandRaised?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface EnhancedCallControlsProps {
  recipientName?: string;
  participants?: CallParticipant[];
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
  onInviteParticipant?: (userId: string) => void;
  onEndCall?: () => void;
}

export function EnhancedCallControls({ 
  recipientName, 
  participants = [],
  onStartCall, 
  onStartVideoCall,
  onInviteParticipant,
  onEndCall
}: EnhancedCallControlsProps) {
  // Call states
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed'>('connecting');
  
  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // UI states
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'speaker' | 'focus'>('speaker');
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // Lobby states
  const [waitingParticipants, setWaitingParticipants] = useState<CallParticipant[]>([]);

  // Refs for media streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && connectionStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, connectionStatus]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const initializeMedia = async (video: boolean = false) => {
    try {
      setConnectionStatus('connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      streamRef.current = stream;
      
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection establishment
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 2000);
      
      return stream;
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Error accessing media:', error);
      toast({
        title: 'Media Access Error',
        description: 'Could not access camera/microphone. Please check permissions.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const startAudioCall = async () => {
    try {
      await initializeMedia(false);
      setIsCallActive(true);
      setIsVideoCall(false);
      setCallDuration(0);
      
      toast({
        title: 'Audio Call Started',
        description: `Connecting to ${recipientName || 'participant'}...`,
      });
      
      onStartCall?.();
    } catch (error) {
      setIsCallActive(false);
    }
  };

  const startVideoCall = async () => {
    try {
      await initializeMedia(true);
      setIsCallActive(true);
      setIsVideoCall(true);
      setCallDuration(0);
      
      toast({
        title: 'Video Call Started',
        description: `Connecting to ${recipientName || 'participant'}...`,
      });
      
      onStartVideoCall?.();
    } catch (error) {
      setIsCallActive(false);
    }
  };

  const endCall = () => {
    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset all states
    setIsCallActive(false);
    setIsVideoCall(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    setIsRecording(false);
    setIsScreenSharing(false);
    setIsHandRaised(false);
    setCallDuration(0);
    setConnectionStatus('connecting');
    setShowParticipants(false);
    setShowChat(false);
    
    onEndCall?.();
    
    toast({
      title: 'Call Ended',
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        
        toast({
          title: isMuted ? 'Microphone On' : 'Microphone Off',
          description: `You are now ${isMuted ? 'unmuted' : 'muted'}`,
        });
      }
    }
  };

  const toggleVideo = () => {
    if (isCallActive && isVideoCall) {
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !isVideoEnabled;
          setIsVideoEnabled(!isVideoEnabled);
          
          toast({
            title: isVideoEnabled ? 'Camera Off' : 'Camera On',
            description: `Your camera is now ${isVideoEnabled ? 'off' : 'on'}`,
          });
        }
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
        
        setIsScreenSharing(true);
        toast({
          title: 'Screen Sharing Started',
          description: 'Your screen is now being shared',
        });
        
        // Handle stream ended event (user clicks browser's stop sharing button)
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          toast({
            title: 'Screen Sharing Stopped',
            description: 'Screen sharing has ended',
          });
        };
      } else {
        setIsScreenSharing(false);
        toast({
          title: 'Screen Sharing Stopped',
          description: 'Screen sharing has been stopped',
        });
      }
    } catch (error) {
      toast({
        title: 'Screen Share Error',
        description: 'Could not start screen sharing',
        variant: 'destructive',
      });
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      description: isRecording ? 
        'Recording saved and will be available soon' : 
        'This meeting is now being recorded',
    });
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? 'Hand Lowered' : 'Hand Raised',
      description: isHandRaised ? 
        'Your hand has been lowered' : 
        'Your hand is raised',
    });
  };

  const getConnectionQualityIcon = (quality?: string) => {
    switch (quality) {
      case 'excellent': return <Wifi className="h-3 w-3 text-green-500" />;
      case 'good': return <Wifi className="h-3 w-3 text-yellow-500" />;
      case 'poor': return <WifiOff className="h-3 w-3 text-red-500" />;
      default: return <Wifi className="h-3 w-3 text-gray-500" />;
    }
  };

  const admitFromLobby = (participantId: string) => {
    const participant = waitingParticipants.find(p => p.id === participantId);
    if (participant) {
      setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
      toast({
        title: 'Participant Admitted',
        description: `${participant.name} has joined the call`,
      });
    }
  };

  // Initial call buttons (Teams-style)
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

  // Active call interface
  return (
    <Dialog open={isCallActive} onOpenChange={() => {}}>
      <DialogContent 
        className={cn(
          "max-w-6xl max-h-[90vh] p-0 gap-0 bg-gray-900 text-white border-gray-700",
          isFullscreen && "max-w-[100vw] max-h-[100vh] w-full h-full"
        )}
      >
        {/* Header Bar */}
        <DialogHeader className="px-6 py-3 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="flex items-center gap-2 text-white">
                {isVideoCall ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                <span className="font-medium">
                  {participants.length > 0 ? 
                    `Meeting (${participants.length + 1})` : 
                    `Call with ${recipientName || 'Participant'}`
                  }
                </span>
              </DialogTitle>
              
              {connectionStatus === 'connected' && (
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(callDuration)}
                </Badge>
              )}
              
              {connectionStatus !== 'connected' && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs animate-pulse",
                    connectionStatus === 'connecting' && "bg-yellow-600 text-white",
                    connectionStatus === 'reconnecting' && "bg-orange-600 text-white",
                    connectionStatus === 'failed' && "bg-red-600 text-white"
                  )}
                >
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'reconnecting' && 'Reconnecting...'}
                  {connectionStatus === 'failed' && 'Connection Failed'}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse bg-red-600">
                  <Circle className="h-2 w-2 mr-1 fill-current" />
                  REC
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col bg-gray-900">
            {/* Video Display */}
            <div className="flex-1 relative bg-black">
              {isVideoCall ? (
                <div className={cn(
                  "grid gap-2 h-full p-4",
                  participants.length === 0 ? "grid-cols-1" :
                  participants.length <= 1 ? "grid-cols-2" :
                  participants.length <= 3 ? "grid-cols-2" :
                  "grid-cols-3"
                )}>
                  {/* Remote participant video */}
                  <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <span>{recipientName || 'Remote'}</span>
                      {getConnectionQualityIcon('good')}
                    </div>
                  </div>

                  {/* Local participant video */}
                  <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                    {isVideoEnabled ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center">
                          <CameraOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                          <div className="text-gray-400">Camera is off</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-2">
                      <span>You</span>
                      {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                      {isHandRaised && <Hand className="h-3 w-3 text-yellow-400" />}
                    </div>
                    
                    {isScreenSharing && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        Sharing
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Audio Call Display */
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="h-32 w-32 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4">
                      {(recipientName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xl font-medium text-white mb-2">
                      {recipientName || 'Participant'}
                    </div>
                    <div className="text-gray-400">Audio call</div>
                  </div>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 p-4 shrink-0">
              <div className="flex items-center justify-center gap-3">
                {/* Audio Control */}
                <Button
                  variant={isMuted ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleMute}
                  className={cn(
                    "h-12 w-12 rounded-full p-0 transition-all",
                    isMuted 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  )}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                {/* Video Control */}
                {isVideoCall && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={toggleVideo}
                    className={cn(
                      "h-12 w-12 rounded-full p-0 transition-all",
                      !isVideoEnabled 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    )}
                    title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                  >
                    {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                  </Button>
                )}

                {/* Screen Share */}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleScreenShare}
                  className={cn(
                    "h-12 w-12 rounded-full p-0 transition-all",
                    isScreenSharing 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  )}
                  title={isScreenSharing ? "Stop sharing" : "Share screen"}
                >
                  {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </Button>

                {/* Raise Hand */}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleHandRaise}
                  className={cn(
                    "h-12 w-12 rounded-full p-0 transition-all",
                    isHandRaised 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  )}
                  title={isHandRaised ? "Lower hand" : "Raise hand"}
                >
                  <Hand className="h-5 w-5" />
                </Button>

                {/* Record */}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleRecording}
                  className={cn(
                    "h-12 w-12 rounded-full p-0 transition-all",
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  )}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  <Circle className="h-5 w-5" />
                </Button>

                {/* Chat */}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowChat(!showChat)}
                  className="h-12 w-12 rounded-full p-0 bg-gray-600 hover:bg-gray-500 text-white"
                  title="Open chat"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Participants */}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="h-12 w-12 rounded-full p-0 bg-gray-600 hover:bg-gray-500 text-white relative"
                  title="Show participants"
                >
                  <Users className="h-5 w-5" />
                  {participants.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] text-xs bg-blue-600">
                      {participants.length + 1}
                    </Badge>
                  )}
                </Button>

                {/* More Options */}
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 w-12 rounded-full p-0 bg-gray-600 hover:bg-gray-500 text-white"
                  title="More options"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>

                {/* End Call */}
                <Button 
                  variant="destructive" 
                  size="lg" 
                  onClick={endCall}
                  className="h-12 w-12 rounded-full p-0 bg-red-600 hover:bg-red-700 ml-4"
                  title="End call"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Panels */}
          {(showParticipants || showChat || waitingParticipants.length > 0) && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Waiting Lobby */}
              {waitingParticipants.length > 0 && (
                <div className="p-4 bg-yellow-900/20 border-b border-gray-700">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Lobby ({waitingParticipants.length})
                  </h3>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-2">
                      {waitingParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="text-xs">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-white">{participant.name}</span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => admitFromLobby(participant.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            Admit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Participants Panel */}
              {showParticipants && (
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    In this meeting ({participants.length + 1})
                  </h3>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2">
                      {/* Current user */}
                      <div className="flex items-center gap-3 p-2 rounded bg-gray-700/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white">You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">You</div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                            {!isVideoEnabled && <CameraOff className="h-3 w-3" />}
                            {isHandRaised && <Hand className="h-3 w-3 text-yellow-400" />}
                            <Shield className="h-3 w-3" />
                          </div>
                        </div>
                      </div>

                      {/* Other participants */}
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="text-xs">
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{participant.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                              {participant.isVideoOff && <CameraOff className="h-3 w-3" />}
                              {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-400" />}
                              {participant.isHost && <Shield className="h-3 w-3" />}
                              {getConnectionQualityIcon(participant.connectionQuality)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Chat Panel */}
              {showChat && (
                <div className="flex-1 flex flex-col p-4">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Meeting Chat
                  </h3>
                  <div className="flex-1 bg-gray-900 rounded p-3 text-center text-gray-400 text-sm">
                    Chat functionality would be implemented here
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connection Quality Indicator */}
        <div className="absolute top-16 right-4">
          <Badge variant="outline" className="text-xs bg-gray-800 border-gray-600 text-gray-300">
            {getConnectionQualityIcon(connectionStatus === 'connected' ? 'good' : 'poor')}
            <span className="ml-1 capitalize">
              {connectionStatus === 'connected' ? 'Good Connection' : connectionStatus}
            </span>
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
