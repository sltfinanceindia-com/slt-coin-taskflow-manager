import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText,
  Image,
  Video,
  Music,
  Download,
  Eye,
  Share,
  Upload,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  Star,
  Archive,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadedBy: string;
  uploadedAt: Date;
  thumbnail?: string;
}

interface SharedFile extends FileData {
  sharedWith: string[];
  accessLevel: 'view' | 'edit' | 'download';
  expiresAt?: Date;
}

interface MediaPlayer {
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  isMuted: boolean;
}

export default function AdvancedFeatures() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaPlayer, setMediaPlayer] = useState<MediaPlayer>({
    currentTime: 0,
    duration: 0,
    volume: 1,
    isPlaying: false,
    isMuted: false
  });
  const [currentMedia, setCurrentMedia] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (const file of Array.from(uploadedFiles)) {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const newFile: SharedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedBy: 'Current User',
          uploadedAt: new Date(),
          sharedWith: [],
          accessLevel: 'view',
          url: URL.createObjectURL(file)
        };

        setFiles(prev => [...prev, newFile]);
      }
      
      toast.success('Files uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Media playback controls
  const togglePlayback = () => {
    if (!mediaRef.current) return;
    
    if (mediaPlayer.isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    
    setMediaPlayer(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleVolumeChange = (volume: number) => {
    if (!mediaRef.current) return;
    
    mediaRef.current.volume = volume;
    setMediaPlayer(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    
    const newMuted = !mediaPlayer.isMuted;
    mediaRef.current.muted = newMuted;
    setMediaPlayer(prev => ({ ...prev, isMuted: newMuted }));
  };

  // File sharing and management
  const shareFile = (fileId: string) => {
    toast.success('File sharing link copied to clipboard!');
  };

  const downloadFile = (file: SharedFile) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File deleted successfully');
  };

  // Filter and search
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type.startsWith(filterType);
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Upload Section */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop files here or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-2"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-compress images</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Generate thumbnails</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Virus scan</span>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Shared Files
          </CardTitle>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {showAdvancedFilters && (
            <div className="flex gap-2 mt-2">
              {['all', 'image', 'video', 'audio', 'application'].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="font-medium text-sm truncate">
                      {file.name}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                {file.type.startsWith('image/') && file.url && (
                  <div className="mb-3">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{file.uploadedAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access:</span>
                    <Badge variant="secondary" className="text-xs">
                      {file.accessLevel}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => shareFile(file.id)}>
                    <Share className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => downloadFile(file)}>
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No files found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Player */}
      {currentMedia && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Media Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={currentMedia}
                  className="w-full h-full rounded-lg"
                  onLoadedMetadata={() => {
                    if (mediaRef.current) {
                      setMediaPlayer(prev => ({
                        ...prev,
                        duration: mediaRef.current?.duration || 0
                      }));
                    }
                  }}
                  onTimeUpdate={() => {
                    if (mediaRef.current) {
                      setMediaPlayer(prev => ({
                        ...prev,
                        currentTime: mediaRef.current?.currentTime || 0
                      }));
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={togglePlayback}>
                  {mediaPlayer.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleMute}>
                  {mediaPlayer.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Maximize className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 space-y-2">
                  <Progress 
                    value={(mediaPlayer.currentTime / mediaPlayer.duration) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(mediaPlayer.currentTime)}</span>
                    <span>{formatTime(mediaPlayer.duration)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={mediaPlayer.volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}