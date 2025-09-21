import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
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
  Maximize,
  Minimize,
  RotateCcw,
  Camera,
  Grid,
  Dot
} from 'lucide-react';
import { toast } from 'sonner';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isHost: boolean;
  joinedAt: Date;
}

interface CallState {
  isActive: boolean;
  duration: number;
  participants: CallParticipant[];
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  volume: number;
  layout: 'grid' | 'speaker' | 'gallery';
}

export default function CallControls() {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    duration: 0,
    participants: [],
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
    isRecording: false,
    volume: 80,
    layout: 'grid'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [audioDevices, setAudioDevices] = useState<{ [key: string]: any }[]>([]);
  const [videoDevices, setVideoDevices] = useState<{ [key: string]: any }[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [networkStats, setNetworkStats] = useState({
    bitrate: 0,
    packetLoss: 0,
    latency: 0,
    quality: 'good' as 'excellent' | 'good' | 'fair' | 'poor'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isActive) {
      interval = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isActive]);

  useEffect(() => {
    // Get available media devices
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audio = devices.filter(device => device.kind === 'audioinput');
        const video = devices.filter(device => device.kind === 'videoinput');
        
        setAudioDevices(audio.map(device => ({ id: device.deviceId, label: device.label })));
        setVideoDevices(video.map(device => ({ id: device.deviceId, label: device.label })));
        
        if (audio.length > 0) setSelectedAudioDevice(audio[0].deviceId);
        if (video.length > 0) setSelectedVideoDevice(video[0].deviceId);
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedVideoDevice },
        audio: { deviceId: selectedAudioDevice }
      });

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
            joinedAt: new Date()
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
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    setCallState(prev => ({
      ...prev,
      isActive: false,
      duration: 0,
      participants: [],
      isScreenSharing: false,
      isRecording: false
    }));

    toast.success('Call ended');
  };

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = callState.isMuted;
      }
    }
  };

  const toggleVideo = () => {
    setCallState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = callState.isVideoOn;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!callState.isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
        toast.success('Screen sharing started');
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedVideoDevice },
          audio: { deviceId: selectedAudioDevice }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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

  const addParticipant = () => {
    const newParticipant: CallParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      name: `User ${callState.participants.length + 1}`,
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
      connectionQuality: 'good',
      isHost: false,
      joinedAt: new Date()
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

  return (
    <div className="space-y-6">
      {/* Video Display */}
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
            
            {callState.isActive && (
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={callState.isRecording ? 'destructive' : 'secondary'}>
                  {callState.isRecording && <Dot className="w-3 h-3 mr-1 animate-pulse" />}
                  {callState.isRecording ? 'Recording' : formatDuration(callState.duration)}
                </Badge>
                <Badge variant="secondary">
                  {callState.participants.length} participant{callState.participants.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}

            {callState.isScreenSharing && (
              <div className="absolute top-4 right-4">
                <Badge variant="default">
                  <Monitor className="w-3 h-3 mr-1" />
                  Screen Sharing
                </Badge>
              </div>
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

      {/* Call Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Primary Controls */}
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

            {/* Secondary Controls */}
            <Button
              variant={callState.isScreenSharing ? 'default' : 'secondary'}
              size="lg"
              onClick={toggleScreenShare}
              disabled={!callState.isActive}
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowParticipants(!showParticipants)}
              disabled={!callState.isActive}
            >
              <Users className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant={callState.isRecording ? 'destructive' : 'secondary'}
              size="lg"
              onClick={toggleRecording}
              disabled={!callState.isActive}
            >
              <Dot className={`h-5 w-5 ${callState.isRecording ? 'animate-pulse' : ''}`} />
            </Button>

            <Button variant="secondary" size="lg">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4 mt-6">
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

      {/* Participants Panel */}
      {showParticipants && callState.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({callState.participants.length})
              </span>
              <Button variant="outline" size="sm" onClick={addParticipant}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callState.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {participant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.name}</span>
                        {participant.isHost && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={getQualityColor(participant.connectionQuality)}>
                          ● {participant.connectionQuality}
                        </span>
                        {participant.isHandRaised && (
                          <span className="text-yellow-500">
                            <Hand className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" disabled={participant.isMuted}>
                      {participant.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" disabled={!participant.isVideoOn}>
                      {participant.isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    {!participant.isHost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Call Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Camera</label>
                <select
                  value={selectedVideoDevice}
                  onChange={(e) => setSelectedVideoDevice(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {videoDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label || `Camera ${device.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <select
                  value={selectedAudioDevice}
                  onChange={(e) => setSelectedAudioDevice(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {audioDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label || `Microphone ${device.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            {/* Advanced Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Noise Cancellation</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Echo Cancellation</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto Gain Control</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Blur</span>
                <Switch />
              </div>
            </div>

            <Separator />

            {/* Network Stats */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Network Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bitrate:</span>
                  <span className="ml-2">{networkStats.bitrate} kbps</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="ml-2">{networkStats.latency} ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Packet Loss:</span>
                  <span className="ml-2">{networkStats.packetLoss}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality:</span>
                  <span className={`ml-2 ${getQualityColor(networkStats.quality)}`}>
                    {networkStats.quality}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}