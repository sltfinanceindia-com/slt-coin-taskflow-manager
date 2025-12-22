import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, X, FileText, Image, File, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (fileUrl: string, fileName: string, fileType: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  taskId?: string; // Optional task ID for task-attachments bucket
}

export function FileUpload({ 
  onFileUpload, 
  accept = "*/*", 
  maxSize = 10,
  multiple = false,
  taskId
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{url: string, name: string, type: string, storagePath?: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `File ${file.name} exceeds ${maxSize}MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Determine bucket and path based on whether taskId is provided
        const bucket = taskId ? 'task-attachments' : 'attachments';
        // For attachments bucket, use a simple path that doesn't depend on auth.uid()
        const filePath = taskId ? `${taskId}/${fileName}` : `shared/${fileName}`;
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Get URL - always use signed URL for reliability
        let fileUrl: string;
        
        const { data: signedData, error: signedError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiry
        
        if (signedError || !signedData?.signedUrl) {
          console.error('Failed to get signed URL:', signedError);
          // Fallback to public URL for public buckets
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          fileUrl = publicUrl;
        } else {
          fileUrl = signedData.signedUrl;
        }

        const fileData = {
          url: fileUrl,
          name: file.name,
          type: file.type,
          storagePath: filePath
        };

        setUploadedFiles(prev => [...prev, fileData]);
        onFileUpload(fileUrl, file.name, file.type);

        toast({
          title: "File uploaded",
          description: `${file.name} uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-3 w-3" />;
    } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('presentation') || fileType.includes('sheet')) {
      return <FileText className="h-3 w-3" />;
    }
    return <File className="h-3 w-3" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-1 text-xs h-7"
        >
          <Paperclip className="h-3 w-3" />
          {uploading ? 'Uploading...' : 'Attach'}
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-xs bg-muted/50 rounded p-1">
              {getFileIcon(file.type)}
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="truncate flex-1 hover:underline text-primary"
              >
                {file.name}
              </a>
              <Download className="h-3 w-3 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}