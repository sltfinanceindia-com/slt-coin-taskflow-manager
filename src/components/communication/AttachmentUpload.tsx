import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Paperclip, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface AttachmentUploadProps {
  onFileUploaded: (attachment: any) => void;
  isOpen: boolean;
  onClose: () => void;
  messageId?: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  if (fileType.includes('zip') || fileType.includes('rar')) return Archive;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AttachmentUpload({ 
  onFileUploaded, 
  isOpen, 
  onClose, 
  messageId 
}: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !messageId) return;

    try {
      for (const file of selectedFiles) {
        setUploadProgress(0);
        const attachment = await uploadFile(file, messageId);
        if (attachment) {
          onFileUploaded(attachment);
        }
        setUploadProgress(100);
      }
      
      setSelectedFiles([]);
      onClose();
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <div className="absolute bottom-12 left-0 z-50">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Upload Files</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>

            {/* Quick Upload Options */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
              >
                <Image className="h-4 w-4 mr-1" />
                Images
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = ".pdf,.doc,.docx,.txt";
                    fileInputRef.current.click();
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                Documents
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                  }
                }}
              >
                <Video className="h-4 w-4 mr-1" />
                Videos
              </Button>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Files:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Uploading...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
              <Button 
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}

            {/* File Size Limit */}
            <p className="text-xs text-muted-foreground text-center">
              Maximum file size: 20MB per file
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}