import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Send,
  Trash2,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function VoiceMessage({ onSend, onCancel, isOpen }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 0.1);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        setPlayProgress(0);
      };
      
      audio.ontimeupdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setPlayProgress(progress);
      };
      
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioBlob(null);
    setIsPlaying(false);
    setPlayProgress(0);
    setDuration(0);
  };

  const sendRecording = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      deleteRecording();
      onCancel();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-6">
            <h3 className="text-lg font-semibold">
              {audioBlob ? 'Voice Message Recorded' : 'Record Voice Message'}
            </h3>
            
            {!audioBlob ? (
              // Recording interface
              <div className="space-y-4">
                <div className="relative">
                  <div className={cn(
                    "w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
                    isRecording 
                      ? "bg-destructive/20 border-4 border-destructive animate-pulse" 
                      : "bg-primary/20 border-4 border-primary hover:scale-105"
                  )}>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={isRecording ? stopRecording : startRecording}
                      className="w-20 h-20 rounded-full p-0"
                    >
                      {isRecording ? (
                        <Square className="h-8 w-8" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </Button>
                  </div>
                  
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-destructive animate-ping opacity-75" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-mono">
                    {formatDuration(duration)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
                  </p>
                </div>
              </div>
            ) : (
              // Playback interface
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={playRecording}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1 space-y-1">
                    <Progress value={playProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Voice Message</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                  </div>
                  
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              
              {audioBlob && (
                <>
                  <Button variant="outline" onClick={deleteRecording}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  
                  <Button onClick={sendRecording}>
                    <Send className="h-4 w-4 mr-2" />
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
          </div>
        </Card>
      </div>
    </div>
  );
}