import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Square,
  Send,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  FileText,
  FileImage,
  FileVideo,
  Music,
  Archive,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  MoreHorizontal,
  Sparkles,
  Brain,
  MessageCircle,
  Users,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AdvancedFeaturesProps {
  onFileUpload: (file: File, type: 'image' | 'file' | 'audio' | 'video') => void;
  onEmojiSelect: (emoji: string) => void;
  onMentionUser: (userId: string) => void;
  onScheduleMessage?: (date: Date) => void;
  onCreatePoll?: (poll: PollData) => void;
  disabled?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  showAIAssistant?: boolean;
  teamMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

interface VoiceRecording {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
  isUploading?: boolean;
  quality: 'low' | 'medium' | 'high';
}

interface FileUploadProgress {
  [key: string]: {
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
  };
}

interface PollData {
  question: string;
  options: string[];
  allowMultiple: boolean;
  anonymous: boolean;
}

// Enhanced emoji categories with more variety
const emojiCategories = {
  recent: ['👍', '❤️', '😊', '😂', '🔥', '💯', '👏', '🎉'],
  people: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘'],
  nature: ['🌿', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🎋', '🎍', '🌸', '🌺', '🌻', '🌷'],
  objects: ['📱', '💻', '⌚', '📷', '🎮', '🕹️', '🎸', '🎹', '🎤', '🎧', '📻', '📺', '🔊', '🔇', '🔉', '🔈'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖']
};

const textFormatting = [
  { icon: Bold, action: 'bold', shortcut: 'Ctrl+B', label: 'Bold' },
  { icon: Italic, action: 'italic', shortcut: 'Ctrl+I', label: 'Italic' },
  { icon: Underline, action: 'underline', shortcut: 'Ctrl+U', label: 'Underline' },
  { icon: Link2, action: 'link', shortcut: 'Ctrl+K', label: 'Add Link' },
  { icon: Code, action: 'code', shortcut: 'Ctrl+`', label: 'Code Block' },
  { icon: Quote, action: 'quote', shortcut: 'Ctrl+Shift+.', label: 'Quote' },
  { icon: AtSign, action: 'mention', shortcut: '@', label: 'Mention' },
  { icon: Hash, action: 'hashtag', shortcut: '#', label: 'Hashtag' }
];

const quickActions = [
  { icon: Calendar, action: 'schedule', label: 'Schedule Message', shortcut: 'Ctrl+Shift+S' },
  { icon: MapPin, action: 'location', label: 'Share Location', shortcut: 'Ctrl+L' },
  { icon: BarChart3, action: 'poll', label: 'Create Poll', shortcut: 'Ctrl+P' },
  { icon: Gift, action: 'gif', label: 'Add GIF', shortcut: 'Ctrl+G' },
  { icon: Users, action: 'group', label: 'Group Actions', shortcut: 'Ctrl+Shift+G' },
  { icon: Brain, action: 'ai', label: 'AI Assistant', shortcut: 'Ctrl+Shift+A' }
];

export function AdvancedFeatures({ 
  onFileUpload, 
  onEmojiSelect, 
  onMentionUser,
  onScheduleMessage,
  onCreatePoll,
  disabled = false,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  allowedFileTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt', '.xlsx', '.ppt', '.pptx'],
  showAIAssistant = true,
  teamMembers = []
}: AdvancedFeaturesProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [emojiCategory, setEmojiCategory] = useState('recent');
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    quality: 'medium'
  });
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({});
  const [isDragging, setIsDragging] = useState(false);
  const [recentFiles, setRecentFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const dragCounterRef = useRef(0);

  // Enhanced file validation
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (file.size > maxFileSize) {
      return { 
        valid: false, 
        error: `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit` 
      };
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isAllowed = allowedFileTypes.some(type => {
      if (type.includes('*')) {
        return mimeType.startsWith(type.split('*')[0]);
      }
      return type === fileExtension || type === mimeType;
    });

    if (!isAllowed) {
      return { 
        valid: false, 
        error: 'File type not supported' 
      };
    }

    return { valid: true };
  }, [maxFileSize, allowedFileTypes]);

  // Enhanced file upload with progress tracking
  const handleFileUpload = useCallback(async (files: FileList | File[], type?: 'image' | 'file' | 'video') => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast({
          title: "File Upload Error",
          description: validation.error,
          variant: "destructive"
        });
        continue;
      }

      // Determine file type if not specified
      let fileType: 'image' | 'file' | 'audio' | 'video' = type || 'file';
      if (!type) {
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('video/')) fileType = 'video';
        else if (file.type.startsWith('audio/')) fileType = 'audio';
      }

      const uploadId = `${file.name}-${Date.now()}`;
      
      // Add to progress tracking
      setUploadProgress(prev => ({
        ...prev,
        [uploadId]: { file, progress: 0, status: 'uploading' }
      }));

      // Simulate upload progress (replace with actual upload logic)
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[uploadId];
          if (!current || current.progress >= 100) {
            clearInterval(uploadInterval);
            return prev;
          }
          
          const newProgress = Math.min(current.progress + Math.random() * 20, 100);
          const newStatus = newProgress === 100 ? 'completed' : 'uploading';
          
          return {
            ...prev,
            [uploadId]: { ...current, progress: newProgress, status: newStatus }
          };
        });
      }, 200);

      // Add to recent files
      setRecentFiles(prev => [file, ...prev.slice(0, 4)]);
      
      // Call the upload callback
      onFileUpload(file, fileType);
    }
  }, [validateFile, onFileUpload]);

  // Enhanced voice recording with quality options
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: voiceRecording.quality === 'high' ? 48000 : 
                     voiceRecording.quality === 'medium' ? 22050 : 8000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setVoiceRecording(prev => ({ ...prev, audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setVoiceRecording(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false, 
        duration: 0 
      }));
      
      // Start timer with better precision
      recordingTimerRef.current = setInterval(() => {
        setVoiceRecording(prev => ({ ...prev, duration: prev.duration + 0.1 }));
      }, 100);
      
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [voiceRecording.quality]);

  // Enhanced drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounterRef.current = 0;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && voiceRecording.isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [voiceRecording.isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (type.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "space-y-3 transition-all duration-200",
          isDragging && "bg-primary/5 border-2 border-dashed border-primary rounded-lg p-4"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto text-primary mb-2" />
              <p className="text-lg font-medium">Drop files here to upload</p>
              <p className="text-sm text-muted-foreground">
                Supports images, videos, documents and more
              </p>
            </div>
          </div>
        )}

        {/* File Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(uploadProgress).map(([id, upload]) => (
                <div key={id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 min-w-0">
                      {getFileIcon(upload.file)}
                      <span className="truncate font-medium">{upload.file.name}</span>
                      {upload.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(upload.progress)}%
                    </span>
                  </div>
                  <Progress value={upload.progress} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Voice Recording UI */}
        {voiceRecording.isRecording && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      {voiceRecording.isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {voiceRecording.quality.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatTime(voiceRecording.duration)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (mediaRecorderRef.current) {
                            if (voiceRecording.isPaused) {
                              mediaRecorderRef.current.resume();
                            } else {
                              mediaRecorderRef.current.pause();
                            }
                            setVoiceRecording(prev => ({ 
                              ...prev, 
                              isPaused: !prev.isPaused 
                            }));
                          }
                        }}
                        disabled={disabled}
                      >
                        {voiceRecording.isPaused ? 
                          <Play className="h-4 w-4" /> : 
                          <Pause className="h-4 w-4" />
                        }
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {voiceRecording.isPaused ? 'Resume' : 'Pause'}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (mediaRecorderRef.current) {
                            mediaRecorderRef.current.stop();
                          }
                          if (recordingTimerRef.current) {
                            clearInterval(recordingTimerRef.current);
                          }
                          setVoiceRecording({
                            isRecording: false,
                            isPaused: false,
                            duration: 0,
                            quality: 'medium'
                          });
                        }}
                        disabled={disabled}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stop Recording</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Recorded Audio Preview */}
        {voiceRecording.audioBlob && !voiceRecording.isRecording && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Mic className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Voice message ready</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(voiceRecording.duration)} • {voiceRecording.quality} quality
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Play preview (implement audio playback)
                          const audio = new Audio(URL.createObjectURL(voiceRecording.audioBlob!));
                          audio.play();
                        }}
                        disabled={disabled}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview</TooltipContent>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVoiceRecording({ 
                      isRecording: false, 
                      isPaused: false, 
                      duration: 0,
                      quality: 'medium'
                    })}
                    disabled={disabled}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (voiceRecording.audioBlob) {
                        const file = new File([voiceRecording.audioBlob], 
                          `voice-${Date.now()}.webm`, 
                          { type: 'audio/webm' });
                        onFileUpload(file, 'audio');
                        setVoiceRecording({ 
                          isRecording: false, 
                          isPaused: false, 
                          duration: 0,
                          quality: 'medium'
                        });
                      }
                    }}
                    disabled={disabled}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Feature Panel */}
        <div className="flex flex-wrap items-center gap-1">
          {/* File Upload Actions */}
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="h-9 w-9 p-0 hover:bg-primary/10"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach File</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={disabled}
                  className="h-9 w-9 p-0 hover:bg-green-500/10"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Image</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={disabled}
                  className="h-9 w-9 p-0 hover:bg-blue-500/10"
                >
                  <FileVideo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Video</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Voice Recording with Quality Selector */}
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startVoiceRecording}
                  disabled={disabled || voiceRecording.isRecording}
                  className={cn(
                    "h-9 w-9 p-0 hover:bg-red-500/10",
                    voiceRecording.isRecording && "bg-red-500/20"
                  )}
                >
                  <Mic className={cn(
                    "h-4 w-4",
                    voiceRecording.isRecording && "text-red-500 animate-pulse"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Message</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Enhanced Emoji Picker */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePanel('emojis')}
                  disabled={disabled}
                  className={cn(
                    "h-9 w-9 p-0 hover:bg-yellow-500/10",
                    activePanel === 'emojis' && "bg-yellow-500/20"
                  )}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emojis</TooltipContent>
            </Tooltip>
            
            {activePanel === 'emojis' && (
              <Card className="absolute bottom-full left-0 mb-2 p-0 z-50 shadow-xl border-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Emojis</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Emoji Categories */}
                  <div className="flex items-center space-x-1">
                    {Object.keys(emojiCategories).map((category) => (
                      <Button
                        key={category}
                        variant={emojiCategory === category ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2 text-xs capitalize"
                        onClick={() => setEmojiCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-32 w-64">
                    <div className="grid grid-cols-8 gap-1">
                      {emojiCategories[emojiCategory as keyof typeof emojiCategories].map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-lg hover:bg-primary/10"
                          onClick={() => {
                            onEmojiSelect(emoji);
                            setActivePanel(null);
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Text Formatting */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePanel('formatting')}
                  disabled={disabled}
                  className={cn(
                    "h-9 w-9 p-0 hover:bg-purple-500/10",
                    activePanel === 'formatting' && "bg-purple-500/20"
                  )}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Text Formatting</TooltipContent>
            </Tooltip>
            
            {activePanel === 'formatting' && (
              <Card className="absolute bottom-full left-0 mb-2 p-0 z-50 shadow-xl min-w-56">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Formatting</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  {textFormatting.map((format, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 px-3"
                      onClick={() => setActivePanel(null)}
                    >
                      <format.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm flex-1 text-left">{format.label}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {format.shortcut}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Enhanced Quick Actions */}
          <div className="flex items-center space-x-1">
            {quickActions.slice(0, 4).map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    onClick={() => {
                      if (action.action === 'schedule' && onScheduleMessage) {
                        // Open schedule modal
                      } else if (action.action === 'poll' && onCreatePoll) {
                        // Open poll creator
                      }
                    }}
                  >
                    <action.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {action.label} • {action.shortcut}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* More Actions */}
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePanel('more')}
                    disabled={disabled}
                    className={cn(
                      "h-9 w-9 p-0",
                      activePanel === 'more' && "bg-accent"
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More Actions</TooltipContent>
              </Tooltip>

              {activePanel === 'more' && (
                <Card className="absolute bottom-full right-0 mb-2 p-0 z-50 shadow-xl min-w-48">
                  <CardContent className="p-2 space-y-1">
                    {quickActions.slice(4).map((action, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-9 px-3"
                        onClick={() => setActivePanel(null)}
                      >
                        <action.icon className="h-4 w-4 mr-3" />
                        <span className="text-sm flex-1 text-left">{action.label}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Recent Files Quick Access */}
        {recentFiles.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Recent:</span>
            {recentFiles.slice(0, 3).map((file, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleFileUpload([file])}
                  >
                    {getFileIcon(file)}
                    <span className="ml-1 text-xs truncate max-w-16">
                      {file.name}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{file.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Enhanced Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          accept={allowedFileTypes.join(',')}
          multiple
        />
        
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
          accept="image/*"
          multiple
        />

        <input
          ref={videoInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')}
          accept="video/*"
          multiple
        />
      </div>
    </TooltipProvider>
  );
}
