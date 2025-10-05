import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, File, Image as ImageIcon, Video, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'video' | 'document' | 'audio';
  url?: string;
  preview?: string;
  uploading?: boolean;
  progress?: number;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  onDownload?: (attachment: Attachment) => void;
  showRemove?: boolean;
  className?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

export default function AttachmentPreview({
  attachments,
  onRemove,
  onDownload,
  showRemove = true,
  className
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative group">
            {/* Image Preview */}
            {attachment.type === 'image' && attachment.preview ? (
              <div className="relative">
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                {attachment.uploading && (
                  <div className="absolute inset-0 bg-background/80 rounded-lg flex flex-col items-center justify-center">
                    <Progress value={attachment.progress} className="w-16 mb-1" />
                    <span className="text-xs">{attachment.progress}%</span>
                  </div>
                )}
                {showRemove && onRemove && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {!attachment.uploading && onDownload && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDownload(attachment)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              /* File Preview */
              <div className="flex items-center gap-3 bg-muted p-3 rounded-lg border min-w-56 max-w-xs">
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                  
                  {attachment.uploading && (
                    <Progress value={attachment.progress} className="mt-1" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!attachment.uploading && onDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onDownload(attachment)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  {showRemove && onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => onRemove(attachment.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
