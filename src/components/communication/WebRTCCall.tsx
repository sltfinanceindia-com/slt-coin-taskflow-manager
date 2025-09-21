import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2,
  Monitor,
  Users,
  Settings,
  Maximize,
  Minimize,
  RotateCcw,
  Wifi,
  WifiOff,
  Signal,
  Clock,
  Circle,
  Square,
  MessageSquare,
  Camera,
  CameraOff,
  MoreHorizontal,
  UserPlus,
  Grid3x3,
  SpeakerIcon as Speaker
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isLocal: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isSpeaking: boolean;
  audioLevel: number;
}

interface CallStats {
  duration: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  bandwidth: number;
  latency: number;
  packetsLost: number;
  resolution: string;
  frameRate: number;
  bitrate: number;
}

interface WebRTCCallProps {
  callId: string;
  isIncoming?: boolean;
  participants: CallParticipant[];
  callType: 'voice' | 'video' | 'screen';
  onEndCall?: () => void;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onAddParticipant?: () => void;
  onToggleChat?: () => void;
  onToggleRecording?: () => void;
  className?: string;
}

export default function WebRTCCall({
  callId,
  isIncoming = false,
  participants,
  callType,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onAddParticipant,
  onToggleChat,
  onToggleRecording,
  className
}: WebRTCCallProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'spotlight' | 'sidebar'>('grid');
  const [audioLevel, setAudioLevel] = useState(50);
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high' | 'auto'>('auto');
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    connectionQuality: 'excellent',
    bandwidth: 1.2,
    latency: 45,
    packetsLost: 0,
    resolution: '1920x1080',
    frameRate: 30,
    bitrate: 1200
  });

  useEffect(() => {
    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallStats(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Signal className="h-4 w-4 text-green-500" />;
      case 'good': return <Signal className="h-4 w-4 text-blue-500" />;
      case 'fair': return <Signal className="h-4 w-4 text-yellow-500" />;
      case 'poor': return <WifiOff className="h-4 w-4 text-red-500" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'border-green-500';
      case 'good': return 'border-blue-500';
      case 'fair': return 'border-yellow-500';
      case 'poor': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const localParticipant = participants.find(p => p.isLocal);
  const remoteParticipants = participants.filter(p => !p.isLocal);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    onToggleRecording?.();
    toast.success(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const ParticipantVideo = ({ participant }: { participant: CallParticipant }) => (
    <div className={cn(
      "relative bg-black rounded-lg overflow-hidden border-2",
      getQualityColor(participant.connectionQuality),
      participant.isSpeaking && "ring-2 ring-green-500"
    )}>
      {participant.isVideoEnabled ? (
        <video
          ref={el => {
            if (el) remoteVideoRefs.current[participant.id] = el;
          }}
          className="w-full h-full object-cover"
          autoPlay
          muted={participant.isLocal}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Avatar className="h-16 w-16">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback>
              {participant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {participant.name}
            {participant.isLocal && ' (You)'}
          </Badge>
          {participant.isScreenSharing && (
            <Badge variant="outline" className="text-xs">
              <Monitor className="h-3 w-3 mr-1" />
              Screen
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!participant.isAudioEnabled && (
            <MicOff className="h-4 w-4 text-red-500" />
          )}
          {!participant.isVideoEnabled && (
            <VideoOff className="h-4 w-4 text-red-500" />
          )}
          {getQualityIcon(participant.connectionQuality)}
        </div>
      </div>

      {/* Audio Level Indicator */}
      {participant.isAudioEnabled && participant.isSpeaking && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 bg-green-500 rounded-full transition-all",
                  participant.audioLevel > (i + 1) * 25 ? 'h-3' : 'h-1'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("h-full flex flex-col bg-black text-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(callStats.duration)}
          </Badge>
          <Badge variant="outline">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </Badge>
          {isRecording && (
            <Badge variant="destructive">
              <Circle className="h-3 w-3 mr-1 fill-current animate-pulse" />
              Recording
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLayout(layout === 'grid' ? 'spotlight' : 'grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <Signal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <Card className="m-4 bg-black/80 backdrop-blur text-white border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Call Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>Quality: {callStats.connectionQuality}</div>
              <div>Bandwidth: {callStats.bandwidth} Mbps</div>
              <div>Latency: {callStats.latency}ms</div>
              <div>Packets Lost: {callStats.packetsLost}</div>
              <div>Resolution: {callStats.resolution}</div>
              <div>Frame Rate: {callStats.frameRate} fps</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card className="m-4 bg-black/80 backdrop-blur text-white border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Call Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Video Quality</Label>
              <Select value={videoQuality} onValueChange={(value: typeof videoQuality) => setVideoQuality(value)}>
                <SelectTrigger className="bg-black/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="high">High (1080p)</SelectItem>
                  <SelectItem value="medium">Medium (720p)</SelectItem>
                  <SelectItem value="low">Low (480p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Echo Cancellation</Label>
                <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Noise Suppression</Label>
                <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto Gain Control</Label>
                <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Audio Level: {audioLevel}%</Label>
              <Slider
                value={[audioLevel]}
                onValueChange={([value]) => setAudioLevel(value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
      <div className="flex-1 p-4">
        {layout === 'grid' ? (
          <div className={cn(
            "grid gap-4 h-full",
            participants.length === 1 && "grid-cols-1",
            participants.length === 2 && "grid-cols-2",
            participants.length <= 4 && participants.length > 2 && "grid-cols-2 grid-rows-2",
            participants.length > 4 && "grid-cols-3 grid-rows-2"
          )}>
            {participants.map(participant => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        ) : (
          <div className="flex h-full gap-4">
            {/* Main Video */}
            <div className="flex-1">
              {remoteParticipants[0] && (
                <ParticipantVideo participant={remoteParticipants[0]} />
              )}
            </div>
            
            {/* Sidebar with other participants */}
            <div className="w-48 space-y-2">
              {localParticipant && (
                <div className="h-32">
                  <ParticipantVideo participant={localParticipant} />
                </div>
              )}
              {remoteParticipants.slice(1).map(participant => (
                <div key={participant.id} className="h-32">
                  <ParticipantVideo participant={participant} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 bg-black/80 backdrop-blur">
        <Button
          variant={localParticipant?.isAudioEnabled ? 'outline' : 'destructive'}
          size="lg"
          onClick={onToggleAudio}
          className="h-12 w-12 rounded-full"
        >
          {localParticipant?.isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        {callType !== 'voice' && (
          <Button
            variant={localParticipant?.isVideoEnabled ? 'outline' : 'destructive'}
            size="lg"
            onClick={onToggleVideo}
            className="h-12 w-12 rounded-full"
          >
            {localParticipant?.isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={onToggleScreenShare}
          className="h-12 w-12 rounded-full"
        >
          <Monitor className="h-5 w-5" />
        </Button>

        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          size="lg"
          onClick={handleToggleRecording}
          className="h-12 w-12 rounded-full"
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Circle className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onToggleChat}
          className="h-12 w-12 rounded-full"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onAddParticipant}
          className="h-12 w-12 rounded-full"
        >
          <UserPlus className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="h-12 w-12 rounded-full"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}