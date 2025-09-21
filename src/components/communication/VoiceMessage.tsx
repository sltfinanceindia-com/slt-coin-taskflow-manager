import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  Share2,
  Clock,
  FileAudio,
  Activity,
  Zap,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceMessage {
  id: string;
  audioUrl: string;
  duration: number;
  timestamp: Date;
  isPlaying: boolean;
  currentTime: number;
  transcription?: string;
  hasTranscription: boolean;
  quality: 'low' | 'medium' | 'high';
  volume: number;
}

interface VoiceMessageProps {
  message?: VoiceMessage;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onSendVoiceMessage?: (audioBlob: Blob) => void;
  onPlay?: (messageId: string) => void;
  onPause?: (messageId: string) => void;
  onSeek?: (messageId: string, time: number) => void;
  onDelete?: (messageId: string) => void;
  onDownload?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
  className?: string;
  showAdvancedControls?: boolean;
}

export default function VoiceMessage({
  message,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  onSendVoiceMessage,
  onPlay,
  onPause,
  onSeek,
  onDelete,
  onDownload,
  onShare,
  className,
  showAdvancedControls = false
}: VoiceMessageProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [showTranscription, setShowTranscription] = useState(false);
  const [enableNoiseReduction, setEnableNoiseReduction] = useState(true);
  const [audioQuality, setAudioQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [compressAudio, setCompressAudio] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecordingTimer();
      startAudioLevelMonitoring();
    } else {
      stopRecordingTimer();
      stopAudioLevelMonitoring();
    }
  }, [isRecording]);

  const startRecordingTimer = () => {
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(Math.round((average / 255) * 100));
        }
      };

      audioLevelTimerRef.current = setInterval(updateAudioLevel, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopAudioLevelMonitoring = () => {
    if (audioLevelTimerRef.current) {
      clearInterval(audioLevelTimerRef.current);
      audioLevelTimerRef.current = null;
    }
    setAudioLevel(0);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: enableNoiseReduction,
          autoGainControl: true
        }
      });
      
      const options: MediaRecorderOptions = {};
      
      // Set audio quality based on settings
      switch (audioQuality) {
        case 'low':
          options.audioBitsPerSecond = 32000;
          break;
        case 'medium':
          options.audioBitsPerSecond = 64000;
          break;
        case 'high':
          options.audioBitsPerSecond = 128000;
          break;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        onSendVoiceMessage?.(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      onStartRecording?.();
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not start recording');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onStopRecording?.();
      toast.success('Recording stopped');
    }
  };

  const handlePlayPause = () => {
    if (!message) return;
    
    if (message.isPlaying) {
      onPause?.(message.id);
    } else {
      onPlay?.(message.id);
    }
  };

  const handleSeek = (value: number[]) => {
    if (message) {
      onSeek?.(message.id, value[0]);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const generateWaveform = (levels: number[]) => {
    return levels.map((level, index) => (
      <div
        key={index}
        className="bg-primary rounded-full transition-all duration-150"
        style={{
          height: `${Math.max(2, level * 0.8)}px`,
          width: '2px'
        }}
      />
    ));
  };

  const mockWaveformData = Array.from({ length: 50 }, () => Math.random() * 40 + 5);

  if (isRecording) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="p-4 space-y-4">
          {/* Recording Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
            <Badge variant="secondary">{formatTime(recordingTime)}</Badge>
          </div>

          {/* Audio Level Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-center h-16 bg-muted rounded-lg">
              <div className="flex items-end gap-1 h-12">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-red-500 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(2, (audioLevel / 100) * 48 * Math.sin(i * 0.5))}px`,
                      width: '3px'
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Audio Level Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level</span>
                <span>{audioLevel}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-150"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex gap-2">
            <Button onClick={handleStopRecording} className="flex-1">
              <Square className="h-4 w-4 mr-2" />
              Stop & Send
            </Button>
            <Button variant="outline" onClick={handleStopRecording}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Settings */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Label htmlFor="noise-reduction">Noise Reduction</Label>
              <Switch
                id="noise-reduction"
                checked={enableNoiseReduction}
                onCheckedChange={setEnableNoiseReduction}
                className="scale-75"
              />
            </div>
            <Badge variant="outline" className={getQualityColor(audioQuality)}>
              {audioQuality} quality
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (message) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="p-4 space-y-3">
          {/* Message Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice Message</span>
              <Badge variant="outline" className={getQualityColor(message.quality)}>
                {message.quality}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>

          {/* Waveform & Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="h-10 w-10 p-0"
              >
                {message.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <div className="flex-1 space-y-2">
                {/* Waveform */}
                <div className="flex items-center justify-center h-8 bg-muted rounded gap-1 px-2">
                  {generateWaveform(mockWaveformData)}
                </div>
                
                {/* Progress */}
                <Slider
                  value={[message.currentTime]}
                  max={message.duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
              </div>
              
              <div className="text-right">
                <div className="text-sm font-mono">
                  {formatTime(message.currentTime)} / {formatTime(message.duration)}
                </div>
                {showAdvancedControls && (
                  <div className="text-xs text-muted-foreground">
                    {playbackSpeed}x speed
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Controls */}
            {showAdvancedControls && (
              <div className="flex gap-2">
                <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={([value]) => setVolume(value)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onDownload?.(message.id)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onShare?.(message.id)}>
                <Share2 className="h-4 w-4" />
              </Button>
              {message.hasTranscription && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTranscription(!showTranscription)}
                >
                  <FileAudio className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete?.(message.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Transcription */}
            {showTranscription && message.transcription && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Transcription</span>
                </div>
                <p className="text-sm">{message.transcription}</p>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="space-y-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-transcribe</Label>
                  <Switch checked={autoTranscribe} onCheckedChange={setAutoTranscribe} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Compress audio</Label>
                  <Switch checked={compressAudio} onCheckedChange={setCompressAudio} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Audio quality</Label>
                  <Select value={audioQuality} onValueChange={(value: typeof audioQuality) => setAudioQuality(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (32kbps)</SelectItem>
                      <SelectItem value="medium">Medium (64kbps)</SelectItem>
                      <SelectItem value="high">High (128kbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Recording Interface
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          <Button
            onClick={handleStartRecording}
            className="h-16 w-16 rounded-full"
            variant="outline"
          >
            <Mic className="h-6 w-6" />
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Tap to start recording
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Recording Settings
            {showSettings ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </Button>

          {showSettings && (
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Noise Reduction</Label>
                <Switch checked={enableNoiseReduction} onCheckedChange={setEnableNoiseReduction} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-transcribe</Label>
                <Switch checked={autoTranscribe} onCheckedChange={setAutoTranscribe} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Quality</Label>
                <Select value={audioQuality} onValueChange={(value: typeof audioQuality) => setAudioQuality(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (32kbps)</SelectItem>
                    <SelectItem value="medium">Medium (64kbps)</SelectItem>
                    <SelectItem value="high">High (128kbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}