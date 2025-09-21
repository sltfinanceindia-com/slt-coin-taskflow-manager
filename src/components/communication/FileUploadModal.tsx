import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload,
  X,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Eye,
  Share,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
  progress?: number;
  isUploading?: boolean;
  thumbnail?: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (files: FileItem[]) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  existingFiles?: FileItem[];
}

type FileFilter = 'all' | 'images' | 'videos' | 'audio' | 'documents';
type SortBy = 'name' | 'date' | 'size' | 'type';
type ViewMode = 'grid' | 'list';

export default function FileUploadModal({
  isOpen,
  onClose,
  onFilesUploaded,
  maxFileSize = 100, // 100MB default
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'],
  existingFiles = []
}: FileUploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>(existingFiles);
  const [uploadingFiles, setUploadingFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileFilter, setFileFilter] = useState<FileFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Settings
  const [compressImages, setCompressImages] = useState(true);
  const [generateThumbnails, setGenerateThumbnails] = useState(true);
  const [scanForVirus, setScanForVirus] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxFileSize}MB)`);
        return;
      }

      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      });

      if (!isAllowed) {
        errors.push(`${file.name} is not an allowed file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  }, [maxFileSize, allowedTypes]);

  const uploadFiles = async (filesToUpload: File[]) => {
    const newUploadingFiles: FileItem[] = filesToUpload.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: 'Current User',
      progress: 0,
      isUploading: true,
      url: URL.createObjectURL(file)
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    try {
      for (const [index, file] of filesToUpload.entries()) {
        const fileItem = newUploadingFiles[index];
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === fileItem.id
                ? { ...f, progress }
                : f
            )
          );
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Complete upload
        const completedFile: FileItem = {
          ...fileItem,
          isUploading: false,
          progress: 100
        };

        setFiles(prev => [...prev, completedFile]);
        setUploadingFiles(prev => prev.filter(f => f.id !== fileItem.id));
      }

      toast.success(`${filesToUpload.length} file(s) uploaded successfully`);
      onFilesUploaded(files);
    } catch (error) {
      toast.error('Upload failed');
      setUploadingFiles([]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File deleted');
  };

  const downloadFile = (file: FileItem) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const shareFile = (file: FileItem) => {
    // Copy file URL to clipboard
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      toast.success('File link copied to clipboard');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesFilter = true;
      
      switch (fileFilter) {
        case 'images':
          matchesFilter = file.type.startsWith('image/');
          break;
        case 'videos':
          matchesFilter = file.type.startsWith('video/');
          break;
        case 'audio':
          matchesFilter = file.type.startsWith('audio/');
          break;
        case 'documents':
          matchesFilter = file.type.includes('pdf') || file.type.includes('doc') || file.type.includes('text');
          break;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      }
    });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Upload Area */}
          <div className="w-1/3 border-r p-6 space-y-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-border"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop files here or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                accept={allowedTypes.join(',')}
              />
              <p className="text-xs text-muted-foreground">
                Max {maxFileSize}MB per file
              </p>
            </div>

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Uploading...</h4>
                {uploadingFiles.map(file => (
                  <div key={file.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate flex-1">{file.name}</span>
                    </div>
                    <Progress value={file.progress || 0} className="w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Upload Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Upload Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compress images</span>
                  <Switch 
                    checked={compressImages} 
                    onCheckedChange={setCompressImages}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Generate thumbnails</span>
                  <Switch 
                    checked={generateThumbnails} 
                    onCheckedChange={setGenerateThumbnails}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Virus scan</span>
                  <Switch 
                    checked={scanForVirus} 
                    onCheckedChange={setScanForVirus}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto upload</span>
                  <Switch 
                    checked={autoUpload} 
                    onCheckedChange={setAutoUpload}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Manager */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select 
                  value={fileFilter} 
                  onValueChange={(value: FileFilter) => setFileFilter(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={sortBy} 
                  onValueChange={(value: SortBy) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredFiles.map(file => (
                      <div key={file.id} className="border rounded-lg p-3 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="text-sm font-medium truncate">
                              {file.name}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>

                        {file.type.startsWith('image/') && file.url && (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded"
                          />
                        )}

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{file.uploadedAt.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => shareFile(file)}
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
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
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(file.type)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => shareFile(file)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteFile(file.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredFiles.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No files found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {files.length} file(s) • {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onFilesUploaded(files)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}