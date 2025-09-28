import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Send, 
  Trash2,
  X,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onVoiceRecorded: (audioBlob: Blob) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceRecorder({ onVoiceRecorded, isOpen, onClose }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Monitor audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 128) * 100));
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const sendRecording = () => {
    if (audioBlob) {
      onVoiceRecorded(audioBlob);
      deleteRecording();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-12 left-0 z-50">
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Voice Message</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Recording Controls */}
            {!audioBlob ? (
              <div className="space-y-4">
                {/* Audio Level Indicator */}
                {isRecording && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Progress value={audioLevel} className="flex-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold">
                        {formatTime(recordingTime)}
                      </div>
                      {isPaused && (
                        <div className="text-sm text-muted-foreground">Paused</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recording Buttons */}
                <div className="flex items-center justify-center gap-2">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording}
                      className="h-12 w-12 rounded-full"
                      variant="destructive"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        className="h-10 w-10 rounded-full"
                      >
                        {isPaused ? <Mic className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={stopRecording}
                        variant="destructive"
                        className="h-12 w-12 rounded-full"
                      >
                        <Square className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>

                {!isRecording && recordingTime === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Tap the microphone to start recording
                  </p>
                )}
              </div>
            ) : (
              /* Playback Controls */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-medium">Recording Ready</div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {formatTime(recordingTime)}
                  </div>
                </div>

                {/* Audio Player */}
                <audio
                  ref={audioRef}
                  src={audioUrl || undefined}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={playRecording}
                    variant="outline"
                    className="h-10 w-10 rounded-full"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={deleteRecording}
                    variant="outline"
                    className="h-10 w-10 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={sendRecording}
                    variant="default"
                    className="h-10 w-10 rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}