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
  Dot,
  Wifi,
  WifiOff,
  Record,
  StopCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useWebRTC } from '@/hooks/useWebRTC';
import { cn } from '@/lib/utils';

interface MediaDevice {
  id: string;
  label: string;
  kind: string;
}

interface NetworkStats {
  bitrate: number;
  packetLoss: number;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface CallSettings {
  noiseCancellation: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  backgroundBlur: boolean;
  layout: 'grid' | 'speaker' | 'gallery';
}

export default function CallControls() {
  const {
    callState,
    localStream,
    remoteStreams,
    localVideoRef,
    startVoiceCall,
    startVideoCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    startScreenShare,
    stopScreenShare,
    toggleParticipants,
    addParticipant,
    simulateIncomingCall
  } = useWebRTC();

  const [showSettings, setShowSettings] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [volume, setVolume] = useState(80);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    bitrate: 1200,
    packetLoss: 0.1,
    latency: 45,
    quality: 'good'
  });

  const [callSettings, setCallSettings] = useState<CallSettings>({
    noiseCancellation: true,
    echoCancellation: true,
    autoGainControl: false,
    backgroundBlur: false,
    layout: 'grid'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsInterval = useRef<NodeJS.Timeout | null>(null);

  // Get available media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions first
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audio = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({ 
            id: device.deviceId, 
            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
            kind: device.kind
          }));
          
        const video = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({ 
            id: device.deviceId, 
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
            kind: device.kind
          }));
        
        setAudioDevices(audio);
        setVideoDevices(video);
        
        if (audio.length > 0) setSelectedAudioDevice(audio[0].id);
        if (video.length > 0) setSelectedVideoDevice(video[0].id);
      } catch (error) {
        console.error('Error getting devices:', error);
        toast.error('Could not access media devices');
      }
    };

    getDevices();
  }, []);

  // Network stats simulation (in real app, get from WebRTC stats)
  useEffect(() => {
    if (callState.isActive) {
      statsInterval.current = setInterval(() => {
        setNetworkStats(prev => ({
          ...prev,
          bitrate: 1200 + Math.random() * 400,
          packetLoss: Math.random() * 2,
          latency: 40 + Math.random() * 20,
          quality: prev.packetLoss < 1 ? 'excellent' : prev.packetLoss < 2 ? 'good' : 'fair'
        }));
      }, 2000);
    } else {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
        statsInterval.current = null;
      }
    }

    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }
    };
  }, [callState.isActive]);

  // Start test call
  const startTestCall = async (type: 'voice' | 'video') => {
    try {
      if (type === 'video') {
        await startVideoCall('test-user', 'Test User');
      } else {
        await startVoiceCall('test-user', 'Test User');
      }
      toast.success(`${type} call started`);
    } catch (error) {
      toast.error(`Failed to start ${type} call`);
      console.error('Error starting call:', error);
    }
  };

  // Handle call end
  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    endCall();
    toast.success('Call ended');
  };

  // Switch media devices
  const switchDevice = async (deviceId: string, kind: 'audio' | 'video') => {
    try {
      if (!localStream) return;

      const constraints = kind === 'video' 
        ? { video: { deviceId: { exact: deviceId } } }
        : { audio: { deviceId: { exact: deviceId } } };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newTrack = kind === 'video' 
        ? newStream.getVideoTracks()[0]
        : newStream.getAudioTracks()[0];

      const oldTrack = kind === 'video'
        ? localStream.getVideoTracks()[0]
        : localStream.getAudioTracks()[0];

      if (oldTrack) {
        localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }

      localStream.addTrack(newTrack);

      if (kind === 'video') {
        setSelectedVideoDevice(deviceId);
      } else {
        setSelectedAudioDevice(deviceId);
      }

      toast.success(`Switched to new ${kind} device`);
    } catch (error) {
      toast.error(`Failed to switch ${kind} device`);
      console.error('Error switching device:', error);
    }
  };

  // Recording functionality
  const startRecording = () => {
    try {
      if (!localStream) {
        toast.error('No active stream to record');
        return;
      }

      const options = {
        mimeType: 'video/webm;codecs=vp9,opus'
      };

      const recorder = new MediaRecorder(localStream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `call-recording-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setRecordedChunks([]);
      };

      recorder.start(1000); // Record in 1-second chunks
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording');
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      toast.success('Recording stopped and saved');
    }
  };

  // Take snapshot
  const takeSnapshot = () => {
    if (!localVideoRef.current || !callState.isVideoEnabled) {
      toast.error('Video not available for snapshot');
      return;
    }

    const canvas = canvasRef.current;
    const video = localVideoRef.current;

    if (canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `call-snapshot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Snapshot saved');
          }
        }, 'image/png');
      }
    }
  };

  // Test functions
  const testIncomingCall = () => {
    simulateIncomingCall('test-caller', 'John Doe', 'voice');
  };

  const testIncomingVideoCall = () => {
    simulateIncomingCall('test-caller', 'Jane Smith', 'video');
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

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'fair':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Video Display */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {callState.isActive && (
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {formatDuration(callState.duration)}
                </Badge>
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {callState.participants.length + 1} participant{callState.participants.length !== 0 ? 's' : ''}
                </Badge>
                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Dot className="w-3 h-3 mr-1" />
                    Recording
                  </Badge>
                )}
              </div>
            )}

            {callState.isScreenSharing && (
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="bg-blue-600">
                  <Monitor className="w-3 h-3 mr-1" />
                  Screen Sharing
                </Badge>
              </div>
            )}

            {!callState.isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Ready to start call</p>
                  <p className="text-sm opacity-75">Click start to begin video or voice call</p>
                </div>
              </div>
            )}

            {/* Mute indicator */}
            {callState.isMuted && callState.isActive && (
              <div className="absolute bottom-4 left-4">
                <Badge variant="destructive">
                  <MicOff className="w-3 h-3 mr-1" />
                  Muted
                </Badge>
              </div>
            )}

            {/* Connection quality */}
            {callState.isActive && (
              <div className="absolute bottom-4 right-4">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {getQualityIcon(networkStats.quality)}
                  <span className="ml-1">{networkStats.quality}</span>
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Primary Controls */}
            <Button
              variant={callState.isMuted ? 'destructive' : 'secondary'}
              size="lg"
              onClick={toggleMute}
              disabled={!callState.isActive}
              className="h-12 w-12 rounded-full"
            >
              {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant={!callState.isVideoEnabled ? 'destructive' : 'secondary'}
              size="lg"
              onClick={toggleVideo}
              disabled={!callState.isActive}
              className="h-12 w-12 rounded-full"
            >
              {callState.isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            {/* Start/End Call */}
            {!callState.isActive ? (
              <div className="flex gap-2">
                <Button 
                  onClick={() => startTestCall('voice')} 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 h-12"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Voice Call
                </Button>
                <Button 
                  onClick={() => startTestCall('video')} 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 h-12"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Video Call
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleEndCall} 
                size="lg" 
                variant="destructive"
                className="h-12 w-12 rounded-full"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            )}

            {/* Secondary Controls */}
            <Button
              variant={callState.isScreenSharing ? 'default' : 'secondary'}
              size="lg"
              onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
              disabled={!callState.isActive}
              className="h-12 w-12 rounded-full"
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={toggleParticipants}
              disabled={!callState.isActive}
              className="h-12 w-12 rounded-full"
            >
              <Users className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowSettings(!showSettings)}
              className="h-12 w-12 rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant={isRecording ? 'destructive' : 'secondary'}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!callState.isActive}
              className="h-12 w-12 rounded-full"
            >
              {isRecording ? (
                <StopCircle className="h-5 w-5" />
              ) : (
                <Record className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={takeSnapshot}
              disabled={!callState.isActive || !callState.isVideoEnabled}
              className="h-12 w-12 rounded-full"
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          {callState.callType === 'voice' && (
            <div className="flex items-center gap-4 mt-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleSpeaker}
              >
                {callState.isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{volume}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={testIncomingCall}>
              Test Incoming Voice Call
            </Button>
            <Button variant="outline" onClick={testIncomingVideoCall}>
              Test Incoming Video Call
            </Button>
            <Button variant="outline" onClick={addParticipant} disabled={!callState.isActive}>
              Add Test Participant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants Panel */}
      {callState.showParticipants && callState.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({callState.participants.length + 1})
              </span>
              <Button variant="outline" size="sm" onClick={addParticipant}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Current user */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    Y
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">You</span>
                      <Badge variant="secondary" className="text-xs">Host</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={getQualityColor(networkStats.quality)}>
                        ● {networkStats.quality}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    {callState.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    {callState.isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Other participants */}
              {callState.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-medium">
                      {participant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={getQualityColor(participant.connectionQuality)}>
                          ● {participant.connectionQuality}
                        </span>
                        {participant.isSpeaking && (
                          <span className="text-green-500">Speaking</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      {participant.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      {participant.isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Remove participant logic would go here
                        toast.success(`Removed ${participant.name} from call`);
                      }}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
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
                  onChange={(e) => switchDevice(e.target.value, 'video')}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={!callState.isActive}
                >
                  {videoDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <select
                  value={selectedAudioDevice}
                  onChange={(e) => switchDevice(e.target.value, 'audio')}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={!callState.isActive}
                >
                  {audioDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
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
                <Switch 
                  checked={callSettings.noiseCancellation}
                  onCheckedChange={(checked) => 
                    setCallSettings(prev => ({ ...prev, noiseCancellation: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Echo Cancellation</span>
                <Switch 
                  checked={callSettings.echoCancellation}
                  onCheckedChange={(checked) => 
                    setCallSettings(prev => ({ ...prev, echoCancellation: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto Gain Control</span>
                <Switch 
                  checked={callSettings.autoGainControl}
                  onCheckedChange={(checked) => 
                    setCallSettings(prev => ({ ...prev, autoGainControl: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Blur</span>
                <Switch 
                  checked={callSettings.backgroundBlur}
                  onCheckedChange={(checked) => 
                    setCallSettings(prev => ({ ...prev, backgroundBlur: checked }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Network Stats */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                Network Statistics
                {getQualityIcon(networkStats.quality)}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bitrate:</span>
                  <span className="ml-2">{Math.round(networkStats.bitrate)} kbps</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="ml-2">{Math.round(networkStats.latency)} ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Packet Loss:</span>
                  <span className="ml-2">{networkStats.packetLoss.toFixed(1)}%</span>
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
