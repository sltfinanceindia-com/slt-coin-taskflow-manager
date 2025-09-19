import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Paperclip, 
  Image, 
  File, 
  Camera, 
  Smile, 
  Gift,
  Calendar,
  MapPin,
  BarChart3,
  Code,
  Quote,
  Bold,
  Italic,
  Underline,
  Link2,
  AtSign,
  Hash,
  Zap,
  Mic,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AdvancedFeaturesProps {
  onFileUpload: (file: File, type: 'image' | 'file' | 'audio') => void;
  onEmojiSelect: (emoji: string) => void;
  onMentionUser: (userId: string) => void;
  disabled?: boolean;
}

interface VoiceRecording {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
}

const quickEmojis = ['👍', '❤️', '😊', '😂', '😢', '😡', '👏', '🎉', '🔥', '💯'];

const textFormatting = [
  { icon: Bold, action: 'bold', shortcut: 'Ctrl+B' },
  { icon: Italic, action: 'italic', shortcut: 'Ctrl+I' },
  { icon: Underline, action: 'underline', shortcut: 'Ctrl+U' },
  { icon: Link2, action: 'link', shortcut: 'Ctrl+K' },
  { icon: Code, action: 'code', shortcut: 'Ctrl+`' },
  { icon: Quote, action: 'quote', shortcut: 'Ctrl+Shift+.' }
];

export function AdvancedFeatures({ 
  onFileUpload, 
  onEmojiSelect, 
  onMentionUser,
  disabled = false 
}: AdvancedFeaturesProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    isPaused: false,
    duration: 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      if (type === 'image' && !file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      onFileUpload(file, type);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setVoiceRecording(prev => ({ ...prev, audioBlob }));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setVoiceRecording({ isRecording: true, isPaused: false, duration: 0 });

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setVoiceRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && voiceRecording.isRecording) {
      mediaRecorderRef.current.stop();
      setVoiceRecording(prev => ({ ...prev, isRecording: false }));
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const pauseVoiceRecording = () => {
    if (mediaRecorderRef.current && voiceRecording.isRecording) {
      if (voiceRecording.isPaused) {
        mediaRecorderRef.current.resume();
        setVoiceRecording(prev => ({ ...prev, isPaused: false }));
      } else {
        mediaRecorderRef.current.pause();
        setVoiceRecording(prev => ({ ...prev, isPaused: true }));
      }
    }
  };

  const sendVoiceRecording = () => {
    if (voiceRecording.audioBlob) {
      const file = voiceRecording.audioBlob as File;
      onFileUpload(file, 'audio');
      setVoiceRecording({ isRecording: false, isPaused: false, duration: 0 });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Voice Recording UI */}
      {voiceRecording.isRecording && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTime(voiceRecording.duration)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={pauseVoiceRecording}
                  disabled={disabled}
                >
                  {voiceRecording.isPaused ? 
                    <Play className="h-4 w-4" /> : 
                    <Pause className="h-4 w-4" />
                  }
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={stopVoiceRecording}
                  disabled={disabled}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recorded Audio Preview */}
      {voiceRecording.audioBlob && !voiceRecording.isRecording && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mic className="h-4 w-4 text-green-600" />
                <span className="text-sm">Voice message ready</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(voiceRecording.duration)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVoiceRecording({ isRecording: false, isPaused: false, duration: 0 })}
                  disabled={disabled}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={sendVoiceRecording}
                  disabled={disabled}
                >
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Feature Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* File Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Image Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Image className="h-4 w-4" />
        </Button>

        {/* Voice Recording */}
        <Button
          variant="ghost"
          size="sm"
          onClick={startVoiceRecording}
          disabled={disabled || voiceRecording.isRecording}
          className="h-8 w-8 p-0"
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* Emojis */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojis(!showEmojis)}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          {showEmojis && (
            <Card className="absolute bottom-full left-0 mb-2 p-3 z-50 shadow-lg">
              <div className="grid grid-cols-5 gap-2">
                {quickEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg"
                    onClick={() => {
                      onEmojiSelect(emoji);
                      setShowEmojis(false);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Text Formatting */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFormatting(!showFormatting)}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          {showFormatting && (
            <Card className="absolute bottom-full left-0 mb-2 p-2 z-50 shadow-lg min-w-48">
              <div className="space-y-1">
                {textFormatting.map((format, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                    onClick={() => setShowFormatting(false)}
                  >
                    <format.icon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{format.action}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format.shortcut}
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Schedule meeting"
        >
          <Calendar className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Share location"
        >
          <MapPin className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Create poll"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Share gif"
        >
          <Gift className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'file')}
        accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'image')}
        accept="image/*"
      />
    </div>
  );
}