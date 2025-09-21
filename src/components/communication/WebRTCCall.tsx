import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  PhoneOff, 
  Mic,
  MicOff,
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
  MoreVertical,
  Volume2,
  VolumeX,
  Speaker,
  Headphones,
  MonitorSpeaker,
  Settings,
  Share,
  ShareOff,
  Users,
  MessageSquare,
  Pause,
  Play,
  Record,
  StopCircle,
  Camera,
  CameraOff,
  Grid3X3,
  Maximize,
  Hand,
  HandMetal,
  Sparkles,
  Zap,
  Activity,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Palette,
  Gamepad2,
  Coffee,
  Clock,
  Timer,
  Stopwatch,
  Calendar,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  Crown,
  Shield,
  Award,
  Star,
  Heart,
  ThumbsUp,
  Smile,
  Frown,
  Meh,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role?: 'host' | 'participant' | 'guest';
  isLocalUser?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isSpeaking?: boolean;
  isHandRaised?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  joinedAt?: Date;
  lastActivity?: Date;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  location?: string;
}

interface CallStats {
  bitrate: number;
  resolution: string;
  fps: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  audioCodec: string;
  videoCodec: string;
}

interface CallRecording {
  id: string;
  startTime: Date;
  duration: number;
  size: number;
  participants: number;
  quality: 'hd' | 'fhd' | '4k';
}

interface WebRTCCallProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'audio' | 'video' | 'screen';
  recipient?: Participant;
  participants?: Participant[];
  isIncoming?: boolean;
  isGroupCall?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onInviteParticipants?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onShareScreen?: () => void;
  onToggleChat?: () => void;
  enableAI?: boolean;
  enableRecording?: boolean;
  enableScreenShare?: boolean;
  enableChat?: boolean;
  enableEffects?: boolean;
  maxParticipants?: number;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'grid' | 'speaker' | 'presentation' | 'focus';
  className?: string;
}

const connectionQualityColors = {
  excellent: 'text-green-500',
  good: 'text-blue-500', 
  fair: 'text-yellow-500',
  poor: 'text-red-500'
};

const connectionQualityIcons = {
  excellent: SignalHigh,
  good: SignalMedium,
  fair: SignalLow,
  poor: Signal
};

const callLayouts = [
  { id: 'grid', label: 'Grid View', icon: Grid3X3 },
  { id: 'speaker', label: 'Speaker View', icon: User },
  { id: 'presentation', label: 'Presentation', icon: Share },
  { id: 'focus', label: 'Focus Mode', icon: Maximize }
];

const videoEffects = [
  { id: 'blur', label: 'Background Blur', icon: Eye },
  { id: 'replace', label: 'Background Replace', icon: Palette },
  { id: 'beauty', label: 'Beauty Filter', icon: Sparkles },
  { id: 'lighting', label: 'Auto Lighting', icon: Sun }
];

