import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Video, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string, duration: number) => void;
  currentVideoUrl?: string;
}

export function VideoUpload({ onVideoUploaded, currentVideoUrl }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({ title: "Invalid file type", description: "Please select a video file", variant: "destructive" });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({ title: "File too large", description: "Video files must be under 100MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `training-videos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('training-videos')
        .upload(filePath, file);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      clearInterval(progressInterval);
      
      if (error) throw error;

      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training-videos')
        .getPublicUrl(data.path);

      setVideoUrl(publicUrl);

      // Get video duration
      const video = document.createElement('video');
      video.src = publicUrl;
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration / 60); // Convert to minutes
        onVideoUploaded(publicUrl, duration);
        toast({ title: "Video uploaded successfully!" });
      };

    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload video. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleVideoFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleVideoFile(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (videoUrl) {
      // For URL uploads, we can't automatically detect duration
      onVideoUploaded(videoUrl, 0);
      toast({ title: "Video URL added successfully!" });
    }
  };

  const clearVideo = () => {
    setVideoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Video File</Label>
        <Card
          className={`relative border-2 border-dashed transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isUploading ? (
              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-center text-muted-foreground">Uploading video...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">Drop video file here or click to browse</p>
                <p className="text-xs text-muted-foreground mb-4">Supports MP4, MOV, AVI (max 100MB)</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <div className="flex space-x-2">
          <Input
            id="video-url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or direct video URL"
            disabled={isUploading}
          />
          {videoUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={clearVideo}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {videoUrl && !currentVideoUrl && (
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={isUploading}
            className="w-full"
          >
            Use This URL
          </Button>
        )}
      </div>

      {videoUrl && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full max-w-md rounded-lg"
            style={{ maxHeight: '200px' }}
          />
        </div>
      )}
    </div>
  );
}