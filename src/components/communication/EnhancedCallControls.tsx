import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Settings,
  Users,
  Share,
  MessageCircle,
  MoreVertical,
  UserPlus,
  UserMinus,
  Hand,
  Monitor,
  MonitorOff,
  Maximize,
  Minimize,
  RotateCcw,
  Camera,
  Grid,
  Dot,
  Headphones,
  Speaker,
  Wifi,
  WifiOff,
  Signal,
  Activity,
  Circle,
  Square,
  Play,
  Pause,
  StopCircle,
  Zap,
  Filter,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isHost: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

interface CallState {
  isActive: boolean;
  duration: number;
  participants: CallParticipant[];
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isPaused: boolean;
  volume: number;
  layout: 'grid' | 'speaker' | 'gallery' | 'presentation';
  activeFilters: string[];
}

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

interface VideoDevice {
  deviceId: string;
  label: string;
}

interface NetworkStats {
  bitrate: number;
  packetLoss: number;
  latency: number;
  jitter: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function EnhancedCallControls() {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    duration: 0,
    participants: [],
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
    isRecording: false,
    isPaused: false,
    volume: 80,
    layout: 'grid',
    activeFilters: []
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showNetworkStats, setShowNetworkStats] = useState(false);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    bitrate: 1500,
    packetLoss: 0.1,
    latency: 45,
    jitter: 2,
    bandwidth: 2000,
    quality: 'good'
  });

  // Advanced settings
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState('none');
  const [audioEnhancement, setAudioEnhancement] = useState(false);
  const [lowLightCorrection, setLowLightCorrection] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isActive && !callState.isPaused) {
      interval = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isActive, callState.isPaused]);

  useEffect(() => {
    // Get available media devices
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
            kind: 'audioinput' as const
          }));

        const audioOutputs = devices
          .filter(device => device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
            kind: 'audiooutput' as const
          }));

        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`
          }));
        
        setAudioDevices([...audioInputs, ...audioOutputs]);
        setVideoDevices(videoInputs);
        
        if (audioInputs.length > 0) setSelectedAudioInput(audioInputs[0].deviceId);
        if (audioOutputs.length > 0) setSelectedAudioOutput(audioOutputs[0].deviceId);
        if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
      } catch (error) {
        console.error('Error getting devices:', error);
        toast.error('Failed to access media devices');
      }
    };

    getDevices();
  }, []);

  // Simulate network stats updates
  useEffect(() => {
    if (callState.isActive) {
      const interval = setInterval(() => {
        setNetworkStats(prev => ({
          ...prev,
          bitrate: Math.floor(Math.random() * 500) + 1200,
          packetLoss: Math.random() * 2,
          latency: Math.floor(Math.random() * 50) + 30,
          jitter: Math.floor(Math.random() * 5) + 1,
          bandwidth: Math.floor(Math.random() * 1000) + 1500
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [callState.isActive]);

  const startCall = async () => {
    try {
      const constraints = {
        video: {
          deviceId: selectedVideoDevice,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          deviceId: selectedAudioInput,
          echoCancellation,
          noiseSuppression: noiseCancellation,
          autoGainControl,
          sampleRate: { ideal: 48000 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCallState(prev => ({
        ...prev,
        isActive: true,
        participants: [
          {
            id: 'self',
            name: 'You',
            isMuted: false,
            isVideoOn: true,
            isHandRaised: false,
            connectionQuality: 'excellent',
            isHost: true,
            isScreenSharing: false,
            joinedAt: new Date(),
            lastActivity: new Date()
          }
        ]
      }));

      toast.success('Call started successfully');
    } catch (error) {
      toast.error('Failed to start call');
      console.error('Error starting call:', error);
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCallState(prev => ({
      ...prev,
      isActive: false,
      duration: 0,
      participants: [],
      isScreenSharing: false,
      isRecording: false,
      isPaused: false
    }));

    toast.success('Call ended');
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = callState.isMuted;
      }
    }
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = callState.isVideoOn;
      }
    }
    setCallState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
  };

  const toggleScreenShare = async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenConstraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        };

        const screenStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }

        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          setCallState(prev => ({ ...prev, isScreenSharing: false }));
          // Switch back to camera
          if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
        });

        setCallState(prev => ({ ...prev, isScreenSharing: true }));
        toast.success('Screen sharing started');
      } else {
        // Stop screen sharing and return to camera
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setCallState(prev => ({ ...prev, isScreenSharing: false }));
        toast.success('Screen sharing stopped');
      }
    } catch (error) {
      toast.error('Failed to toggle screen share');
    }
  };

  const toggleRecording = () => {
    setCallState(prev => ({ ...prev, isRecording: !prev.isRecording }));
    toast.success(callState.isRecording ? 'Recording stopped' : 'Recording started');
  };

  const togglePause = () => {
    setCallState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    toast.success(callState.isPaused ? 'Call resumed' : 'Call paused');
  };

  const addParticipant = () => {
    const newParticipant: CallParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      name: `User ${callState.participants.length + 1}`,
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
      connectionQuality: 'good',
      isHost: false,
      isScreenSharing: false,
      joinedAt: new Date(),
      lastActivity: new Date()
    };

    setCallState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  const removeParticipant = (participantId: string) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }));
  };

  const changeLayout = (layout: CallState['layout']) => {
    setCallState(prev => ({ ...prev, layout }));
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSignalIcon = (quality: string) => {
    const baseClass = "h-4 w-4";
    const colorClass = getQualityColor(quality);
    
    switch (quality) {
      case 'excellent': return <Signal className={cn(baseClass, colorClass)} />;
      case 'good': return <Wifi className={cn(baseClass, colorClass)} />;
      case 'fair': return <Activity className={cn(baseClass, colorClass)} />;
      case 'poor': return <WifiOff className={cn(baseClass, colorClass)} />;
      default: return <WifiOff className={cn(baseClass, "text-gray-500")} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Video Display */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Enhanced Overlay Information */}
            {callState.isActive && (
              <>
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={callState.isRecording ? 'destructive' : 'secondary'}>
                    {callState.isRecording && <Circle className="w-3 h-3 mr-1 animate-pulse fill-current" />}
                    {callState.isRecording ? 'REC' : formatDuration(callState.duration)}
                  </Badge>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    {callState.participants.length}
                  </Badge>
                  {callState.isPaused && (
                    <Badge variant="outline">
                      <Pause className="w-3 h-3 mr-1" />
                      Paused
                    </Badge>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  {callState.isScreenSharing && (
                    <Badge variant="default">
                      <Monitor className="w-3 h-3 mr-1" />
                      Sharing
                    </Badge>
                  )}
                  {getSignalIcon(networkStats.quality)}
                </div>

                {/* Layout Controls */}
                <div className="absolute bottom-20 right-4 flex gap-1">
                  <Button
                    variant={callState.layout === 'grid' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => changeLayout('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={callState.layout === 'speaker' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => changeLayout('speaker')}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={callState.layout === 'gallery' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => changeLayout('gallery')}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {!callState.isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Camera Off</p>
                  <p className="text-sm opacity-75">Click start call to begin</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Call Controls */}
      <Card>
        <CardContent className="p-6">
          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button
              variant={callState.isMuted ? 'destructive' : 'secondary'}
              size="lg"
              onClick={toggleMute}
              disabled={!callState.isActive}
            >
              {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant={callState.isVideoOn ? 'secondary' : 'destructive'}
              size="lg"
              onClick={toggleVideo}
              disabled={!callState.isActive}
            >
              {callState.isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            {/* Start/End Call */}
            {!callState.isActive ? (
              <Button onClick={startCall} size="lg" className="bg-green-600 hover:bg-green-700">
                <Phone className="h-5 w-5" />
              </Button>
            ) : (
              <Button onClick={endCall} size="lg" variant="destructive">
                <PhoneOff className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant={callState.isScreenSharing ? 'default' : 'secondary'}
              size="lg"
              onClick={toggleScreenShare}
              disabled={!callState.isActive}
            >
              {callState.isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>

            <Button
              variant={callState.isRecording ? 'destructive' : 'secondary'}
              size="lg"
              onClick={toggleRecording}
              disabled={!callState.isActive}
            >
              {callState.isRecording ? <StopCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              variant={callState.isPaused ? 'default' : 'secondary'}
              size="sm"
              onClick={togglePause}
              disabled={!callState.isActive}
            >
              {callState.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              disabled={!callState.isActive}
            >
              <Users className="h-4 w-4" />
            </Button>

            <Button variant="secondary" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>

            <Button variant="secondary" size="sm">
              <Hand className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowNetworkStats(!showNetworkStats)}
            >
              <Activity className="h-4 w-4" />
            </Button>

            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4" />
            </Button>

            <Button variant="secondary" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              {callState.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[callState.volume]}
              onValueChange={(value) => setCallState(prev => ({ ...prev, volume: value[0] }))}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{callState.volume}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      {showNetworkStats && callState.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Network Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{networkStats.bitrate}</p>
                <p className="text-sm text-muted-foreground">Bitrate (kbps)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{networkStats.latency}</p>
                <p className="text-sm text-muted-foreground">Latency (ms)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{networkStats.packetLoss.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Packet Loss</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{networkStats.jitter}</p>
                <p className="text-sm text-muted-foreground">Jitter (ms)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{networkStats.bandwidth}</p>
                <p className="text-sm text-muted-foreground">Bandwidth (kbps)</p>
              </div>
              <div className="text-center">
                <p className={cn("text-2xl font-bold", getQualityColor(networkStats.quality))}>
                  {networkStats.quality}
                </p>
                <p className="text-sm text-muted-foreground">Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Camera</label>
                <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.filter(d => d.kind === 'audioinput').map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Speaker</label>
                <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.filter(d => d.kind === 'audiooutput').map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Audio Enhancement */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Audio Enhancement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Noise Cancellation</span>
                  <Switch checked={noiseCancellation} onCheckedChange={setNoiseCancellation} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Echo Cancellation</span>
                  <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Gain Control</span>
                  <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audio Enhancement</span>
                  <Switch checked={audioEnhancement} onCheckedChange={setAudioEnhancement} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Video Enhancement */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Video Enhancement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Blur</span>
                  <Switch checked={backgroundBlur} onCheckedChange={setBackgroundBlur} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Light Correction</span>
                  <Switch checked={lowLightCorrection} onCheckedChange={setLowLightCorrection} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Virtual Background</label>
                  <Select value={virtualBackground} onValueChange={setVirtualBackground}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="blur">Blur</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}