export function WebRTCCall({ 
  isOpen, 
  onClose, 
  callType, 
  recipient,
  participants = [],
  isIncoming = false,
  isGroupCall = false,
  onMinimize,
  onMaximize,
  onInviteParticipants,
  onStartRecording,
  onStopRecording,
  onShareScreen,
  onToggleChat,
  enableAI = true,
  enableRecording = true,
  enableScreenShare = true,
  enableChat = true,
  enableEffects = true,
  maxParticipants = 50,
  theme = 'auto',
  layout = 'grid',
  className
}: WebRTCCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeLayout, setActiveLayout] = useState(layout);
  const [volume, setVolume] = useState(80);
  const [micVolume, setMicVolume] = useState(80);
  const [videoQuality, setVideoQuality] = useState<'auto' | 'low' | 'medium' | 'high' | 'ultra'>('auto');
  const [audioDevice, setAudioDevice] = useState('default');
  const [videoDevice, setVideoDevice] = useState('default');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [callStats, setCallStats] = useState<CallStats>({
    bitrate: 0,
    resolution: '0x0',
    fps: 0,
    latency: 0,
    packetLoss: 0,
    jitter: 0,
    audioCodec: '',
    videoCodec: ''
  });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const statsIntervalRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();

  // Enhanced participants list including local user
  const allParticipants = useMemo(() => {
    const localParticipant: Participant = {
      id: 'local',
      name: 'You',
      role: isGroupCall ? 'host' : 'participant',
      isLocalUser: true,
      isMuted,
      isVideoEnabled,
      connectionQuality: 'excellent',
      joinedAt: new Date(),
      deviceType: 'desktop'
    };
    
    if (isGroupCall) {
      return [localParticipant, ...participants];
    } else if (recipient) {
      return [localParticipant, recipient];
    }
    
    return [localParticipant];
  }, [participants, recipient, isGroupCall, isMuted, isVideoEnabled]);

  // Call duration timer
  useEffect(() => {
    if (isConnected && connectionStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected, connectionStatus]);

  // Call statistics monitoring
  useEffect(() => {
    if (isConnected && peerConnectionRef.current) {
      statsIntervalRef.current = setInterval(async () => {
        try {
          const stats = await peerConnectionRef.current!.getStats();
          updateCallStats(stats);
        } catch (error) {
          console.error('Error getting call stats:', error);
        }
      }, 1000);
    } else {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    }
    
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [isConnected]);

  const updateCallStats = useCallback((stats: RTCStatsReport) => {
    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        setCallStats(prev => ({
          ...prev,
          bitrate: report.bytesReceived * 8 / 1000, // Convert to kbps
          fps: report.framesPerSecond || 0,
          resolution: `${report.frameWidth}x${report.frameHeight}`
        }));
      }
      
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        setCallStats(prev => ({
          ...prev,
          latency: report.currentRoundTripTime * 1000 || 0 // Convert to ms
        }));
      }
    });
  }, []);

  const initializeCall = async () => {
    try {
      setConnectionStatus('connecting');
      
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callType === 'video' ? {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }
      
      // Enhanced peer connection with advanced configuration
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });
      
      peerConnectionRef.current = peerConnection;
      
      // Add tracks with enhanced configuration
      stream.getTracks().forEach(track => {
        const sender = peerConnection.addTrack(track, stream);
        
        // Configure encoding parameters for better quality
        if (track.kind === 'video') {
          const params = sender.getParameters();
          if (params.encodings?.length > 0) {
            params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
            sender.setParameters(params);
          }
        }
      });
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Enhanced connection state handling
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        
        switch (state) {
          case 'connected':
            setIsConnected(true);
            setConnectionStatus('connected');
            toast({
              title: "Call Connected",
              description: `Successfully connected to ${recipient?.name || 'participants'}`,
            });
            break;
          case 'disconnected':
          case 'failed':
            setConnectionStatus(state === 'failed' ? 'failed' : 'disconnected');
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
      
      // Simulate connection for demo
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
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    
    setIsConnected(false);
    setCallDuration(0);
    setConnectionStatus('disconnected');
    setIsRecording(false);
    setIsScreenSharing(false);
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

  const toggleMute = useCallback(() => {
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
  }, [toast]);

  const toggleVideo = useCallback(() => {
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
  }, [callType, toast]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }
        
        setIsScreenSharing(true);
        onShareScreen?.();
        
        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared",
        });
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        
      } else {
        // Resume camera
        if (localStreamRef.current && peerConnectionRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(false);
        
        toast({
          title: "Screen Sharing Stopped",
          description: "Screen sharing has ended",
        });
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast({
        title: "Screen Share Failed",
        description: "Could not start screen sharing",
        variant: "destructive"
      });
    }
  }, [isScreenSharing, onShareScreen, toast]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      onStopRecording?.();
      toast({
        title: "Recording Stopped",
        description: "Call recording has been saved",
      });
    } else {
      setIsRecording(true);
      onStartRecording?.();
      toast({
        title: "Recording Started",
        description: "This call is now being recorded",
      });
    }
  }, [isRecording, onStartRecording, onStopRecording, toast]);

  const toggleHandRaise = useCallback(() => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "Hand Lowered" : "Hand Raised",
      description: isHandRaised ? "Your hand has been lowered" : "Your hand is raised",
    });
  }, [isHandRaised, toast]);

  const sendReaction = useCallback((emoji: string) => {
    toast({
      title: "Reaction Sent",
      description: `You reacted with ${emoji}`,
    });
    setShowReactions(false);
  }, [toast]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const renderParticipantGrid = () => {
    const gridCols = Math.min(4, Math.ceil(Math.sqrt(allParticipants.length)));
    
    return (
      <div className={cn(
        "grid gap-2 h-full",
        gridCols === 1 && "grid-cols-1",
        gridCols === 2 && "grid-cols-2", 
        gridCols === 3 && "grid-cols-3",
        gridCols >= 4 && "grid-cols-4"
      )}>
        {allParticipants.map((participant) => (
          <div
            key={participant.id}
            className={cn(
              "relative bg-gray-900 rounded-xl overflow-hidden border-2 transition-all duration-200",
              participant.isSpeaking ? "border-green-500 shadow-lg shadow-green-500/25" : "border-gray-700",
              activeLayout === 'focus' && !participant.isLocalUser && "opacity-50"
            )}
          >
            {/* Video/Avatar */}
            <div className="aspect-video relative">
              {participant.isVideoEnabled ? (
                <video
                  ref={participant.isLocalUser ? localVideoRef : undefined}
                  autoPlay
                  playsInline
                  muted={participant.isLocalUser}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-2xl">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {/* Overlay Information */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              
              {/* Connection Quality */}
              <div className="absolute top-2 right-2">
                {participant.connectionQuality && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={cn(
                        "p-1 rounded-full bg-black/50 backdrop-blur-sm",
                        connectionQualityColors[participant.connectionQuality]
                      )}>
                        {React.createElement(connectionQualityIcons[participant.connectionQuality], {
                          className: "h-3 w-3"
                        })}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Connection: {participant.connectionQuality}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {/* Hand Raised */}
              {participant.isHandRaised && (
                <div className="absolute top-2 left-2">
                  <div className="p-1 rounded-full bg-yellow-500 animate-bounce">
                    <Hand className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
              
              {/* Speaking Indicator */}
              {participant.isSpeaking && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-xl animate-pulse" />
              )}
              
              {/* Role Badge */}
              {participant.role === 'host' && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Host
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Participant Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">
                    {participant.name}
                  </span>
                  {participant.isMuted && (
                    <div className="p-1 rounded bg-red-500">
                      <MicOff className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {!participant.isVideoEnabled && (
                    <div className="p-1 rounded bg-gray-600">
                      <VideoOff className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {participant.deviceType === 'mobile' && (
                    <div className="text-white/70">
                      📱
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCallControls = () => (
    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-t from-black/80 to-transparent">
      {/* Primary Controls */}
      <div className="flex items-center gap-3">
        {/* Mute/Unmute */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-12 h-12 p-0 transition-all hover:scale-105"
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isMuted ? 'Unmute microphone' : 'Mute microphone'} (M)
          </TooltipContent>
        </Tooltip>

        {/* Video Toggle */}
        {callType === 'video' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12 p-0 transition-all hover:scale-105"
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isVideoEnabled ? 'Turn off camera' : 'Turn on camera'} (V)
            </TooltipContent>
          </Tooltip>
        )}

        {/* Screen Share */}
        {enableScreenShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="lg"
                onClick={toggleScreenShare}
                className="rounded-full w-12 h-12 p-0 transition-all hover:scale-105"
              >
                {isScreenSharing ? <ShareOff className="h-5 w-5" /> : <Share className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isScreenSharing ? 'Stop sharing' : 'Share screen'} (S)
            </TooltipContent>
          </Tooltip>
        )}

        {/* End Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-12 h-12 p-0 transition-all hover:scale-105 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>End call (E)</TooltipContent>
        </Tooltip>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center gap-2 ml-4">
        {/* Hand Raise */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isHandRaised ? "default" : "outline"}
              size="sm"
              onClick={toggleHandRaise}
              className="h-10 w-10 p-0 rounded-full"
            >
              <Hand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Raise hand (H)</TooltipContent>
        </Tooltip>

        {/* Reactions */}
        <Popover open={showReactions} onOpenChange={setShowReactions}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-full"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-2">
              {['👍', '👏', '❤️', '😂', '😮', '👋'].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => sendReaction(emoji)}
                  className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Recording */}
        {enableRecording && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecording}
                className="h-10 w-10 p-0 rounded-full"
              >
                {isRecording ? <StopCircle className="h-4 w-4" /> : <Record className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRecording ? 'Stop recording' : 'Start recording'} (R)
            </TooltipContent>
          </Tooltip>
        )}

        {/* Chat */}
        {enableChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showChat ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowChat(!showChat);
                  onToggleChat?.();
                }}
                className="h-10 w-10 p-0 rounded-full"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle chat (C)</TooltipContent>
          </Tooltip>
        )}

        {/* Participants */}
        {isGroupCall && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showParticipants ? "default" : "outline"}
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className="h-10 w-10 p-0 rounded-full relative"
              >
                <Users className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {allParticipants.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show participants (P)</TooltipContent>
          </Tooltip>
        )}

        {/* More Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" side="top">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9"
                onClick={() => setShowStats(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Call Statistics
              </Button>
              
              {enableEffects && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-9"
                  onClick={() => setShowEffects(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Video Effects
                </Button>
              )}
              
              {isGroupCall && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-9"
                  onClick={onInviteParticipants}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite People
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const renderCallStats = () => (
    <Dialog open={showStats} onOpenChange={setShowStats}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Call Statistics</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{callStats.latency.toFixed(0)}ms</div>
                  <Progress value={Math.max(0, 100 - callStats.latency / 5)} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Packet Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{callStats.packetLoss.toFixed(1)}%</div>
                  <Progress value={Math.max(0, 100 - callStats.packetLoss * 10)} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Bitrate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(callStats.bitrate / 1000).toFixed(0)} kbps</div>
                  <p className="text-xs text-muted-foreground mt-1">Video quality: {videoQuality}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{callStats.resolution}</div>
                  <p className="text-xs text-muted-foreground mt-1">{callStats.fps} fps</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="quality" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Video Quality</label>
                <Select value={videoQuality} onValueChange={(value: any) => setVideoQuality(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="low">Low (360p)</SelectItem>
                    <SelectItem value="medium">Medium (720p)</SelectItem>
                    <SelectItem value="high">High (1080p)</SelectItem>
                    <SelectItem value="ultra">Ultra (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Speaker Volume</label>
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Microphone Volume</label>
                <Slider
                  value={[micVolume]}
                  onValueChange={([value]) => setMicVolume(value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="participants" className="space-y-4">
            <div className="space-y-3">
              {allParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {participant.joinedAt && formatDistanceToNow(participant.joinedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.connectionQuality && (
                      <Badge variant="outline" className="text-xs">
                        {participant.connectionQuality}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {participant.isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                      {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  const renderIncomingCall = () => (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
      <div className="flex items-center justify-center h-full">
        <Card className="w-96 mx-4 bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-2xl">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-ping" />
                <Avatar className="h-24 w-24 mx-auto relative z-10 ring-4 ring-primary/20">
                  <AvatarImage src={recipient?.avatar} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {recipient?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Badge 
                  variant="secondary" 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary/10 text-primary"
                >
                  {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {recipient?.name || 'Unknown User'}
                </h3>
                <p className="text-muted-foreground mt-2 animate-pulse">
                  Incoming {callType} call...
                </p>
                {recipient?.location && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {recipient.location}
                  </p>
                )}
              </div>

              <div className="flex justify-center items-center gap-8 pt-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleEndCall}
                      className="rounded-full w-16 h-16 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-red-600 hover:bg-red-700"
                      disabled={isAnswering}
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Decline call</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleAnswerCall}
                      className="rounded-full w-16 h-16 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-green-600 hover:bg-green-700"
                      disabled={isAnswering}
                    >
                      {isAnswering ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      ) : (
                        <Phone className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Answer call</TooltipContent>
                </Tooltip>
              </div>
              
              {isAnswering && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  <p className="text-sm animate-pulse">Connecting...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMinimizedCall = () => (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="w-80 bg-gradient-to-r from-background/95 to-muted/95 backdrop-blur-lg border-primary/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={recipient?.avatar} />
                  <AvatarFallback className="text-sm font-semibold">
                    {recipient?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{recipient?.name || 'Unknown User'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                  )} />
                  <span>
                    {isConnected ? formatDuration(callDuration) : 'Connecting...'}
                  </span>
                  {isRecording && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-red-500">
                        <Record className="h-2 w-2 animate-pulse" />
                        <span>REC</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0"
                  >
                    {isMuted ? 
                      <MicOff className="h-3 w-3 text-red-500" /> : 
                      <Mic className="h-3 w-3" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMinimized(false);
                      onMaximize?.();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Maximize</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndCall}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <PhoneOff className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End call</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey) return;
      
      switch (event.key.toLowerCase()) {
        case 'm':
          toggleMute();
          break;
        case 'v':
          if (callType === 'video') toggleVideo();
          break;
        case 's':
          if (enableScreenShare) toggleScreenShare();
          break;
        case 'h':
          toggleHandRaise();
          break;
        case 'r':
          if (enableRecording) toggleRecording();
          break;
        case 'e':
          handleEndCall();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, callType, enableScreenShare, enableRecording, toggleMute, toggleVideo, toggleScreenShare, toggleHandRaise, toggleRecording, handleEndCall]);

  // Initialize call
  useEffect(() => {
    if (isOpen && !isIncoming) {
      initializeCall();
    }
    return cleanup;
  }, [isOpen, isIncoming]);

  if (!isOpen) return null;

  // Render different states
  if (isIncoming && !isConnected) {
    return (
      <TooltipProvider>
        {renderIncomingCall()}
      </TooltipProvider>
    );
  }

  if (isMinimized) {
    return (
      <TooltipProvider>
        {renderMinimizedCall()}
      </TooltipProvider>
    );
  }

  // Full call interface
  return (
    <TooltipProvider>
      <div className={cn(
        "fixed inset-0 z-50 bg-black/95 backdrop-blur-sm",
        className
      )}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/10 to-muted/10 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={recipient?.avatar} />
                  <AvatarFallback>{recipient?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-white">
                    {isGroupCall ? `Group Call (${allParticipants.length})` : recipient?.name || 'Unknown User'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'} className="text-xs">
                      {connectionStatus === 'connecting' && '🔄 Connecting...'}
                      {connectionStatus === 'connected' && '✅ Connected'}
                      {connectionStatus === 'failed' && '❌ Failed'}
                      {connectionStatus === 'disconnected' && '⭕ Disconnected'}
                    </Badge>
                    {isConnected && (
                      <span className="text-sm text-white/80">
                        {formatDuration(callDuration)}
                      </span>
                    )}
                    {isRecording && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        <Record className="h-2 w-2 mr-1" />
                        Recording
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Layout Selector */}
              <Select value={activeLayout} onValueChange={(value: any) => setActiveLayout(value)}>
                <SelectTrigger className="w-36 h-9 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {callLayouts.map((layout) => (
                    <SelectItem key={layout.id} value={layout.id}>
                      <div className="flex items-center gap-2">
                        <layout.icon className="h-4 w-4" />
                        {layout.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMinimized(true);
                  onMinimize?.();
                }}
                className="text-white hover:bg-white/10"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative overflow-hidden">
            {callType === 'video' || isScreenSharing ? (
              <div className="h-full p-4">
                {renderParticipantGrid()}
              </div>
            ) : (
              // Audio-only interface
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="relative inline-block mb-8">
                    <Avatar className="h-32 w-32 ring-4 ring-primary/20 shadow-2xl">
                      <AvatarImage src={recipient?.avatar} />
                      <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-secondary">
                        {recipient?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isConnected && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background animate-pulse flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{recipient?.name || 'Unknown User'}</h3>
                  <p className="text-white/80 text-lg mb-4">
                    {isConnected ? 'Call in progress' : 'Connecting...'}
                  </p>
                  {isConnected && (
                    <div className="text-white/60 text-sm">
                      Duration: {formatDuration(callDuration)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connection status overlay */}
            {!isConnected && connectionStatus === 'connecting' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
                  <p className="text-white/80">Setting up your call</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gradient-to-t from-black/90 to-black/50 backdrop-blur-sm">
            {renderCallControls()}
          </div>
        </div>

        {/* Modals */}
        {renderCallStats()}
      </div>
    </TooltipProvider>
  );
}

// Enhanced hook for call management
export function useWebRTCCall() {
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callHistory, setCallHistory] = useState<Array<{
    id: string;
    type: 'incoming' | 'outgoing' | 'missed';
    participant: Participant;
    duration: number;
    timestamp: Date;
  }>>([]);
  
  const startCall = useCallback((participant: Participant, type: 'audio' | 'video') => {
    const callId = Date.now().toString();
    setActiveCall(callId);
    return callId;
  }, []);
  
  const endCall = useCallback((callId: string, duration: number = 0) => {
    setActiveCall(null);
    // Add to call history
    const callRecord = {
      id: callId,
      type: 'outgoing' as const,
      participant: {} as Participant, // Would be filled with actual data
      duration,
      timestamp: new Date()
    };
    setCallHistory(prev => [callRecord, ...prev.slice(0, 99)]);
  }, []);
  
  return {
    activeCall,
    callHistory,
    startCall,
    endCall
  };
}
