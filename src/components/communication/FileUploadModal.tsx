import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText,
  FileAudio,
  Archive,
  Code,
  X,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  FolderOpen,
  Cloud,
  HardDrive,
  Link,
  Trash2,
  Edit3,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Info,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Maximize2,
  Minimize2,
  PlayCircle,
  Pause,
  SkipBack,
  SkipForward,
  VolumeX,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FileWithMetadata extends File {
  id: string;
  preview?: string;
  description?: string;
  tags?: string[];
  uploadProgress?: number;
  uploadStatus?: 'idle' | 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  thumbnail?: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    bitrate?: number;
    codec?: string;
  };
}

interface UploadStats {
  totalFiles: number;
  totalSize: number;
  completedFiles: number;
  completedSize: number;
  estimatedTime: number;
  averageSpeed: number;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileWithMetadata[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in MB
  maxTotalSize?: number; // in MB
  acceptedTypes?: string[];
  allowedExtensions?: string[];
  enableChunkedUpload?: boolean;
  chunkSize?: number; // in MB
  enableCompression?: boolean;
  compressionQuality?: number;
  enablePreview?: boolean;
  enableMetadataEditing?: boolean;
  enableCloudUpload?: boolean;
  cloudServices?: ('google-drive' | 'dropbox' | 'onedrive')[];
  enableUrlUpload?: boolean;
  enableWebcam?: boolean;
  enableBatchProcessing?: boolean;
  customValidation?: (file: File) => Promise<string | null>;
}

export function FileUploadModal({ 
  isOpen, 
  onClose, 
  onUpload,
  maxFiles = 10,
  maxSize = 50,
  maxTotalSize = 500,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx', '.txt', '.zip', '.rar'],
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.avi', '.mov', '.mp3', '.wav', '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'],
  enableChunkedUpload = true,
  chunkSize = 5,
  enableCompression = true,
  compressionQuality = 0.8,
  enablePreview = true,
  enableMetadataEditing = true,
  enableCloudUpload = false,
  cloudServices = ['google-drive', 'dropbox'],
  enableUrlUpload = true,
  enableWebcam = false,
  enableBatchProcessing = true,
  customValidation
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    totalFiles: 0,
    totalSize: 0,
    completedFiles: 0,
    completedSize: 0,
    estimatedTime: 0,
    averageSpeed: 0
  });
  const [activeTab, setActiveTab] = useState('upload');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'type' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos' | 'documents' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [enableAutoTags, setEnableAutoTags] = useState(true);
  const [enableAutoResize, setEnableAutoResize] = useState(false);
  const [targetDimensions, setTargetDimensions] = useState({ width: 1920, height: 1080 });
  const [compressionEnabled, setCompressionEnabled] = useState(enableCompression);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Enhanced file type detection and icons
  const getFileIcon = useCallback((file: FileWithMetadata) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('document') || ['doc', 'docx', 'odt'].includes(extension)) 
      return <FileText className="h-5 w-5 text-blue-600" />;
    if (type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(extension))
      return <FileText className="h-5 w-5 text-green-600" />;
    if (type.includes('zip') || type.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension))
      return <Archive className="h-5 w-5 text-yellow-500" />;
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension))
      return <Code className="h-5 w-5 text-orange-500" />;
    
    return <File className="h-5 w-5 text-gray-500" />;
  }, []);

  const getFileCategory = (file: FileWithMetadata): string => {
    if (file.type.startsWith('image/')) return 'images';
    if (file.type.startsWith('video/')) return 'videos';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'documents';
  };

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Enhanced file validation with custom rules
  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    // Type validation
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type;
    });
    
    const isValidExtension = allowedExtensions.includes(extension);
    
    if (!isValidType && !isValidExtension) {
      return `File type not supported. Allowed types: ${acceptedTypes.join(', ')}`;
    }
    
    // Custom validation
    if (customValidation) {
      const customError = await customValidation(file);
      if (customError) return customError;
    }
    
    // Total size validation
    const currentTotalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    if ((currentTotalSize + file.size) > maxTotalSize * 1024 * 1024) {
      return `Total size exceeds ${maxTotalSize}MB limit`;
    }
    
    return null;
  }, [acceptedTypes, allowedExtensions, maxSize, maxTotalSize, selectedFiles, customValidation]);

  // Generate file preview for images and videos
  const generatePreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (!enablePreview) return undefined;
    
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(video.duration / 2, 10); // Get frame at 50% or 10s
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, [enablePreview]);

  // Extract metadata from files
  const extractMetadata = useCallback(async (file: File) => {
    if (!enableMetadataEditing) return {};
    
    return new Promise<any>((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            dimensions: { width: img.width, height: img.height }
          });
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            dimensions: { width: video.videoWidth, height: video.videoHeight },
            duration: video.duration
          });
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.onloadedmetadata = () => {
          resolve({
            duration: audio.duration
          });
        };
        audio.src = URL.createObjectURL(file);
      } else {
        resolve({});
      }
    });
  }, [enableMetadataEditing]);

  // Generate auto tags based on file content and metadata
  const generateAutoTags = useCallback((file: File, metadata: any): string[] => {
    if (!enableAutoTags) return [];
    
    const tags: string[] = [];
    const filename = file.name.toLowerCase();
    const category = getFileCategory(file as FileWithMetadata);
    
    tags.push(category.slice(0, -1)); // Remove 's' from category
    
    // Size-based tags
    if (file.size > 10 * 1024 * 1024) tags.push('large');
    else if (file.size < 1024 * 1024) tags.push('small');
    
    // Dimension-based tags for images/videos
    if (metadata.dimensions) {
      const { width, height } = metadata.dimensions;
      if (width >= 1920 || height >= 1080) tags.push('hd');
      if (width >= 3840 || height >= 2160) tags.push('4k');
      if (width > height) tags.push('landscape');
      else if (height > width) tags.push('portrait');
      else tags.push('square');
    }
    
    // Duration-based tags for media
    if (metadata.duration) {
      if (metadata.duration > 600) tags.push('long');
      else if (metadata.duration < 60) tags.push('short');
    }
    
    // Content-based tags from filename
    if (filename.includes('screenshot')) tags.push('screenshot');
    if (filename.includes('profile') || filename.includes('avatar')) tags.push('profile');
    if (filename.includes('logo')) tags.push('logo');
    if (filename.includes('banner') || filename.includes('header')) tags.push('banner');
    
    return tags;
  }, [enableAutoTags]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: FileWithMetadata[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (selectedFiles.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }
      
      const error = await validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }
      
      const [preview, metadata] = await Promise.all([
        generatePreview(file),
        extractMetadata(file)
      ]);
      
      const autoTags = generateAutoTags(file, metadata);
      
      const fileWithMetadata: FileWithMetadata = {
        ...file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        preview,
        metadata,
        tags: autoTags,
        uploadStatus: 'idle',
        uploadProgress: 0
      } as FileWithMetadata;
      
      newFiles.push(fileWithMetadata);
    }
    
    if (errors.length > 0) {
      toast({
        title: "File Upload Errors",
        description: errors.slice(0, 3).join('; ') + (errors.length > 3 ? '...' : ''),
        variant: "destructive"
      });
    }
    
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files Added",
        description: `${newFiles.length} file(s) added successfully`,
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [selectedFiles.length, maxFiles, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const removeSelectedFiles = useCallback(() => {
    setSelectedFiles(prev => prev.filter(f => !selectedFileIds.has(f.id)));
    setSelectedFileIds(new Set());
  }, [selectedFileIds]);

  const updateFileMetadata = useCallback((id: string, updates: Partial<FileWithMetadata>) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  }, []);

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;
    
    try {
      const response = await fetch(urlInput);
      const blob = await response.blob();
      const filename = urlInput.split('/').pop() || 'downloaded-file';
      const file = new File([blob], filename, { type: blob.type });
      
      await handleFileSelect(new FileList(file as any));
      setUrlInput('');
    } catch (error) {
      toast({
        title: "URL Upload Failed",
        description: "Unable to download file from the provided URL",
        variant: "destructive"
      });
    }
  };

  // Simulated upload with chunked upload support
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const startTime = Date.now();
    
    try {
      // Update upload status for all files
      setSelectedFiles(prev => prev.map(f => ({ 
        ...f, 
        uploadStatus: 'uploading' as const,
        uploadProgress: 0 
      })));
      
      // Simulate chunked upload for large files
      const uploadPromises = selectedFiles.map(async (file) => {
        const chunks = enableChunkedUpload && file.size > chunkSize * 1024 * 1024 
          ? Math.ceil(file.size / (chunkSize * 1024 * 1024))
          : 1;
        
        for (let chunk = 0; chunk < chunks; chunk++) {
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          
          const progress = ((chunk + 1) / chunks) * 100;
          setSelectedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, uploadProgress: Math.min(progress, 100) }
              : f
          ));
        }
        
        setSelectedFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'completed' as const, uploadProgress: 100 }
            : f
        ));
      });
      
      await Promise.all(uploadPromises);
      
      // Calculate upload stats
      const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
      const duration = (Date.now() - startTime) / 1000;
      const speed = totalSize / duration;
      
      setUploadStats({
        totalFiles: selectedFiles.length,
        totalSize,
        completedFiles: selectedFiles.length,
        completedSize: totalSize,
        estimatedTime: duration,
        averageSpeed: speed
      });
      
      await onUpload(selectedFiles);
      
      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} file(s) uploaded successfully in ${formatDuration(duration)}`,
      });
      
      // Reset and close
      setSelectedFiles([]);
      setSelectedFileIds(new Set());
      onClose();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload. Please try again.",
        variant: "destructive"
      });
      
      setSelectedFiles(prev => prev.map(f => ({ 
        ...f, 
        uploadStatus: 'error' as const,
        error: 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = selectedFiles.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || getFileCategory(file) === filterType;
      
      return matchesSearch && matchesFilter;
    });
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'date':
          comparison = a.lastModified - b.lastModified;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [selectedFiles, searchQuery, filterType, sortBy, sortOrder]);

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const completedFiles = selectedFiles.filter(f => f.uploadStatus === 'completed').length;
  const overallProgress = selectedFiles.length > 0 
    ? selectedFiles.reduce((sum, f) => sum + (f.uploadProgress || 0), 0) / selectedFiles.length
    : 0;

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">Upload Files</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {maxFiles} files max • {maxSize}MB per file • {formatFileSize(maxTotalSize * 1024 * 1024)} total
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isUploading && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                )}
                
                <Button variant="ghost" size="sm" onClick={onClose} disabled={isUploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress bar */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <Progress value={overallProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedFiles}/{selectedFiles.length} files completed</span>
                  <span>{formatFileSize(totalSize)} total</span>
                </div>
              </div>
            )}
          </DialogHeader>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b px-6 bg-muted/20">
                  <TabsList className="grid w-full grid-cols-4 max-w-md">
                    <TabsTrigger value="upload" className="text-xs">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </TabsTrigger>
                    {enableUrlUpload && (
                      <TabsTrigger value="url" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
                        URL
                      </TabsTrigger>
                    )}
                    {enableCloudUpload && (
                      <TabsTrigger value="cloud" className="text-xs">
                        <Cloud className="h-3 w-3 mr-1" />
                        Cloud
                      </TabsTrigger>
                    )}
                    {enableWebcam && (
                      <TabsTrigger value="webcam" className="text-xs">
                        <Camera className="h-3 w-3 mr-1" />
                        Camera
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="upload" className="m-0 h-full flex flex-col">
                    <div className="p-6 flex-1 overflow-hidden flex flex-col">
                      {/* Enhanced Drop Zone */}
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group",
                          isDragOver ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                          selectedFiles.length > 0 && "border-green-500/50 bg-green-500/5"
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center space-y-4">
                          <div className={cn(
                            "rounded-full p-4 transition-all duration-200",
                            isDragOver ? "bg-primary/20 scale-110" : "bg-muted/50 group-hover:bg-primary/10"
                          )}>
                            <Upload className={cn(
                              "h-8 w-8 transition-colors duration-200",
                              isDragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                            )} />
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-2">
                              {isDragOver ? 'Drop files here!' : 'Drag & drop files or click to browse'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Supports {acceptedTypes.join(', ')} and more
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-2">
                              {['Images', 'Videos', 'Documents', 'Audio'].map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {selectedFiles.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-green-600">
                              <Check className="h-4 w-4" />
                              <span>{selectedFiles.length} files selected</span>
                            </div>
                          )}
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={acceptedTypes.join(',')}
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                        />
                      </div>

                      {/* Advanced Options */}
                      {enableBatchProcessing && (
                        <div className="mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            className="text-xs"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Advanced Options
                            {showAdvancedOptions ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                          </Button>
                          
                          {showAdvancedOptions && (
                            <Card className="mt-2 p-4 bg-muted/30">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between">
                                  <label>Auto-resize images</label>
                                  <Switch
                                    checked={enableAutoResize}
                                    onCheckedChange={setEnableAutoResize}
                                    size="sm"
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <label>Enable compression</label>
                                  <Switch
                                    checked={compressionEnabled}
                                    onCheckedChange={setCompressionEnabled}
                                    size="sm"
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <label>Generate auto tags</label>
                                  <Switch
                                    checked={enableAutoTags}
                                    onCheckedChange={setEnableAutoTags}
                                    size="sm"
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <label>Chunked upload</label>
                                  <Switch
                                    checked={enableChunkedUpload}
                                    onCheckedChange={() => {}}
                                    disabled
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {enableUrlUpload && (
                    <TabsContent value="url" className="m-0 h-full p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Upload from URL</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Enter a direct link to download and upload a file
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Input
                            placeholder="https://example.com/file.jpg"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={handleUrlUpload} disabled={!urlInput.trim()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Supported: Direct links to images, videos, documents, and other files
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {enableCloudUpload && (
                    <TabsContent value="cloud" className="m-0 h-full p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Import from Cloud</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Connect your cloud storage accounts to import files
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {cloudServices.map((service) => (
                            <Button
                              key={service}
                              variant="outline"
                              className="justify-start h-auto p-4"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Cloud className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium capitalize">{service.replace('-', ' ')}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Import files from your {service} account
                                  </div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {enableWebcam && (
                    <TabsContent value="webcam" className="m-0 h-full p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Capture from Camera</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Take photos or record videos using your device camera
                          </p>
                        </div>
                        
                        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                          <div className="text-center text-white">
                            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm opacity-75">Camera preview will appear here</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center space-x-2">
                          <Button variant="outline">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Camera
                          </Button>
                          <Button variant="outline">
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>

            {/* File List Sidebar */}
            {selectedFiles.length > 0 && (
              <div className="w-80 border-l flex flex-col">
                <div className="p-4 border-b bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
                    <div className="flex items-center space-x-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="h-7 w-7 p-0"
                          >
                            {viewMode === 'grid' ? <List className="h-3 w-3" /> : <Grid3X3 className="h-3 w-3" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle view mode</TooltipContent>
                      </Tooltip>
                      
                      {selectedFileIds.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeSelectedFiles}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Search and filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-7 h-7 text-xs"
                      />
                    </div>
                    
                    <div className="flex space-x-1">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="h-6 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All files</SelectItem>
                          <SelectItem value="images">Images</SelectItem>
                          <SelectItem value="videos">Videos</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-6 text-xs w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="size">Size</SelectItem>
                          <SelectItem value="type">Type</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="h-6 w-6 p-0"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className={cn(
                    "p-2",
                    viewMode === 'grid' ? "grid grid-cols-2 gap-2" : "space-y-1"
                  )}>
                    {filteredAndSortedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          "group relative rounded-lg border transition-all duration-200 cursor-pointer",
                          selectedFileIds.has(file.id) ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/50",
                          viewMode === 'grid' ? "p-2 aspect-square" : "p-3"
                        )}
                        onClick={() => {
                          setSelectedFileIds(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(file.id)) {
                              newSet.delete(file.id);
                            } else {
                              newSet.add(file.id);
                            }
                            return newSet;
                          });
                        }}
                      >
                        <div className={cn(
                          "flex items-center",
                          viewMode === 'grid' ? "flex-col space-y-2 text-center" : "space-x-3"
                        )}>
                          {/* File preview/icon */}
                          <div className={cn(
                            "relative rounded-lg overflow-hidden flex-shrink-0",
                            viewMode === 'grid' ? "w-full aspect-square" : "w-10 h-10"
                          )}>
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="w-full h-full object-cover bg-muted"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                {getFileIcon(file)}
                              </div>
                            )}
                            
                            {/* Upload status overlay */}
                            {file.uploadStatus !== 'idle' && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                {file.uploadStatus === 'uploading' && (
                                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                                )}
                                {file.uploadStatus === 'completed' && (
                                  <Check className="h-4 w-4 text-green-400" />
                                )}
                                {file.uploadStatus === 'error' && (
                                  <AlertCircle className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className={cn(
                            "min-w-0",
                            viewMode === 'grid' ? "w-full" : "flex-1"
                          )}>
                            <p className={cn(
                              "font-medium truncate",
                              viewMode === 'grid' ? "text-xs" : "text-sm"
                            )}>
                              {file.name}
                            </p>
                            
                            <div className={cn(
                              "flex items-center gap-1 text-muted-foreground",
                              viewMode === 'grid' ? "text-[10px] flex-col" : "text-xs"
                            )}>
                              <span>{formatFileSize(file.size)}</span>
                              {viewMode === 'list' && file.metadata?.dimensions && (
                                <>
                                  <span>•</span>
                                  <span>{file.metadata.dimensions.width}×{file.metadata.dimensions.height}</span>
                                </>
                              )}
                              {viewMode === 'list' && file.metadata?.duration && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(file.metadata.duration)}</span>
                                </>
                              )}
                            </div>
                            
                            {/* Tags */}
                            {file.tags && file.tags.length > 0 && viewMode === 'list' && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {file.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1">
                                    {tag}
                                  </Badge>
                                ))}
                                {file.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                    +{file.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Upload progress */}
                            {file.uploadStatus === 'uploading' && (
                              <div className="mt-2">
                                <Progress value={file.uploadProgress || 0} className="h-1" />
                                <span className="text-[10px] text-muted-foreground">
                                  {Math.round(file.uploadProgress || 0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            {enableMetadataEditing && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 bg-background/80 hover:bg-background"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Open metadata editor
                                    }}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit metadata</TooltipContent>
                              </Tooltip>
                            )}
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove file</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Upload Stats */}
                {isUploading && (
                  <div className="p-4 border-t bg-muted/20">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Total Size:</span>
                        <span>{formatFileSize(totalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress:</span>
                        <span>{completedFiles}/{selectedFiles.length} files</span>
                      </div>
                      {uploadStats.averageSpeed > 0 && (
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span>{formatFileSize(uploadStats.averageSpeed)}/s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer Actions */}
          <div className="p-6 border-t bg-gradient-to-r from-background to-muted/20 flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{selectedFiles.length}/{maxFiles} files</span>
              <span>{formatFileSize(totalSize)} / {formatFileSize(maxTotalSize * 1024 * 1024)}</span>
              {selectedFileIds.size > 0 && (
                <span>{selectedFileIds.size} selected</span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              
              <Button 
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="min-w-24"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
