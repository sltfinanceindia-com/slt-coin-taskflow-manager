import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  PhoneForwarded as HandOff,
  Clock,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  Filter,
  Search,
  Star,
  Headphones,
  Speaker,
  Smartphone,
  Laptop,
  Tablet,
  Paintbrush,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Image as ImageIcon,
  Folder,
  Link,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Signal,
  Gauge
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CallParticipant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: 'host' | 'co-host' | 'presenter' | 'participant';
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
  isRecording?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  joinedAt?: Date;
  location?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  networkInfo?: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
  };
  reactions?: {
    emoji: string;
    timestamp: Date;
  }[];
}

interface CallStats {
  duration: number;
  participants: number;
  maxParticipants: number;
  totalDataTransfer: number;
  averageQuality: number;
  recordingSize?: number;
}

interface CallSettings {
  videoQuality: 'auto' | 'low' | 'medium' | 'high' | 'ultra';
  audioQuality: 'auto' | 'low' | 'medium' | 'high';
  bandwidth: 'unlimited' | 'limited';
  recordingQuality: 'audio' | 'low' | 'medium' | 'high';
  backgroundBlur: boolean;
  noiseCancellation: boolean;
  autoGainControl: boolean;
  echoCancellation: boolean;
}

interface EnhancedCallControlsProps {
  recipientName?: string;
  participants?: CallParticipant[];
  maxParticipants?: number;
  isHost?: boolean;
  recordingEnabled?: boolean;
  breakoutRoomsEnabled?: boolean;
  whiteboardEnabled?: boolean;
  onStartCall?: () => Promise<void>;
  onStartVideoCall?: () => Promise<void>;
  onInviteParticipant?: (email: string) => Promise<void>;
  onEndCall?: () => void;
  onKickParticipant?: (participantId: string) => void;
  onMuteParticipant?: (participantId: string) => void;
  onPromoteToHost?: (participantId: string) => void;
  onCreateBreakoutRoom?: () => void;
  onStartWhiteboard?: () => void;
}

