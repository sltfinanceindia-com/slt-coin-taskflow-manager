import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  Mic, 
  MicOff, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Volume2, 
  VolumeX,
  Users,
  Settings,
  MessageSquare,
  MoreVertical,
  Maximize2,
  Minimize2,
  Grid3x3,
  User,
  Signal,
  Wifi,
  WifiOff,
  Camera,
  CameraOff,
  Speaker,
  Headphones,
  Clock,
  StopCircle,
  Square,
  Pause,
  Play,
  Download,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isPresenter: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface CallStats {
  bitrate: number;
  latency: number;
  packetLoss: number;
  resolution: string;
}

interface CallControlsProps {
  recipientName?: string;
  recipientAvatar?: string;
  participants?: CallParticipant[];
  onStartCall?: () => Promise<void>;
  onStartVideoCall?: () => Promise<void>;
  onEndCall?: () => void;
  onInviteParticipants?: () => void;
  onToggleChat?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isGroupCall?: boolean;
  maxParticipants?: number;
}

export function CallControls({ 
  recipientName, 
  recipientAvatar,
  participants = [],
  onStartCall, 
  onStartVideoCall,
  onEndCall,
  onInviteParticipants,
  onToggleChat,
  onStartRecording,
  onStopRecording,
  isGroupCall = false,
  maxParticipants = 50
}: CallControlsProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [volume, setVolume] = useState([75]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker' | 'focus'>('speaker');
  const [showStats, setShowStats] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [audioDevice, setAudioDevice] = useState('default');
  const [videoDevice, setVideoDevice] = useState('default');
  const [callStats, setCallStats] = useState<CallStats>({
    bitrate: 0,
    latency: 0,
    packetLoss: 0,
    resolution: 'HD'
  });

  const callStartTimeRef = useRef<Date>();
  const connectionTestInterval = useRef<NodeJS.Timeout>();

  // Enhanced call duration timer with better precision
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && !isConnecting && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current!.getTime()) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isConnecting]);

  // Simulate connection quality monitoring
  useEffect(() => {
    if (isCallActive) {
      connectionTestInterval.current = setInterval(() => {
        // Simulate connection quality changes
        const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good', 'poor'];
        const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
        setConnectionQuality(randomQuality);
        
        // Update stats
        setCallStats(prev => ({
          ...prev,
          bitrate: Math.floor(Math.random() * 1000) + 500,
          latency: Math.floor(Math.random() * 100) + 20,
          packetLoss: Math.random() * 2,
        }));
      }, 5000);
    }

    return () => {
      if (connectionTestInterval.current) {
        clearInterval(connectionTestInterval.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startCall = async (type: 'audio' | 'video') => {
    setIsConnecting(true);
    setIsCallActive(true);
    setCallType(type);
    setIsVideoOn(type === 'video');
    setCallDuration(0);
    callStartTimeRef.current = new Date();
    
    try {
      if (type === 'video') {
        await onStartVideoCall?.();
        toast({
          title: "Video Call Started",
          description: `Video connected to ${recipientName || 'participants'}`,
        });
      } else {
        await onStartCall?.();
        toast({
          title: "Audio Call Started",
          description: `Connected to ${recipientName || 'participants'}`,
        });
      }
    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Unable to start the call. Please check your connection and try again.",
        variant: "destructive"
      });
      setIsCallActive(false);
      setIsVideoOn(false);
      return;
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    setIsVideoOn(false);
    setIsScreenSharing(false);
    setIsRecording(false);
    setCallDuration(0);
    setIsConnecting(false);
    setShowStats(false);
    setShowParticipants(false);
    callStartTimeRef.current = undefined;
    
    if (connectionTestInterval.current) {
      clearInterval(connectionTestInterval.current);
    }
    
    onEndCall?.();
    toast({
      title: "Call Ended",
      description: `Call with ${recipientName || 'participants'} has ended.`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone On" : "Microphone Off",
      description: `You are now ${isMuted ? 'unmuted' : 'muted'}.`,
      duration: 2000,
    });
  };

  const toggleVideo = () => {
    if (isCallActive) {
      setIsVideoOn(!isVideoOn);
      toast({
        title: isVideoOn ? "Camera Off" : "Camera On",
        description: `Your camera is now ${isVideoOn ? 'off' : 'on'}.`,
        duration: 2000,
      });
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        setIsScreenSharing(false);
        toast({
          title: "Screen Share Stopped",
          description: "You stopped sharing your screen.",
        });
      } else {
        // Simulate screen share start
        setIsScreenSharing(true);
        toast({
          title: "Screen Share Started",
          description: "You are now sharing your screen.",
        });
      }
    } catch (error) {
      toast({
        title: "Screen Share Failed",
        description: "Unable to share screen. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onStopRecording?.();
      toast({
        title: "Recording Stopped",
        description: "Call recording has been stopped and saved.",
      });
    } else {
      setIsRecording(true);
      onStartRecording?.();
      toast({
        title: "Recording Started",
        description: "This call is now being recorded.",
      });
    }
  };

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return <Signal className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Signal className="h-4 w-4 text-gray-500" />;
    }
  };

  // Call initiation buttons
  if (!isCallActive) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startCall('audio')}
                className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 rounded-full transition-all duration-200"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Start audio call</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startCall('video')}
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200"
              >
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Start video call</TooltipContent>
          </Tooltip>

          {isGroupCall && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onInviteParticipants}
                  className="h-9 w-9 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start group call</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Enhanced active call interface
  return (
    <Dialog open={isCallActive} onOpenChange={() => {}}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white border-gray-700 shadow-2xl",
          isFullscreen ? "max-w-full h-screen" : "sm:max-w-2xl max-w-[95vw]"
        )}
      >
        <DialogHeader className="p-4 pb-2 bg-gray-800/50 backdrop-blur-sm">
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getConnectionIcon(connectionQuality)}
                <div className="flex items-center gap-2">
                  {isConnecting ? (
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                  <span className="text-sm font-medium">
                    {isConnecting ? 'Connecting...' : 
                     isGroupCall ? `Group Call (${participants.length + 1})` : 
                     recipientName || 'Team Member'}
                  </span>
                </div>
              </div>
              {!isConnecting && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(callDuration)}
                  </Badge>
                  {isRecording && (
                    <Badge className="text-xs bg-red-600 text-white animate-pulse">
                      <Record className="h-3 w-3 mr-1" />
                      REC
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <Signal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Connection stats</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</TooltipContent>
              </Tooltip>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex">
          {/* Main Content Area */}
          <div className="flex-1 p-4">
            {/* Connection Stats Overlay */}
            {showStats && (
              <Card className="absolute top-16 left-4 right-4 bg-black/80 backdrop-blur-sm border-gray-600 z-10">
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Bitrate</div>
                      <div className="text-white font-mono">{callStats.bitrate} kbps</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Latency</div>
                      <div className="text-white font-mono">{callStats.latency}ms</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Packet Loss</div>
                      <div className="text-white font-mono">{callStats.packetLoss.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Resolution</div>
                      <div className="text-white font-mono">{callStats.resolution}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video/Avatar Display Area */}
            <div className="flex justify-center mb-6 relative">
              {isGroupCall && participants.length > 0 ? (
                // Group call grid view
                <div className={cn(
                  "grid gap-2",
                  participants.length <= 2 ? "grid-cols-2" :
                  participants.length <= 4 ? "grid-cols-2 grid-rows-2" :
                  "grid-cols-3 grid-rows-2"
                )}>
                  {participants.slice(0, 6).map((participant) => (
                    <div key={participant.id} className="relative">
                      <div className="h-24 w-32 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700 overflow-hidden">
                        {participant.isVideoOn ? (
                          <div className="text-center">
                            <Video className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                            <div className="text-xs text-gray-400">Video</div>
                          </div>
                        ) : (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {participant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs text-white bg-black/60 px-1 rounded truncate">
                          {participant.name}
                        </div>
                      </div>
                      {participant.isMuted && (
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-600 rounded-full flex items-center justify-center">
                          <MicOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {participants.length > 6 && (
                    <div className="h-24 w-32 bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Users className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">+{participants.length - 6} more</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Single participant view
                <div className="relative">
                  <div className="h-48 w-48 bg-gray-800 rounded-2xl flex items-center justify-center border-4 border-gray-700 overflow-hidden">
                    {isVideoOn ? (
                      <div className="text-center">
                        <Video className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-400">Video Active</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mb-2">
                          <AvatarImage src={recipientAvatar} />
                          <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                            {(recipientName || 'T').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-gray-400">Audio Only</div>
                      </div>
                    )}
                  </div>
                  {isMuted && (
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-red-600 rounded-full flex items-center justify-center">
                      <MicOff className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {isScreenSharing && (
                    <div className="absolute -top-2 -left-2 h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Call Status & Volume Control */}
            <div className="text-center mb-6 space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge 
                  variant={callType === 'video' ? "default" : "secondary"} 
                  className={`${callType === 'video' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
                >
                  {callType === 'video' ? "Video Call" : "Audio Call"}
                </Badge>
                {isScreenSharing && (
                  <Badge className="bg-green-600 text-white">
                    <Monitor className="h-3 w-3 mr-1" />
                    Sharing Screen
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-2",
                    connectionQuality === 'excellent' ? 'border-green-500 text-green-500' :
                    connectionQuality === 'good' ? 'border-yellow-500 text-yellow-500' :
                    'border-red-500 text-red-500'
                  )}
                >
                  {connectionQuality === 'excellent' ? 'Excellent' :
                   connectionQuality === 'good' ? 'Good' : 'Poor'} Connection
                </Badge>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center gap-3 max-w-48 mx-auto">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{volume[0]}%</span>
              </div>

              {isConnecting && (
                <div className="text-sm text-gray-400 animate-pulse">
                  Establishing secure connection...
                </div>
              )}
            </div>

            {/* Enhanced Call Controls */}
            <div className="flex justify-center items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isMuted ? "default" : "secondary"}
                      size="lg"
                      onClick={toggleMute}
                      className={cn(
                        "h-14 w-14 rounded-full p-0 transition-all duration-200",
                        isMuted 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      )}
                    >
                      {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={toggleVideo}
                      className={cn(
                        "h-14 w-14 rounded-full p-0 transition-all duration-200",
                        isVideoOn 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                      )}
                    >
                      {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isVideoOn ? 'Turn off camera' : 'Turn on camera'}</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={toggleScreenShare}
                      className={cn(
                        "h-14 w-14 rounded-full p-0 transition-all duration-200",
                        isScreenSharing 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      )}
                    >
                      {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={toggleRecording}
                      className={cn(
                        "h-14 w-14 rounded-full p-0 transition-all duration-200",
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      )}
                    >
                      {isRecording ? <Square className="h-6 w-6" /> : <Record className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isRecording ? 'Stop recording' : 'Start recording'}</TooltipContent>
                </Tooltip>

                {onToggleChat && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={onToggleChat}
                        className="h-14 w-14 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
                      >
                        <MessageSquare className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle chat</TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={endCall}
                      className="h-14 w-14 rounded-full p-0 bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-200"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>End call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Additional Actions */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <TooltipProvider>
                {isGroupCall && onInviteParticipants && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onInviteParticipants}
                        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Invite ({participants.length}/{maxParticipants})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Invite participants</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Call settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Participants Panel (for group calls) */}
          {isGroupCall && showParticipants && (
            <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-l border-gray-600 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Participants ({participants.length + 1})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowParticipants(false)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {/* Current user */}
                <div className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm text-white">You</div>
                    <div className="text-xs text-gray-400">Host</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                    {!isVideoOn && <VideoOff className="h-3 w-3 text-gray-500" />}
                  </div>
                </div>

                {/* Other participants */}
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm text-white">{participant.name}</div>
                      <div className="text-xs text-gray-400">
                        {participant.isPresenter ? 'Presenter' : 'Participant'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getConnectionIcon(participant.connectionQuality)}
                      {participant.isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                      {!participant.isVideoOn && <VideoOff className="h-3 w-3 text-gray-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
