import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function FileUploadModal({ 
  isOpen, 
  onClose, 
  onUpload,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', '.doc', '.docx', '.txt']
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    // Check file type (simplified check)
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });
    
    if (!isValidType) {
      return 'File type not supported';
    }
    
    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (selectedFiles.length + newFiles.length < maxFiles) {
        newFiles.push(file);
      } else {
        errors.push(`Maximum ${maxFiles} files allowed`);
      }
    });
    
    if (errors.length > 0) {
      toast({
        title: "File Upload Error",
        description: errors.join(', '),
        variant: "destructive"
      });
    }
    
    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    // Simulate upload progress
    selectedFiles.forEach((file, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
      }, 200);
    });
    
    // Wait for "upload" to complete
    setTimeout(() => {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      setUploadProgress({});
      onClose();
      toast({
        title: "Files Uploaded",
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Files</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Select up to {maxFiles} files, max {maxSize}MB each
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                "hover:border-primary hover:bg-primary/5"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports images, videos, documents and more
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
            
            {/* Selected files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <div className="text-muted-foreground">
                      {getFileIcon(file)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {file.type.split('/')[0] || 'file'}
                        </Badge>
                      </div>
                      
                      {/* Upload progress */}
                      {uploadProgress[file.name] !== undefined && (
                        <div className="mt-2">
                          <Progress value={uploadProgress[file.name]} className="h-1" />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(uploadProgress[file.name])}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadProgress[file.name] === 100 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : uploadProgress[file.name] !== undefined ? (
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload button */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0 || Object.keys(uploadProgress).length > 0}
              >
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}