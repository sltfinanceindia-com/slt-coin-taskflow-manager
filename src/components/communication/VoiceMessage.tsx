import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
  Settings,
  Waveform,
  Download,
  Upload,
  Copy,
  Share2,
  Edit3,
  Scissors,
  Maximize2,
  Minimize2,
  X,
  Check,
  AlertCircle,
  Info,
  Zap,
  Brain,
  Sparkles,
  Activity,
  BarChart3,
  Timer,
  Clock,
  StopCircle,
  PlayCircle,
  PauseCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Headphones,
  Speaker,
  FileAudio,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, addSeconds } from 'date-fns';

interface VoiceMessageProps {
  onSend: (audioBlob: Blob, duration: number, metadata?: AudioMetadata) => void;
  onCancel: () => void;
  isOpen: boolean;
  maxDuration?: number; // in seconds
  enableTranscription?: boolean;
  enableNoiseReduction?: boolean;
  enableWaveformVisualization?: boolean;
  enableAdvancedControls?: boolean;
  enableAudioEffects?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'lossless';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'modal' | 'inline' | 'floating';
  onTranscriptionComplete?: (transcript: string) => void;
  className?: string;
}

interface AudioMetadata {
  duration: number;
  size: number;
  format: string;
  sampleRate: number;
  channels: number;
  bitRate?: number;
  transcript?: string;
  waveformData?: number[];
  noiseLevel?: number;
  quality?: string;
}

interface WaveformPoint {
  amplitude: number;
  frequency: number;
  timestamp: number;
}

const audioFormats = {
  webm: { label: 'WebM', mimeType: 'audio/webm', extension: '.webm' },
  mp3: { label: 'MP3', mimeType: 'audio/mp3', extension: '.mp3' },
  wav: { label: 'WAV', mimeType: 'audio/wav', extension: '.wav' },
  m4a: { label: 'M4A', mimeType: 'audio/mp4', extension: '.m4a' }
};

const qualityPresets = {
  low: { bitRate: 64000, sampleRate: 22050, channels: 1 },
  medium: { bitRate: 128000, sampleRate: 44100, channels: 1 },
  high: { bitRate: 256000, sampleRate: 44100, channels: 2 },
  lossless: { bitRate: 1411000, sampleRate: 44100, channels: 2 }
};

