import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Upload, File, X, CheckCircle, Loader2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FileUploaderProps {
  bucket?: string;
  folder?: string;
  onUploadComplete?: (url: string, fileName: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUploader({ 
  bucket = 'documents',
  folder = '',
  onUploadComplete,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10 
}: FileUploaderProps) {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSize}MB`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}/${folder ? folder + '/' : ''}${Date.now()}.${fileExt}`;

      setProgress(30);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      setProgress(70);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      setUploadedFile({ name: file.name, url: urlData.publicUrl });
      onUploadComplete?.(urlData.publicUrl, file.name);

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded`
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
      />

      {!uploadedFile ? (
        <Card 
          className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div className="w-full max-w-xs">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">Uploading... {progress}%</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Click to upload</p>
                    <p className="text-sm text-muted-foreground">
                      or drag and drop • Max {maxSize}MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">Upload complete</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(uploadedFile.url, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Document Preview Component
interface DocumentPreviewProps {
  url: string;
  fileName: string;
  open: boolean;
  onClose: () => void;
}

export function DocumentPreview({ url, fileName, open, onClose }: DocumentPreviewProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            {fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {isImage ? (
            <img src={url} alt={fileName} className="w-full h-auto rounded-lg" />
          ) : isPdf ? (
            <iframe
              src={url}
              className="w-full h-[70vh] rounded-lg border"
              title={fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <File className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground">Preview not available for this file type</p>
              <Button onClick={() => window.open(url, '_blank')}>
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
