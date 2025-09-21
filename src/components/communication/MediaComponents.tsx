import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Archive,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  placeholder,
  threshold = 0.1
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {isInView ? (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              hasError && "hidden"
            )}
          />
          
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              {placeholder || <ImageIcon className="h-8 w-8 text-muted-foreground" />}
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Failed to load image</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
          {placeholder || <ImageIcon className="h-8 w-8 text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}

interface MediaPreviewProps {
  file: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
  onClose?: () => void;
  className?: string;
}

export function MediaPreview({ file, onClose, className }: MediaPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPdf = file.type === 'application/pdf';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.2));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={cn(
      "bg-background border border-border overflow-hidden",
      isFullscreen && "fixed inset-4 z-50 shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-2 min-w-0">
          {isImage && <ImageIcon className="h-4 w-4 text-primary" />}
          {isVideo && <VideoIcon className="h-4 w-4 text-primary" />}
          {isAudio && <Music className="h-4 w-4 text-primary" />}
          {isPdf && <FileText className="h-4 w-4 text-primary" />}
          
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isImage && (
            <>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </>
          )}

          {(isVideo || isAudio) && (
            <>
              <Button variant="ghost" size="sm" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </>
          )}

          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative bg-muted/20" style={{ height: isFullscreen ? 'calc(100vh - 8rem)' : '400px' }}>
        {isImage && (
          <div className="flex items-center justify-center h-full overflow-hidden">
            <div
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <LazyImage
                src={file.url}
                alt={file.name}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {isVideo && (
          <video
            ref={videoRef}
            src={file.url}
            className="w-full h-full object-contain"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
          />
        )}

        {isAudio && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Music className="h-16 w-16 text-primary mx-auto" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <audio
                ref={audioRef}
                src={file.url}
                controls
                className="w-full max-w-md"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
        )}

        {isPdf && (
          <iframe
            src={file.url}
            className="w-full h-full border-0"
            title={file.name}
          />
        )}

        {!isImage && !isVideo && !isAudio && !isPdf && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Archive className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">Preview not available</p>
                <p className="text-sm text-muted-foreground">
                  This file type cannot be previewed in the browser
                </p>
                <Button onClick={handleDownload} className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {isImage && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Rotation: {rotation}°</span>
        </div>
      )}
    </Card>
  );
}

interface FilePreviewGridProps {
  files: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  onFileSelect?: (file: any) => void;
  className?: string;
}

export function FilePreviewGrid({ files, onFileSelect, className }: FilePreviewGridProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith('video/')) return <VideoIcon className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <Archive className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {files.map((file) => (
        <Card
          key={file.id}
          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group"
          onClick={() => onFileSelect?.(file)}
        >
          <div className="aspect-square relative bg-muted/20">
            {file.type.startsWith('image/') ? (
              <LazyImage
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  {getFileIcon(file.type)}
                  <p className="text-xs mt-2 text-muted-foreground">
                    {file.type.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="p-3">
            <p className="text-sm font-medium truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}