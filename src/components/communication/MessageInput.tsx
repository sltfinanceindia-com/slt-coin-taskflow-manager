import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Smile, 
  AtSign,
  Bold,
  Italic,
  List,
  Link,
  Pin,
  Star,
  Image,
  File,
  Mic,
  MicOff,
  Video,
  Calendar,
  X,
  Plus,
  Code,
  Quote,
  Strikethrough,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Zap,
  Clock,
  CheckSquare,
  Hash,
  Archive,
  AlertCircle,
  Info,
  MessageSquare,
  Users,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  Settings,
  Sparkles,
  Brain,
  Languages,
  VolumeX,
  Volume2,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  PenTool,
  Layers,
  Filter,
  Command,
  Keyboard,
  Mouse,
  Smartphone,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Mention {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  email?: string;
  isOnline?: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  memberCount?: number;
}

interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'idle' | 'uploading' | 'completed' | 'error';
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'follow-up' | 'meeting' | 'custom';
}

interface Draft {
  id: string;
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (options?: { 
    isPinned?: boolean; 
    isStarred?: boolean; 
    isUrgent?: boolean;
    scheduledTime?: Date;
    aiEnhanced?: boolean;
  }) => void;
  onFileAttach?: (file: File) => Promise<void>;
  onVoiceRecord?: (audioBlob: Blob, duration: number) => Promise<void>;
  mentions?: Mention[];
  channels?: Channel[];
  disabled?: boolean;
  placeholder?: string;
  replyTo?: { id: string; content: string; sender: string; avatar?: string };
  onCancelReply?: () => void;
  typing?: boolean;
  onTypingChange?: (typing: boolean) => void;
  maxLength?: number;
  enableRichText?: boolean;
  enableVoiceInput?: boolean;
  enableAI?: boolean;
  enableScheduling?: boolean;
  enableTemplates?: boolean;
  enableDrafts?: boolean;
  enableTranslation?: boolean;
  supportedLanguages?: { code: string; name: string }[];
  aiSuggestions?: string[];
  onRequestAISuggestion?: (prompt: string) => Promise<string>;
  autoSaveInterval?: number;
  className?: string;
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  onFileAttach, 
  onVoiceRecord,
  mentions = [],
  channels = [],
  disabled = false,
  placeholder = "Type a message... Use @ to mention, # for channels, / for commands",
  replyTo,
  onCancelReply,
  typing = false,
  onTypingChange,
  maxLength = 4000,
  enableRichText = true,
  enableVoiceInput = true,
  enableAI = true,
  enableScheduling = true,
  enableTemplates = true,
  enableDrafts = true,
  enableTranslation = false,
  supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
  ],
  aiSuggestions = [],
  onRequestAISuggestion,
  autoSaveInterval = 5000,
  className
}: MessageInputProps) {
  // UI State
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Message State
  const [isPinned, setIsPinned] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [aiEnhanced, setAiEnhanced] = useState(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingPaused, setRecordingPaused] = useState(false);

  // File and Rich Content State
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    quote: false
  });

  // Advanced Features State
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [templates, setTemplates] = useState<Template[]>([
    { id: '1', name: 'Meeting Reminder', content: 'Hi! Don\'t forget about our meeting at {time}. Looking forward to it!', category: 'meeting' },
    { id: '2', name: 'Follow Up', content: 'Thanks for the great discussion today. Here are the key points we covered...', category: 'follow-up' },
    { id: '3', name: 'Quick Hello', content: 'Hey there! Hope you\'re having a great day! 👋', category: 'greeting' }
  ]);
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder>();
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<NodeJS.Timeout>();

  const { toast } = useToast();

  // Enhanced word and character counting
  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = value.length;
    setWordCount(words);
    setCharacterCount(characters);
  }, [value]);

  // Auto-resize textarea with smooth animation
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isExpanded ? 200 : 120;
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, isExpanded]);

  // Enhanced typing indicator with debounce
  const handleTyping = useCallback(() => {
    if (!typing && onTypingChange) {
      onTypingChange(true);
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingChange) {
        onTypingChange(false);
      }
    }, 1500);
  }, [typing, onTypingChange]);

  // Auto-save drafts
  useEffect(() => {
    if (!enableDrafts) return;
    
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (value.trim()) {
        const draft: Draft = {
          id: Date.now().toString(),
          content: value,
          timestamp: new Date(),
          attachments: attachedFiles
        };
        setDrafts(prev => [draft, ...prev.slice(0, 4)]);
      }
    }, autoSaveInterval);

    return () => clearTimeout(autoSaveRef.current);
  }, [value, attachedFiles, enableDrafts, autoSaveInterval]);

  // Enhanced mention and channel detection
  const mentionQuery = useMemo(() => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    
    if (lastAtIndex > lastHashIndex && lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      return { type: 'mention' as const, query, startIndex: lastAtIndex };
    } else if (lastHashIndex > lastAtIndex && lastHashIndex !== -1) {
      const query = textBeforeCursor.substring(lastHashIndex + 1);
      return { type: 'channel' as const, query, startIndex: lastHashIndex };
    }
    
    return null;
  }, [value]);

  // Filter mentions and channels based on query
  const filteredMentions = useMemo(() => {
    if (!mentionQuery || mentionQuery.type !== 'mention') return [];
    return mentions.filter(mention => 
      mention.name.toLowerCase().includes(mentionQuery.query.toLowerCase()) ||
      mention.email?.toLowerCase().includes(mentionQuery.query.toLowerCase())
    ).slice(0, 8);
  }, [mentions, mentionQuery]);

  const filteredChannels = useMemo(() => {
    if (!mentionQuery || mentionQuery.type !== 'channel') return [];
    return channels.filter(channel => 
      channel.name.toLowerCase().includes(mentionQuery.query.toLowerCase())
    ).slice(0, 8);
  }, [channels, mentionQuery]);

  // Enhanced emoji handling
  const handleEmojiClick = useCallback((emojiData: any) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + emojiData.emoji + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmoji(false);
  }, [value, onChange]);

  // Advanced file handling with preview generation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      const fileAttachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        file,
        uploadStatus: 'idle'
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileAttachment.id 
              ? { ...f, preview: e.target?.result as string }
              : f
          ));
        };
        reader.readAsDataURL(file);
      }

      setAttachedFiles(prev => [...prev, fileAttachment]);
      
      if (onFileAttach) {
        try {
          fileAttachment.uploadStatus = 'uploading';
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileAttachment.id ? { ...f, uploadStatus: 'uploading' } : f
          ));
          
          await onFileAttach(file);
          
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileAttachment.id ? { ...f, uploadStatus: 'completed' } : f
          ));
        } catch (error) {
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileAttachment.id ? { ...f, uploadStatus: 'error' } : f
          ));
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
        }
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAttachments(false);
  };

  // Enhanced voice recording with audio visualization
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        if (onVoiceRecord) {
          await onVoiceRecord(audioBlob, recordingDuration);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      
      const updateAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(average / 255 * 100);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      updateAudioLevel();
      
      // Recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingPaused(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (recordingPaused) {
        mediaRecorderRef.current.resume();
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(recordingTimerRef.current);
      }
      setRecordingPaused(!recordingPaused);
    }
  };

  // Rich text formatting
  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    const formatMap: { [key: string]: { prefix: string; suffix: string; placeholder: string } } = {
      bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
      italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
      strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough text' },
      underline: { prefix: '__', suffix: '__', placeholder: 'underline text' },
      code: { prefix: '`', suffix: '`', placeholder: 'code' },
      quote: { prefix: '> ', suffix: '', placeholder: 'quote' },
      list: { prefix: '\n• ', suffix: '', placeholder: 'list item' },
      numbered: { prefix: '\n1. ', suffix: '', placeholder: 'numbered item' },
      heading1: { prefix: '# ', suffix: '', placeholder: 'Heading 1' },
      heading2: { prefix: '## ', suffix: '', placeholder: 'Heading 2' },
      heading3: { prefix: '### ', suffix: '', placeholder: 'Heading 3' },
      link: { prefix: '[', suffix: '](url)', placeholder: 'link text' }
    };
    
    const formatConfig = formatMap[format];
    if (formatConfig) {
      const text = selectedText || formatConfig.placeholder;
      newText = value.substring(0, start) + formatConfig.prefix + text + formatConfig.suffix + value.substring(end);
      cursorOffset = selectedText ? 
        start + formatConfig.prefix.length + text.length + formatConfig.suffix.length : 
        start + formatConfig.prefix.length;
    }
    
    onChange(newText);
    setShowFormatting(false);
    
    setTimeout(() => {
      textarea.setSelectionRange(cursorOffset, cursorOffset);
      textarea.focus();
    }, 0);
  };

  // AI Enhancement
  const enhanceWithAI = async () => {
    if (!onRequestAISuggestion || !value.trim()) return;
    
    setIsProcessingAI(true);
    try {
      const enhanced = await onRequestAISuggestion(value);
      onChange(enhanced);
      setAiEnhanced(true);
      toast({
        title: "Message Enhanced",
        description: "Your message has been improved with AI",
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Could not enhance message",
        variant: "destructive"
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Template insertion
  const insertTemplate = (template: Template) => {
    const processedContent = template.content.replace('{time}', format(new Date(), 'HH:mm'));
    onChange(processedContent);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  // Mention/Channel selection
  const selectMention = (mention: Mention) => {
    if (!mentionQuery) return;
    
    const newValue = 
      value.substring(0, mentionQuery.startIndex) + 
      `@${mention.name} ` + 
      value.substring(mentionQuery.startIndex + mentionQuery.query.length + 1);
    
    onChange(newValue);
    setShowMentions(false);
    
    const newCursorPos = mentionQuery.startIndex + mention.name.length + 2;
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.current?.focus();
    }, 0);
  };

  const selectChannel = (channel: Channel) => {
    if (!mentionQuery) return;
    
    const newValue = 
      value.substring(0, mentionQuery.startIndex) + 
      `#${channel.name} ` + 
      value.substring(mentionQuery.startIndex + mentionQuery.query.length + 1);
    
    onChange(newValue);
    setShowChannels(false);
    
    const newCursorPos = mentionQuery.startIndex + channel.name.length + 2;
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.current?.focus();
    }, 0);
  };

  // Enhanced keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleTyping();

    // Send message
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (!showMentions && !showChannels) {
        handleSend();
      }
    }
    
    // Quick formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          insertFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          insertFormatting('underline');
          break;
        case 'k':
          e.preventDefault();
          insertFormatting('link');
          break;
        case 'Enter':
          e.preventDefault();
          handleSend();
          break;
      }
    }
    
    // Show mentions/channels
    if (e.key === '@') {
      setTimeout(() => setShowMentions(true), 0);
    } else if (e.key === '#') {
      setTimeout(() => setShowChannels(true), 0);
    }
    
    // Hide popovers
    if (e.key === 'Escape') {
      setShowMentions(false);
      setShowChannels(false);
      setShowEmoji(false);
      setShowFormatting(false);
      setShowAttachments(false);
      setShowTemplates(false);
      setShowAI(false);
      if (onCancelReply) onCancelReply();
    }
  };

  const handleSend = () => {
    if ((value.trim() || attachedFiles.length > 0) && !disabled) {
      const options = {
        isPinned,
        isStarred,
        isUrgent,
        scheduledTime,
        aiEnhanced
      };
      
      onSend(options);
      
      // Reset states
      setAttachedFiles([]);
      setIsPinned(false);
      setIsStarred(false);
      setIsUrgent(false);
      setScheduledTime(null);
      setAiEnhanced(false);
      setIsPrivate(false);
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = (characterCount / maxLength) * 100;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <TooltipProvider>
      <div className={cn(
        "border-t bg-gradient-to-r from-background/95 to-muted/30 backdrop-blur-lg transition-all duration-300",
        className
      )}>
        {/* Reply Banner */}
        {replyTo && (
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {replyTo.avatar && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={replyTo.avatar} />
                  <AvatarFallback>{replyTo.sender.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-1">
                  Replying to <span className="font-medium text-primary">{replyTo.sender}</span>
                </div>
                <div className="text-sm truncate bg-background/60 px-3 py-2 rounded-lg border-l-2 border-primary shadow-sm">
                  {replyTo.content}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="ml-2 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="px-4 py-3 bg-muted/20 border-b">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((fileAttachment) => (
                <div 
                  key={fileAttachment.id} 
                  className="relative group flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {fileAttachment.preview ? (
                    <img 
                      src={fileAttachment.preview} 
                      alt={fileAttachment.file.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <File className="h-4 w-4 text-primary" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate max-w-32">
                      {fileAttachment.file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(fileAttachment.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>

                  {fileAttachment.uploadStatus === 'uploading' && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachedFile(fileAttachment.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Recording UI */}
        {isRecording && (
          <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                </div>
                <span className="text-sm font-medium">Recording... {formatDuration(recordingDuration)}</span>
                
                {/* Audio level visualization */}
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pauseRecording}
                  className="h-8 hover:bg-orange-500/10 hover:text-orange-600"
                >
                  {recordingPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopRecording}
                  className="h-8 hover:bg-green-500/10 hover:text-green-600"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Enhanced Toolbar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
            <div className="flex items-center gap-1">
              {/* Rich Text Formatting */}
              {enableRichText && (
                <Popover open={showFormatting} onOpenChange={setShowFormatting}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 hover:bg-primary/10">
                      <Type className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" side="top" align="start">
                    <Tabs defaultValue="basic" className="w-80">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                        <TabsTrigger value="style">Style</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-2">
                        <div className="grid grid-cols-4 gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')} className="h-8">
                                <Bold className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Bold (Ctrl+B)</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')} className="h-8">
                                <Italic className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Italic (Ctrl+I)</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('underline')} className="h-8">
                                <Underline className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Underline (Ctrl+U)</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('strikethrough')} className="h-8">
                                <Strikethrough className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Strikethrough</TooltipContent>
                          </Tooltip>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="structure" className="space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          <Button variant="ghost" size="sm" onClick={() => insertFormatting('heading1')} className="justify-start">
                            <span className="font-bold">H1</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => insertFormatting('heading2')} className="justify-start">
                            <span className="font-bold">H2</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => insertFormatting('list')} className="justify-start">
                            <List className="h-4 w-4 mr-2" />
                            List
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => insertFormatting('quote')} className="justify-start">
                            <Quote className="h-4 w-4 mr-2" />
                            Quote
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="style" className="space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          <Button variant="ghost" size="sm" onClick={() => insertFormatting('code')} className="justify-start">
                            <Code className="h-4 w-4 mr-2" />
                            Code
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => insertFormatting('link')} className="justify-start">
                            <Link className="h-4 w-4 mr-2" />
                            Link
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </PopoverContent>
                </Popover>
              )}

              <Separator orientation="vertical" className="h-4" />

              {/* Message Options */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPinned(!isPinned)}
                    className={cn("h-8 transition-all duration-200", isPinned && "text-blue-600 bg-blue-500/10")}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pin message</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsStarred(!isStarred)}
                    className={cn("h-8 transition-all duration-200", isStarred && "text-yellow-600 bg-yellow-500/10")}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as important</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUrgent(!isUrgent)}
                    className={cn("h-8 transition-all duration-200", isUrgent && "text-red-600 bg-red-500/10")}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as urgent</TooltipContent>
              </Tooltip>

              {enableScheduling && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowScheduler(!showScheduler)}
                      className={cn("h-8 transition-all duration-200", scheduledTime && "text-purple-600 bg-purple-500/10")}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Schedule message</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Character count with progress */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted-foreground/20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(
                        "transition-all duration-300",
                        isOverLimit ? "text-red-500" : isNearLimit ? "text-yellow-500" : "text-primary"
                      )}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${Math.min(progressValue, 100)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>{characterCount}/{maxLength}</div>
                  <div>{wordCount} words</div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex gap-3 items-end relative">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    onChange(e.target.value);
                    handleTyping();
                  }
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  "min-h-[44px] resize-none pr-24 transition-all duration-200",
                  "bg-gradient-to-r from-background/60 to-muted/20 backdrop-blur-sm",
                  "border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                  isExpanded ? "max-h-[200px]" : "max-h-[120px]",
                  isOverLimit && "border-red-500 focus:border-red-500"
                )}
                disabled={disabled}
              />

              {/* Enhanced Mentions Dropdown */}
              {showMentions && filteredMentions.length > 0 && (
                <Card className="absolute bottom-full left-0 right-0 mb-2 shadow-lg border-primary/20 z-50 backdrop-blur-md bg-background/90">
                  <CardContent className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                      People
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredMentions.map((mention) => (
                        <button
                          key={mention.id}
                          className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-lg flex items-center gap-3 transition-all duration-200 group"
                          onClick={() => selectMention(mention)}
                        >
                          <div className="relative">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={mention.avatar} />
                              <AvatarFallback className="text-xs">
                                {mention.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {mention.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium group-hover:text-primary transition-colors">
                              {mention.name}
                            </div>
                            {mention.role && (
                              <div className="text-xs text-muted-foreground">
                                {mention.role}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            @
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Channels Dropdown */}
              {showChannels && filteredChannels.length > 0 && (
                <Card className="absolute bottom-full left-0 right-0 mb-2 shadow-lg border-primary/20 z-50 backdrop-blur-md bg-background/90">
                  <CardContent className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                      Channels
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredChannels.map((channel) => (
                        <button
                          key={channel.id}
                          className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-lg flex items-center gap-3 transition-all duration-200 group"
                          onClick={() => selectChannel(channel)}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded flex items-center justify-center text-xs font-medium",
                            channel.type === 'private' ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                          )}>
                            {channel.type === 'private' ? <Lock className="h-3 w-3" /> : <Hash className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium group-hover:text-primary transition-colors">
                              {channel.name}
                            </div>
                            {channel.memberCount && (
                              <div className="text-xs text-muted-foreground">
                                {channel.memberCount} members
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Input Controls */}
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip,.rar"
                  multiple
                  onChange={handleFileUpload}
                />

                {/* Templates */}
                {enableTemplates && (
                  <Popover open={showTemplates} onOpenChange={setShowTemplates}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-green-500/10 hover:text-green-600">
                        <Layers className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" side="top" align="end">
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground px-2">
                          Message Templates
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => insertTemplate(template)}
                              className="w-full text-left px-3 py-2 hover:bg-accent rounded-lg transition-colors"
                            >
                              <div className="font-medium text-sm">{template.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {template.content}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* AI Enhancement */}
                {enableAI && onRequestAISuggestion && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={enhanceWithAI}
                        disabled={!value.trim() || isProcessingAI}
                        className="h-7 w-7 p-0 hover:bg-purple-500/10 hover:text-purple-600"
                      >
                        {isProcessingAI ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Enhance with AI</TooltipContent>
                  </Tooltip>
                )}

                {/* Attachments */}
                <Popover open={showAttachments} onOpenChange={setShowAttachments}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-500/10 hover:text-blue-600">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" side="top" align="end">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full justify-start gap-2 h-9"
                      >
                        <File className="h-4 w-4" />
                        Upload Files
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-2 h-9"
                        onClick={() => {
                          fileInputRef.current?.setAttribute('accept', 'image/*');
                          fileInputRef.current?.click();
                        }}
                      >
                        <Image className="h-4 w-4" />
                        Upload Images
                      </Button>
                      {enableVoiceInput && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={isRecording ? stopRecording : startRecording}
                          className={cn(
                            "w-full justify-start gap-2 h-9",
                            isRecording && "text-red-600 hover:text-red-600"
                          )}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {isRecording ? 'Stop Recording' : 'Voice Message'}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9">
                        <Calendar className="h-4 w-4" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Emoji Picker */}
                <Popover open={showEmoji} onOpenChange={setShowEmoji}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-yellow-500/10 hover:text-yellow-600">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top" align="end">
                    <EmojiPicker 
                      onEmojiClick={handleEmojiClick}
                      lazyLoadEmojis={true}
                      theme={Theme.AUTO}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      width={350}
                      height={400}
                    />
                  </PopoverContent>
                </Popover>

                {/* Preview Toggle */}
                {enableRichText && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="h-7 w-7 p-0 hover:bg-indigo-500/10 hover:text-indigo-600"
                      >
                        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle preview</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Enhanced Send Button */}
            <div className="flex items-center gap-2">
              {/* Draft indicator */}
              {enableDrafts && drafts.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{drafts.length} saved drafts</TooltipContent>
                </Tooltip>
              )}

              <Button 
                onClick={handleSend} 
                disabled={(!value.trim() && attachedFiles.length === 0) || disabled || isOverLimit}
                size="lg"
                className={cn(
                  "h-11 w-11 rounded-full p-0 shrink-0 shadow-lg transition-all duration-200",
                  "hover:shadow-xl hover:scale-105 active:scale-95",
                  "bg-gradient-to-r from-primary to-primary/80",
                  isOverLimit && "opacity-50 cursor-not-allowed"
                )}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Enhanced Status Indicators */}
          <div className="flex items-center justify-between mt-3 min-h-[24px]">
            <div className="flex items-center gap-2 flex-wrap">
              {isPinned && (
                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Pin className="h-3 w-3 mr-1" />
                  Will be pinned
                </Badge>
              )}
              {isStarred && (
                <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Star className="h-3 w-3 mr-1" />
                  Important
                </Badge>
              )}
              {isUrgent && (
                <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {scheduledTime && (
                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
                  <Clock className="h-3 w-3 mr-1" />
                  Scheduled for {format(scheduledTime, 'HH:mm')}
                </Badge>
              )}
              {aiEnhanced && (
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
              {typing && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Typing...
                </Badge>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Keyboard className="h-3 w-3" />
              <span>⌘+Enter to send • Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
