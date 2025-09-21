import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Upload, 
  X, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail_url?: string;
}

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
  if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="h-4 w-4" />;
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return <Archive className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  acceptedFileTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/*'
  ],
  className
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<FileWithProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: FileWithProgress[] = acceptedFiles.map(file => ({
      file,
      id: Date.now() + Math.random().toString(),
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Upload each file
    for (const fileWithProgress of newFiles) {
      await uploadFile(fileWithProgress);
    }
  }, []);

  const uploadFile = async (fileWithProgress: FileWithProgress) => {
    const { file, id } = fileWithProgress;
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      // Update progress
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, progress: 25 } : f)
      );

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Update progress
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, progress: 75 } : f)
      );

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) throw new Error('Failed to get public URL');

      // Generate thumbnail for images
      let thumbnailUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        try {
          thumbnailUrl = await generateThumbnail(file);
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
        }
      }

      const uploadedFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrlData.publicUrl,
        thumbnail_url: thumbnailUrl
      };

      // Update progress to complete
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { 
          ...f, 
          progress: 100, 
          status: 'completed' as const, 
          url: uploadedFile.url 
        } : f)
      );

      // Add to uploaded files
      setUploadedFiles(prev => [...prev, uploadedFile]);

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { 
          ...f, 
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f)
      );

      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach(error => {
          let message = `Failed to upload ${file.name}`;
          if (error.code === 'file-too-large') {
            message += `: File is larger than ${maxFileSize}MB`;
          } else if (error.code === 'file-invalid-type') {
            message += `: File type not supported`;
          } else if (error.code === 'too-many-files') {
            message += `: Maximum ${maxFiles} files allowed`;
          }
          
          toast({
            title: "Upload Error",
            description: message,
            variant: "destructive",
          });
        });
      });
    }
  });

  // Trigger callback when files are uploaded
  React.useEffect(() => {
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
    }
  }, [uploadedFiles, onFilesUploaded]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} files, up to {maxFileSize}MB each
            </p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {acceptedFileTypes.slice(0, 4).map((type, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {type.split('/')[0]}
                </Badge>
              ))}
              {acceptedFileTypes.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{acceptedFileTypes.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading</h4>
          {uploadingFiles.map((fileWithProgress) => (
            <div key={fileWithProgress.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0">
                {fileWithProgress.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {fileWithProgress.status === 'completed' && <Check className="h-4 w-4 text-success" />}
                {fileWithProgress.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{fileWithProgress.file.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(fileWithProgress.file.size)}
                  </span>
                </div>
                {fileWithProgress.status === 'uploading' && (
                  <Progress value={fileWithProgress.progress} className="h-1" />
                )}
                {fileWithProgress.status === 'error' && fileWithProgress.error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {fileWithProgress.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => removeUploadingFile(fileWithProgress.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attached Files</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
              <div className="flex-shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm font-medium truncate cursor-help">{file.name}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{file.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open file</TooltipContent>
                </Tooltip>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeUploadedFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;