export function VoiceMessage({ 
  onSend, 
  onCancel, 
  isOpen,
  maxDuration = 300, // 5 minutes default
  enableTranscription = false,
  enableNoiseReduction = true,
  enableWaveformVisualization = true,
  enableAdvancedControls = false,
  enableAudioEffects = false,
  quality = 'medium',
  theme = 'auto',
  size = 'lg',
  variant = 'modal',
  onTranscriptionComplete,
  className
}: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [recordingQuality, setRecordingQuality] = useState(quality);
  const [selectedFormat, setSelectedFormat] = useState('webm');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [deviceType, setDeviceType] = useState<'builtin' | 'headset' | 'external'>('builtin');
  const [inputGain, setInputGain] = useState(50);
  const [enableAutoGain, setEnableAutoGain] = useState(true);
  const [enableEchoCancellation, setEnableEchoCancellation] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const { toast } = useToast();

  // Enhanced audio constraints based on quality and settings
  const audioConstraints = useMemo(() => {
    const preset = qualityPresets[recordingQuality];
    return {
      audio: {
        channelCount: preset.channels,
        sampleRate: preset.sampleRate,
        echoCancellation: enableEchoCancellation,
        noiseSuppression: enableNoiseReduction,
        autoGainControl: enableAutoGain,
        ...(inputGain !== 50 && { 
          volume: inputGain / 100,
          gain: inputGain / 100 
        })
      }
    };
  }, [recordingQuality, enableEchoCancellation, enableNoiseReduction, enableAutoGain, inputGain]);

  // Real-time waveform visualization
  const updateWaveform = useCallback(() => {
    if (!analyzerRef.current || !canvasRef.current) return;

    const analyzer = analyzerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);

    // Update waveform data for storage
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    setWaveformData(prev => [...prev.slice(-99), average]); // Keep last 100 points
    setNoiseLevel(Math.max(...dataArray));

    // Draw waveform
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#3b82f6';
    
    const barWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [isRecording, isPaused]);

  // Timer management
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 0.1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);

  // Enhanced audio setup with advanced features
  const setupAudioContext = useCallback(async (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;
      
      source.connect(analyzer);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      
      if (enableWaveformVisualization) {
        updateWaveform();
      }
    } catch (error) {
      console.error('Error setting up audio context:', error);
    }
  }, [enableWaveformVisualization, updateWaveform]);

  // Enhanced recording start with device detection
  const startRecording = async () => {
    try {
      setIsProcessing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      streamRef.current = stream;
      
      // Detect device type
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setDeviceType(audioInputs.length > 1 ? 'external' : 'builtin');
      
      await setupAudioContext(stream);
      
      const format = audioFormats[selectedFormat as keyof typeof audioFormats];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: format.mimeType,
        audioBitsPerSecond: qualityPresets[recordingQuality].bitRate
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: format.mimeType });
        setAudioBlob(blob);
        
        // Generate metadata
        const metadata: AudioMetadata = {
          duration: duration,
          size: blob.size,
          format: selectedFormat,
          sampleRate: qualityPresets[recordingQuality].sampleRate,
          channels: qualityPresets[recordingQuality].channels,
          bitRate: qualityPresets[recordingQuality].bitRate,
          waveformData: [...waveformData],
          noiseLevel: noiseLevel,
          quality: recordingQuality
        };
        
        setAudioMetadata(metadata);
        
        // Transcription if enabled
        if (enableTranscription) {
          await transcribeAudio(blob);
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);
      setWaveformData([]);
      setIsProcessing(false);
      
      toast({
        title: "Recording Started",
        description: `Recording with ${recordingQuality} quality in ${selectedFormat.toUpperCase()} format`,
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsProcessing(false);
      
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        if (enableWaveformVisualization) {
          updateWaveform();
        }
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
    }
  }, [isRecording, isPaused, enableWaveformVisualization, updateWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isRecording]);

  // Enhanced audio transcription
  const transcribeAudio = async (blob: Blob) => {
    if (!enableTranscription) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate transcription API call
      // In reality, you'd use services like Google Speech-to-Text, Azure Speech, etc.
      const mockTranscript = "This is a simulated transcription of the voice message.";
      
      setTimeout(() => {
        setTranscript(mockTranscript);
        onTranscriptionComplete?.(mockTranscript);
        setIsProcessing(false);
        
        toast({
          title: "Transcription Complete",
          description: "Voice message has been transcribed successfully",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Transcription error:', error);
      setIsProcessing(false);
      
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe audio. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Enhanced playback with speed control
  const playRecording = useCallback(() => {
    if (!audioBlob) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audioRef.current = audio;
    audio.volume = volume / 100;
    audio.playbackRate = playbackSpeed;
    
    audio.onended = () => {
      setIsPlaying(false);
      setPlayProgress(0);
    };
    
    audio.ontimeupdate = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setPlayProgress(progress);
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback Error",
        description: "Could not play audio recording",
        variant: "destructive"
      });
    };
    
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Audio play error:', error);
    });
  }, [audioBlob, isPlaying, volume, playbackSpeed, toast]);

  // Audio compression
  const compressAudio = async () => {
    if (!audioBlob) return;
    
    setIsCompressing(true);
    setCompressionProgress(0);
    
    // Simulate compression progress
    const progressInterval = setInterval(() => {
      setCompressionProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsCompressing(false);
          toast({
            title: "Compression Complete",
            description: "Audio file has been compressed successfully",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const seekAudio = useCallback((seekPercent: number) => {
    if (audioRef.current) {
      const seekTime = (seekPercent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setPlayProgress(seekPercent);
    }
  }, []);

  const skipAudio = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + seconds
      ));
    }
  }, []);

  const deleteRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioBlob(null);
    setIsPlaying(false);
    setPlayProgress(0);
    setDuration(0);
    setWaveformData([]);
    setAudioMetadata(null);
    setTranscript('');
    setNoiseLevel(0);
  }, []);

  const sendRecording = useCallback(async () => {
    if (!audioBlob) return;
    
    try {
      const finalMetadata = {
        ...audioMetadata!,
        transcript: transcript || undefined,
        waveformData: waveformData
      };
      
      await onSend(audioBlob, duration, finalMetadata);
      
      toast({
        title: "Voice Message Sent",
        description: `${formatDuration(duration)} message sent successfully`,
      });
      
      deleteRecording();
      onCancel();
      
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Send Failed",
        description: "Could not send voice message. Please try again.",
        variant: "destructive"
      });
    }
  }, [audioBlob, duration, audioMetadata, transcript, waveformData, onSend, deleteRecording, onCancel, toast]);

  const downloadRecording = useCallback(() => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-message-${Date.now()}.${audioFormats[selectedFormat as keyof typeof audioFormats].extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: "Voice message saved to downloads",
    });
  }, [audioBlob, selectedFormat, toast]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);

  // Component size variants
  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md', 
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-2xl'
  };

  const renderRecordingInterface = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {isPaused ? 'Recording Paused' : isRecording ? 'Recording in Progress' : 'Record Voice Message'}
        </h3>
        
        {/* Enhanced Recording Visualization */}
        <div className="relative">
          <div className={cn(
            "w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden",
            isRecording && !isPaused
              ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-4 border-red-500 animate-pulse shadow-lg shadow-red-500/25" 
              : isPaused
              ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-4 border-yellow-500 shadow-lg shadow-yellow-500/25"
              : "bg-gradient-to-r from-primary/20 to-primary/30 border-4 border-primary hover:scale-105 shadow-lg shadow-primary/25"
          )}>
            {/* Animated rings */}
            {isRecording && !isPaused && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping" />
                <div className="absolute inset-4 rounded-full border-2 border-red-500/30 animate-ping animation-delay-75" />
              </>
            )}
            
            <Button
              variant="ghost"
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="w-20 h-20 rounded-full p-0 relative z-10"
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <Square className="h-8 w-8 fill-current" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          {/* Device indicator */}
          <div className="absolute -top-2 -right-2">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {deviceType === 'builtin' && <Smartphone className="h-3 w-3 mr-1" />}
              {deviceType === 'headset' && <Headphones className="h-3 w-3 mr-1" />}
              {deviceType === 'external' && <Mic className="h-3 w-3 mr-1" />}
              {deviceType}
            </Badge>
          </div>
        </div>
        
        {/* Waveform Visualization */}
        {enableWaveformVisualization && (isRecording || waveformData.length > 0) && (
          <div className="relative bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4">
            <canvas
              ref={canvasRef}
              width={300}
              height={80}
              className="w-full h-20 rounded-lg"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                {noiseLevel > 200 ? 'High' : noiseLevel > 100 ? 'Medium' : 'Low'}
              </Badge>
            </div>
          </div>
        )}
        
        {/* Enhanced Timer and Controls */}
        <div className="space-y-3">
          <div className="text-3xl font-mono font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {formatDuration(duration)}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Progress 
              value={(duration / maxDuration) * 100} 
              className="w-32 h-2"
            />
            <span className="text-xs">
              / {formatDuration(maxDuration)}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {isProcessing ? 'Setting up recording...' :
             isRecording && !isPaused ? 'Recording... Tap to stop' :
             isPaused ? 'Paused - Tap to resume' : 'Tap to start recording'}
          </p>
          
          {/* Recording controls */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pauseRecording}
                className="h-8"
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPlaybackInterface = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Voice Message Ready</h3>
        
        {/* Enhanced Playback Controls */}
        <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => skipAudio(-10)}
                  className="rounded-full w-10 h-10 p-0"
                  disabled={!audioBlob}
                >
                  <Rewind className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="default"
                  size="lg"
                  onClick={playRecording}
                  className="rounded-full w-14 h-14 p-0 shadow-lg"
                  disabled={!audioBlob}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => skipAudio(10)}
                  className="rounded-full w-10 h-10 p-0"
                  disabled={!audioBlob}
                >
                  <FastForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress and Waveform */}
            <div className="space-y-3">
              <Progress 
                value={playProgress} 
                className="h-3 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = ((e.clientX - rect.left) / rect.width) * 100;
                  seekAudio(percent);
                }}
              />
              
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileAudio className="h-3 w-3" />
                  <span>Voice Message</span>
                  {audioMetadata && (
                    <Badge variant="outline" className="text-xs">
                      {audioMetadata.quality}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatDuration(duration)}</span>
                  {audioMetadata && (
                    <span>• {formatFileSize(audioMetadata.size)}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={(value) => {
                    setVolume(value[0]);
                    if (audioRef.current) {
                      audioRef.current.volume = value[0] / 100;
                    }
                  }}
                  max={100}
                  step={5}
                  className="w-20"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <Select 
                  value={playbackSpeed.toString()} 
                  onValueChange={(value) => {
                    const speed = parseFloat(value);
                    setPlaybackSpeed(speed);
                    if (audioRef.current) {
                      audioRef.current.playbackRate = speed;
                    }
                  }}
                >
                  <SelectTrigger className="w-20 h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5×</SelectItem>
                    <SelectItem value="0.75">0.75×</SelectItem>
                    <SelectItem value="1">1×</SelectItem>
                    <SelectItem value="1.25">1.25×</SelectItem>
                    <SelectItem value="1.5">1.5×</SelectItem>
                    <SelectItem value="2">2×</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Transcription */}
        {enableTranscription && (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Transcription
                </h4>
                {isProcessing && (
                  <Badge variant="secondary" className="text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transcript ? (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  "{transcript}"
                </div>
              ) : isProcessing ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Transcribing audio...
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Transcription will appear here
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Recording Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Quality Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Audio Quality</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality Preset</label>
                <Select value={recordingQuality} onValueChange={(value: any) => setRecordingQuality(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (64kbps)</SelectItem>
                    <SelectItem value="medium">Medium (128kbps)</SelectItem>
                    <SelectItem value="high">High (256kbps)</SelectItem>
                    <SelectItem value="lossless">Lossless (1411kbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(audioFormats).map(([key, format]) => (
                      <SelectItem key={key} value={key}>{format.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Audio Processing */}
          <div className="space-y-4">
            <h4 className="font-medium">Audio Processing</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Noise Reduction</label>
                <Switch 
                  checked={enableNoiseReduction} 
                  onCheckedChange={setEnableNoiseReduction} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Echo Cancellation</label>
                <Switch 
                  checked={enableEchoCancellation} 
                  onCheckedChange={setEnableEchoCancellation} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto Gain Control</label>
                <Switch 
                  checked={enableAutoGain} 
                  onCheckedChange={setEnableAutoGain} 
                />
              </div>
            </div>
            
            {!enableAutoGain && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Gain: {inputGain}%</label>
                <Slider
                  value={[inputGain]}
                  onValueChange={(value) => setInputGain(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          {/* Advanced Features */}
          <div className="space-y-4">
            <h4 className="font-medium">Features</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Waveform Visualization</label>
                  <p className="text-xs text-muted-foreground">Real-time audio visualization</p>
                </div>
                <Switch 
                  checked={enableWaveformVisualization} 
                  onCheckedChange={(checked) => {
                    // This would need to restart recording if changed during recording
                    if (!isRecording) {
                      // setEnableWaveformVisualization(checked);
                    }
                  }}
                  disabled={isRecording}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Audio Transcription</label>
                  <p className="text-xs text-muted-foreground">Convert speech to text</p>
                </div>
                <Switch 
                  checked={enableTranscription} 
                  onCheckedChange={(checked) => {
                    // setEnableTranscription(checked);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!isOpen) return null;

  const content = (
    <TooltipProvider>
      <div className={cn(
        "space-y-6",
        variant === 'modal' && "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        className
      )}>
        {variant === 'modal' && (
          <div className="flex items-center justify-center h-full p-4">
            <Card className={cn(sizeClasses[size])}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Voice Message</h2>
                  <div className="flex items-center gap-2">
                    {enableAdvancedControls && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvancedSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {!audioBlob ? renderRecordingInterface() : renderPlaybackInterface()}
                
                {/* Enhanced Action Buttons */}
                <div className="flex justify-center gap-3 mt-8">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  
                  {audioBlob && (
                    <>
                      <Button variant="outline" onClick={deleteRecording}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      
                      <Button variant="outline" onClick={downloadRecording}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      {isCompressing ? (
                        <Button variant="outline" disabled>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Compressing... {compressionProgress}%
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={compressAudio}>
                          <Scissors className="h-4 w-4 mr-2" />
                          Compress
                        </Button>
                      )}
                      
                      <Button onClick={sendRecording} disabled={isProcessing}>
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send
                      </Button>
                    </>
                  )}
                  
                  {!audioBlob && duration > 0 && (
                    <Button variant="outline" onClick={deleteRecording}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {renderAdvancedSettings()}
      </div>
    </TooltipProvider>
  );

  return content;
}

// Enhanced hook for voice message management
export function useVoiceMessage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Array<{ id: string; blob: Blob; metadata: AudioMetadata }>>([]);
  
  const startRecording = useCallback(() => {
    setIsRecording(true);
  }, []);
  
  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);
  
  const addRecording = useCallback((blob: Blob, metadata: AudioMetadata) => {
    const recording = {
      id: Date.now().toString(),
      blob,
      metadata
    };
    setRecordings(prev => [...prev, recording]);
    return recording.id;
  }, []);
  
  const removeRecording = useCallback((id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  }, []);
  
  return {
    isRecording,
    recordings,
    startRecording,
    stopRecording,
    addRecording,
    removeRecording
  };
}