export function EnhancedCallControls({ 
  recipientName, 
  participants = [],
  maxParticipants = 100,
  isHost = false,
  recordingEnabled = true,
  breakoutRoomsEnabled = true,
  whiteboardEnabled = true,
  onStartCall, 
  onStartVideoCall,
  onInviteParticipant,
  onEndCall,
  onKickParticipant,
  onMuteParticipant,
  onPromoteToHost,
  onCreateBreakoutRoom,
  onStartWhiteboard
}: EnhancedCallControlsProps) {
  // Core call states
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed'>('connecting');
  
  // Media control states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [volume, setVolume] = useState([80]);
  
  // Advanced UI states
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'speaker' | 'focus' | 'presentation'>('speaker');
  const [spotlightParticipant, setSpotlightParticipant] = useState<string | null>(null);
  
  // Enhanced features
  const [virtualBackground, setVirtualBackground] = useState<'none' | 'blur' | 'image'>('none');
  const [reactions, setReactions] = useState<{ emoji: string; id: string; timestamp: Date }[]>([]);
  const [waitingRoom, setWaitingRoom] = useState<CallParticipant[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<{ id: string; name: string; participants: string[] }[]>([]);
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; message: string; timestamp: Date }[]>([]);
  const [polls, setPolls] = useState<{ id: string; question: string; options: string[]; votes: Record<string, string> }[]>([]);
  
  // Call settings and quality
  const [callSettings, setCallSettings] = useState<CallSettings>({
    videoQuality: 'auto',
    audioQuality: 'high',
    bandwidth: 'unlimited',
    recordingQuality: 'high',
    backgroundBlur: false,
    noiseCancellation: true,
    autoGainControl: true,
    echoCancellation: true
  });

  // Device and media refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingRef = useRef<MediaRecorder | null>(null);

  // Calculate call statistics
  const callStats = useMemo((): CallStats => {
    const totalParticipants = participants.length + 1;
    const avgQuality = participants.reduce((sum, p) => {
      const qualityScore = p.connectionQuality === 'excellent' ? 5 :
                          p.connectionQuality === 'good' ? 4 :
                          p.connectionQuality === 'fair' ? 3 :
                          p.connectionQuality === 'poor' ? 2 : 1;
      return sum + qualityScore;
    }, 5) / totalParticipants;

    return {
      duration: callDuration,
      participants: totalParticipants,
      maxParticipants,
      totalDataTransfer: Math.floor(callDuration * 2.5 * totalParticipants), // MB estimate
      averageQuality: avgQuality,
      recordingSize: isRecording ? Math.floor(callDuration * 5.2) : undefined // MB estimate
    };
  }, [participants, callDuration, maxParticipants, isRecording]);

  // Enhanced media initialization
  const initializeMedia = useCallback(async (video: boolean = false) => {
    try {
      setConnectionStatus('connecting');
      
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: callSettings.echoCancellation,
          noiseSuppression: callSettings.noiseCancellation,
          autoGainControl: callSettings.autoGainControl,
          sampleRate: callSettings.audioQuality === 'high' ? 48000 : 16000
        },
        video: video ? {
          width: { ideal: callSettings.videoQuality === 'ultra' ? 1920 : callSettings.videoQuality === 'high' ? 1280 : 640 },
          height: { ideal: callSettings.videoQuality === 'ultra' ? 1080 : callSettings.videoQuality === 'high' ? 720 : 360 },
          frameRate: { ideal: callSettings.videoQuality === 'ultra' ? 60 : 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection establishment with realistic timing
      setTimeout(() => {
        setConnectionStatus('connected');
        toast({
          title: 'Connected',
          description: 'Call connected successfully with high quality audio/video',
        });
      }, Math.random() * 2000 + 1000);
      
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
  }, [callSettings]);

  // Call duration timer with better precision
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && connectionStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, connectionStatus]);

  // Auto-clear reactions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setReactions(prev => prev.filter(r => Date.now() - r.timestamp.getTime() < 5000));
    }, 1000);
    return () => clearTimeout(timer);
  }, [reactions]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startCall = async (video: boolean) => {
    try {
      await initializeMedia(video);
      setIsCallActive(true);
      setIsVideoCall(video);
      setCallDuration(0);
      
      if (video) {
        await onStartVideoCall?.();
      } else {
        await onStartCall?.();
      }
      
      toast({
        title: video ? 'Video Call Started' : 'Audio Call Started',
        description: `${video ? 'Video' : 'Audio'} call with ${participants.length > 0 ? `${participants.length + 1} participants` : recipientName || 'participant'}`,
      });
    } catch (error) {
      setIsCallActive(false);
      setIsVideoCall(false);
    }
  };

  const endCall = useCallback(() => {
    // Stop all media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop recording if active
    if (recordingRef.current && isRecording) {
      recordingRef.current.stop();
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
    setShowWhiteboard(false);
    setShowSettings(false);
    setReactions([]);
    setSpotlightParticipant(null);
    
    onEndCall?.();
    
    toast({
      title: 'Call Ended',
      description: `Call duration: ${formatDuration(callDuration)} • ${participants.length + 1} participants`,
    });
  }, [callDuration, participants.length, isRecording, onEndCall, formatDuration]);

  const sendReaction = (emoji: string) => {
    const reaction = {
      emoji,
      id: Math.random().toString(36),
      timestamp: new Date()
    };
    setReactions(prev => [...prev, reaction]);
    
    toast({
      title: 'Reaction Sent',
      description: `You reacted with ${emoji}`,
      duration: 2000,
    });
  };

  const admitFromWaitingRoom = (participantId: string) => {
    const participant = waitingRoom.find(p => p.id === participantId);
    if (participant) {
      setWaitingRoom(prev => prev.filter(p => p.id !== participantId));
      toast({
        title: 'Participant Admitted',
        description: `${participant.name} has joined the call`,
      });
    }
  };

  const getConnectionIcon = (quality?: string) => {
    switch (quality) {
      case 'excellent': return <Signal className="h-3 w-3 text-green-500" />;
      case 'good': return <Wifi className="h-3 w-3 text-green-400" />;
      case 'fair': return <Wifi className="h-3 w-3 text-yellow-500" />;
      case 'poor': return <WifiOff className="h-3 w-3 text-red-500" />;
      default: return <AlertCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'desktop': return <Laptop className="h-3 w-3" />;
      case 'mobile': return <Smartphone className="h-3 w-3" />;
      case 'tablet': return <Tablet className="h-3 w-3" />;
      default: return <Laptop className="h-3 w-3" />;
    }
  };

  // Call initiation interface
  if (!isCallActive) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startCall(false)}
                className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 rounded-full transition-all duration-200 hover:scale-105"
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
                onClick={() => startCall(true)}
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200 hover:scale-105"
              >
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Start video call</TooltipContent>
          </Tooltip>

          {participants.length > 2 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startCall(true)}
                  className="h-9 w-9 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-all duration-200 hover:scale-105"
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
          "max-w-7xl max-h-[95vh] p-0 gap-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white border-gray-700 shadow-2xl",
          isFullscreen && "max-w-[100vw] max-h-[100vh] w-full h-full rounded-none"
        )}
      >
        {/* Enhanced Header Bar */}
        <DialogHeader className="px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border-b border-gray-600 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="flex items-center gap-3 text-white">
                <div className="relative">
                  {isVideoCall ? <Video className="h-5 w-5 text-blue-400" /> : <Phone className="h-5 w-5 text-green-400" />}
                  {connectionStatus === 'connected' && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <span className="font-semibold">
                    {participants.length > 0 ? 
                      `${isVideoCall ? 'Video' : 'Audio'} Meeting (${participants.length + 1})` : 
                      `Call with ${recipientName || 'Participant'}`
                    }
                  </span>
                  {isHost && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-yellow-600 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Host
                    </Badge>
                  )}
                </div>
              </DialogTitle>
              
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && (
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-green-400 border-green-400/20">
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

                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse bg-red-600 text-white">
                    <Circle className="h-2 w-2 mr-1 fill-current animate-pulse" />
                    REC {formatDuration(callDuration)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                {showStats && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStats(!showStats)}
                        className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View call statistics</TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Video/Content Area */}
          <div className="flex-1 flex flex-col bg-black relative">
            {/* Floating Reactions */}
            {reactions.map((reaction) => (
              <div
                key={reaction.id}
                className="absolute top-20 right-4 text-4xl animate-bounce z-20 pointer-events-none"
                style={{
                  animationDuration: '3s',
                  animationDelay: `${Math.random() * 1000}ms`
                }}
              >
                {reaction.emoji}
              </div>
            ))}

            {/* Call Stats Overlay */}
            {showStats && (
              <Card className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm border-gray-600 z-10 min-w-64">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400">Duration</div>
                      <div className="text-white font-mono">{formatDuration(callStats.duration)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Participants</div>
                      <div className="text-white font-mono">{callStats.participants}/{maxParticipants}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Data Transfer</div>
                      <div className="text-white font-mono">{callStats.totalDataTransfer} MB</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg Quality</div>
                      <div className="text-white font-mono flex items-center">
                        <Progress value={callStats.averageQuality * 20} className="w-12 h-2 mr-2" />
                        {Math.round(callStats.averageQuality * 20)}%
                      </div>
                    </div>
                    {callStats.recordingSize && (
                      <>
                        <div>
                          <div className="text-gray-400">Recording Size</div>
                          <div className="text-white font-mono">{callStats.recordingSize} MB</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Video Display */}
            <div className="flex-1 p-4">
              {isVideoCall || isScreenSharing ? (
                <div className={cn(
                  "grid gap-3 h-full",
                  layoutMode === 'grid' && participants.length === 0 ? "grid-cols-1" :
                  layoutMode === 'grid' && participants.length <= 1 ? "grid-cols-2" :
                  layoutMode === 'grid' && participants.length <= 3 ? "grid-cols-2 grid-rows-2" :
                  layoutMode === 'grid' ? "grid-cols-3 grid-rows-2" :
                  layoutMode === 'speaker' ? "grid-cols-1" :
                  "grid-cols-1"
                )}>
                  
                  {/* Main video (speaker or screen share) */}
                  <div className={cn(
                    "relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-600",
                    layoutMode === 'speaker' && participants.length > 0 && "col-span-full row-span-2"
                  )}>
                    {isScreenSharing ? (
                      <video
                        ref={screenShareRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted={!isVideoEnabled}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Video overlay controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                        <span className="font-medium">
                          {isScreenSharing ? 'Screen Share' : spotlightParticipant ? participants.find(p => p.id === spotlightParticipant)?.name : 'You'}
                        </span>
                        {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                        {isHandRaised && <Hand className="h-3 w-3 text-yellow-400 animate-bounce" />}
                        {getConnectionIcon('excellent')}
                      </div>
                      
                      {isScreenSharing && (
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                          <Monitor className="h-3 w-3" />
                          Presenting
                        </div>
                      )}
                    </div>

                    {!isVideoEnabled && !isScreenSharing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                            {recipientName?.charAt(0) || 'Y'}
                          </div>
                          <div className="text-gray-300">Camera is off</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Participant videos */}
                  {layoutMode !== 'focus' && participants.slice(0, layoutMode === 'speaker' ? 4 : 8).map((participant, index) => (
                    <div key={participant.id} className={cn(
                      "relative bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-600",
                      layoutMode === 'speaker' && index === 0 && "col-span-full row-span-2",
                      layoutMode === 'speaker' && index > 0 && "aspect-video"
                    )}>
                      {!participant.isVideoOff ? (
                        <video
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                          <div className="text-center">
                            <Avatar className="h-12 w-12 mx-auto mb-2">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs text-gray-400">Camera is off</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Participant info overlay */}
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <span className="font-medium truncate max-w-20">{participant.name}</span>
                        {participant.isMuted && <MicOff className="h-2 w-2 text-red-400" />}
                        {participant.isHandRaised && <Hand className="h-2 w-2 text-yellow-400" />}
                        {getConnectionIcon(participant.connectionQuality)}
                        {getDeviceIcon(participant.device)}
                      </div>

                      {/* Host/Co-host indicators */}
                      {participant.role !== 'participant' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs bg-yellow-600/80 text-white">
                            {participant.role === 'host' ? <Shield className="h-2 w-2" /> : 
                             participant.role === 'co-host' ? <Star className="h-2 w-2" /> :
                             <Users className="h-2 w-2" />}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Overflow indicator for too many participants */}
                  {participants.length > 8 && layoutMode === 'grid' && (
                    <div className="relative bg-gray-700 rounded-xl overflow-hidden shadow-lg border border-gray-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-70" />
                        <div className="text-sm font-medium">+{participants.length - 8}</div>
                        <div className="text-xs text-gray-400">more participants</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Enhanced Audio Call Display */
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="w-40 h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto shadow-2xl">
                        {recipientName?.charAt(0) || participants[0]?.name?.charAt(0) || 'A'}
                      </div>
                      <div className="absolute -bottom-2 -right-2">
                        {getConnectionIcon('excellent')}
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-white mb-2">
                      {participants.length > 0 ? 'Audio Conference' : recipientName || 'Audio Call'}
                    </div>
                    <div className="text-gray-400 mb-4">
                      {participants.length > 0 ? `${participants.length + 1} participants` : 'High quality audio'}
                    </div>
                    <div className="flex justify-center space-x-4">
                      {participants.slice(0, 5).map((participant) => (
                        <div key={participant.id} className="text-center">
                          <Avatar className="h-12 w-12 mx-auto mb-1 ring-2 ring-white/20">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm">
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs text-gray-400 truncate max-w-12">{participant.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Call Controls Bar */}
            <div className="bg-gradient-to-t from-gray-900 via-gray-800/95 to-transparent backdrop-blur-xl border-t border-gray-700/50 p-6 shrink-0">
              {/* Reaction Bar */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                  {['👍', '👏', '❤️', '😂', '😮', '👋'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => sendReaction(emoji)}
                      className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform duration-200 hover:bg-white/10"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-3">
                <TooltipProvider>
                  {/* Audio Control */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isMuted ? "default" : "secondary"}
                        size="lg"
                        onClick={() => {
                          setIsMuted(!isMuted);
                          toast({
                            title: isMuted ? 'Microphone On' : 'Microphone Off',
                            description: `You are now ${isMuted ? 'unmuted' : 'muted'}`,
                            duration: 2000,
                          });
                        }}
                        className={cn(
                          "h-14 w-14 rounded-full p-0 transition-all duration-200 hover:scale-105 shadow-lg",
                          isMuted 
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25' 
                            : 'bg-gray-600/80 hover:bg-gray-500 text-white backdrop-blur-sm'
                        )}
                      >
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? 'Unmute (Space)' : 'Mute (Space)'}</TooltipContent>
                  </Tooltip>

                  {/* Video Control */}
                  {isVideoCall && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={() => {
                            setIsVideoEnabled(!isVideoEnabled);
                            toast({
                              title: isVideoEnabled ? 'Camera Off' : 'Camera On',
                              description: `Your camera is now ${isVideoEnabled ? 'off' : 'on'}`,
                              duration: 2000,
                            });
                          }}
                          className={cn(
                            "h-14 w-14 rounded-full p-0 transition-all duration-200 hover:scale-105 shadow-lg",
                            !isVideoEnabled 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25' 
                              : 'bg-gray-600/80 hover:bg-gray-500 text-white backdrop-blur-sm'
                          )}
                        >
                          {isVideoEnabled ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isVideoEnabled ? 'Turn off camera (Ctrl+E)' : 'Turn on camera (Ctrl+E)'}</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Screen Share */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={async () => {
                          try {
                            if (!isScreenSharing) {
                              const screenStream = await navigator.mediaDevices.getDisplayMedia({
                                video: { mediaSource: 'screen' },
                                audio: true
                              });
                              
                              if (screenShareRef.current) {
                                screenShareRef.current.srcObject = screenStream;
                              }
                              
                              setIsScreenSharing(true);
                              toast({
                                title: 'Screen Sharing Started',
                                description: 'Your screen is now being shared with participants',
                              });
                              
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
                              description: 'Could not start screen sharing. Please try again.',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className={cn(
                          "h-14 w-14 rounded-full p-0 transition-all duration-200 hover:scale-105 shadow-lg",
                          isScreenSharing 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/25' 
                            : 'bg-gray-600/80 hover:bg-gray-500 text-white backdrop-blur-sm'
                        )}
                      >
                        {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isScreenSharing ? 'Stop sharing (Ctrl+Shift+E)' : 'Share screen (Ctrl+Shift+E)'}</TooltipContent>
                  </Tooltip>

                  {/* Raise Hand */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => {
                          setIsHandRaised(!isHandRaised);
                          toast({
                            title: isHandRaised ? 'Hand Lowered' : 'Hand Raised',
                            description: isHandRaised ? 'Your hand has been lowered' : 'Your hand is raised',
                            duration: 2000,
                          });
                        }}
                        className={cn(
                          "h-14 w-14 rounded-full p-0 transition-all duration-200 hover:scale-105 shadow-lg",
                          isHandRaised 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-500/25 animate-pulse' 
                            : 'bg-gray-600/80 hover:bg-gray-500 text-white backdrop-blur-sm'
                        )}
                      >
                        {isHandRaised ? <Hand className="h-6 w-6" /> : <HandOff className="h-6 w-6" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isHandRaised ? 'Lower hand (Ctrl+K)' : 'Raise hand (Ctrl+K)'}</TooltipContent>
                  </Tooltip>

                  {/* Recording */}
                  {recordingEnabled && isHost && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={() => {
                            setIsRecording(!isRecording);
                            toast({
                              title: isRecording ? 'Recording Stopped' : 'Recording Started',
                              description: isRecording ? 
                                'Recording saved. Participants will be notified.' : 
                                'This meeting is now being recorded.',
                              duration: 3000,
                            });
                          }}
                          className={cn(
                            "h-14 w-14 rounded-full p-0 transition-all duration-200 hover:scale-105 shadow-lg",
                            isRecording 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25 animate-pulse' 
                              : 'bg-gray-600/80 hover:bg-gray-500 text-white backdrop-blur-sm'
                          )}
                        >
                          <Circle className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isRecording ? 'Stop recording (Ctrl+Shift+R)' : 'Start recording (Ctrl+Shift+R)'}</TooltipContent>
                    </Tooltip>
                  )}

                  {/* More Actions Dropdown */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => setShowSettings(!showSettings)}
                        className="h-14 w-14 rounded-full p-0 bg-gray-600/80 hover:bg-gray-500 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        <MoreVertical className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>More options</TooltipContent>
                  </Tooltip>

                  {/* End Call */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="lg" 
                        onClick={endCall}
                        className="h-14 w-14 rounded-full p-0 bg-red-600 hover:bg-red-700 ml-6 transition-all duration-200 hover:scale-105 shadow-lg shadow-red-500/25"
                      >
                        <PhoneOff className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>End call (Ctrl+D)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Secondary Controls */}
              <div className="flex justify-center items-center gap-2 mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                        className={cn(
                          "h-10 px-4 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/10",
                          showChat && "bg-white/20"
                        )}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                        {chatMessages.length > 0 && (
                          <Badge className="ml-2 h-4 min-w-4 text-xs bg-blue-600">
                            {chatMessages.length}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle chat (Ctrl+Shift+H)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowParticipants(!showParticipants)}
                        className={cn(
                          "h-10 px-4 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/10",
                          showParticipants && "bg-white/20"
                        )}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Participants ({participants.length + 1})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show participants (Ctrl+Shift+P)</TooltipContent>
                  </Tooltip>

                  {whiteboardEnabled && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowWhiteboard(!showWhiteboard);
                            onStartWhiteboard?.();
                          }}
                          className={cn(
                            "h-10 px-4 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/10",
                            showWhiteboard && "bg-white/20"
                          )}
                        >
                          <Paintbrush className="h-4 w-4 mr-2" />
                          Whiteboard
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open whiteboard (Ctrl+Shift+W)</TooltipContent>
                    </Tooltip>
                  )}

                  {breakoutRoomsEnabled && isHost && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCreateBreakoutRoom?.()}
                          className="h-10 px-4 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/10"
                        >
                          <Grid3X3 className="h-4 w-4 mr-2" />
                          Breakout Rooms
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Manage breakout rooms</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStats(!showStats)}
                        className="h-10 px-4 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/10"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Stats
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View call statistics</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          {(showParticipants || showChat || showWhiteboard || waitingRoom.length > 0) && (
            <div className="w-80 xl:w-96 bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-600 flex flex-col">
              <Tabs defaultValue={showParticipants ? 'participants' : showChat ? 'chat' : 'whiteboard'} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 m-4 mb-0 bg-gray-700">
                  {showParticipants && (
                    <TabsTrigger value="participants" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Participants
                    </TabsTrigger>
                  )}
                  {showChat && (
                    <TabsTrigger value="chat" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </TabsTrigger>
                  )}
                  {showWhiteboard && (
                    <TabsTrigger value="whiteboard" className="text-xs">
                      <Paintbrush className="h-3 w-3 mr-1" />
                      Board
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Waiting Room Section */}
                {waitingRoom.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-b border-yellow-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-yellow-200 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Waiting Room ({waitingRoom.length})
                      </h3>
                    </div>
                    <ScrollArea className="max-h-32">
                      <div className="space-y-2">
                        {waitingRoom.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg backdrop-blur-sm border border-gray-600/50">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={participant.avatar} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                                  {participant.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium text-white">{participant.name}</div>
                                <div className="text-xs text-gray-400">{participant.email}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => admitFromWaitingRoom(participant.id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2"
                              >
                                Admit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-white border-gray-500 hover:bg-gray-700 text-xs h-7 px-2"
                              >
                                Deny
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <TabsContent value="participants" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    {/* Host Controls */}
                    {isHost && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onInviteParticipant?.('')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <UserPlus className="h-3 w-3 mr-2" />
                          Invite
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-white border-gray-500 hover:bg-gray-700"
                        >
                          <Settings className="h-3 w-3 mr-2" />
                          Settings
                        </Button>
                      </div>
                    )}

                    {/* Participants List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white text-sm">
                          In this meeting ({participants.length + 1})
                        </h4>
                        <Select value={layoutMode} onValueChange={(value: any) => setLayoutMode(value)}>
                          <SelectTrigger className="w-24 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="speaker">Speaker</SelectItem>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="focus">Focus</SelectItem>
                            <SelectItem value="presentation">Present</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <ScrollArea className="max-h-96">
                        <div className="space-y-2">
                          {/* Current user */}
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
                            <Avatar className="h-10 w-10 ring-2 ring-blue-400">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                You
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">You</span>
                                {isHost && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-600 text-white">
                                    <Shield className="h-2 w-2 mr-1" />
                                    Host
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-300">
                                {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                                {!isVideoEnabled && <CameraOff className="h-3 w-3 text-gray-400" />}
                                {isHandRaised && <Hand className="h-3 w-3 text-yellow-400" />}
                                {isScreenSharing && <Monitor className="h-3 w-3 text-green-400" />}
                                <span>Excellent connection</span>
                              </div>
                            </div>
                          </div>

                          {/* Other participants */}
                          {participants.map((participant) => (
                            <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group border border-transparent hover:border-gray-600/50">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={participant.avatar} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                                    {participant.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1">
                                  {getConnectionIcon(participant.connectionQuality)}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white truncate">{participant.name}</span>
                                  {participant.role !== 'participant' && (
                                    <Badge variant="secondary" className={cn(
                                      "text-xs",
                                      participant.role === 'host' && "bg-yellow-600 text-white",
                                      participant.role === 'co-host' && "bg-purple-600 text-white",
                                      participant.role === 'presenter' && "bg-green-600 text-white"
                                    )}>
                                      {participant.role === 'host' && <Shield className="h-2 w-2 mr-1" />}
                                      {participant.role === 'co-host' && <Star className="h-2 w-2 mr-1" />}
                                      {participant.role === 'presenter' && <Monitor className="h-2 w-2 mr-1" />}
                                      {participant.role}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                                  {participant.isVideoOff && <CameraOff className="h-3 w-3" />}
                                  {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-400" />}
                                  {participant.isScreenSharing && <Monitor className="h-3 w-3 text-green-400" />}
                                  {getDeviceIcon(participant.device)}
                                  <span className="capitalize">{participant.connectionQuality} connection</span>
                                  {participant.location && (
                                    <>
                                      <span>•</span>
                                      <span>{participant.location}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Host actions */}
                              {isHost && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onMuteParticipant?.(participant.id)}
                                        className="h-6 w-6 p-0 hover:bg-red-500/20"
                                      >
                                        <MicOff className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mute participant</TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSpotlightParticipant(participant.id)}
                                        className="h-6 w-6 p-0 hover:bg-blue-500/20"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Spotlight participant</TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onPromoteToHost?.(participant.id)}
                                        className="h-6 w-6 p-0 hover:bg-yellow-500/20"
                                      >
                                        <Shield className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Make host</TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 m-0 flex flex-col">
                  <div className="flex-1 flex flex-col p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white text-sm">Meeting Chat</h4>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400 hover:text-white">
                        Clear
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 -mx-2 px-2">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs mt-1">Start a conversation with the team</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {chatMessages.map((message) => (
                            <div key={message.id} className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-blue-400">{message.sender}</span>
                                <span className="text-xs text-gray-500">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-white">{message.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Send
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="whiteboard" className="flex-1 m-0 p-4">
                  <div className="bg-gray-800/50 rounded-lg p-8 text-center text-gray-400">
                    <Paintbrush className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-medium mb-2">Interactive Whiteboard</p>
                    <p className="text-xs">Collaborative drawing and annotation tools would be available here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Connection Quality Indicator */}
        <div className="absolute top-20 right-6 z-10">
          <Card className="bg-black/80 backdrop-blur-sm border-gray-600 p-2">
            <div className="flex items-center gap-2 text-xs">
              {getConnectionIcon(connectionStatus === 'connected' ? 'excellent' : 'poor')}
              <span className="text-gray-300 capitalize">
                {connectionStatus === 'connected' ? 'Excellent' : connectionStatus}
              </span>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
