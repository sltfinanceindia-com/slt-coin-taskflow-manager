import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText, 
  Download, 
  Share, 
  Trash, 
  Eye,
  X,
  Paperclip,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  FolderPlus,
  Star,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  uploaded_at: string;
  shared_in_channel?: string;
  shared_in_message?: string;
}

interface EnhancedFileShareProps {
  channelId?: string;
  onFileSelect?: (file: FileItem) => void;
  className?: string;
}

export default function EnhancedFileShare({ channelId, onFileSelect, className }: EnhancedFileShareProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState<FileItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'videos'>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (selectedFiles: FileList) => {
    if (!profile || !selectedFiles.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        // Save file metadata to database
        const { data: fileData, error: dbError } = await supabase
          .from('message_attachments')
          .insert({
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
            message_id: null // Will be set when attached to a message
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Update progress
        setUploadProgress(((index + 1) / selectedFiles.length) * 100);

        return {
          id: fileData.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: urlData.publicUrl,
          uploaded_by: profile.id,
          uploaded_at: new Date().toISOString()
        } as FileItem;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles(prev => [...uploadedFiles, ...prev]);

      toast({
        title: "Upload Complete",
        description: `${uploadedFiles.length} file(s) uploaded successfully`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('message_attachments')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: "File Deleted",
        description: "File has been removed"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete file",
        variant: "destructive"
      });
    }
  };

  const handleShareFile = async (file: FileItem) => {
    if (onFileSelect) {
      onFileSelect(file);
    } else {
      // Copy link to clipboard
      await navigator.clipboard.writeText(file.url);
      toast({
        title: "Link Copied",
        description: "File link copied to clipboard"
      });
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && file.type.startsWith('image/')) ||
      (filterType === 'documents' && (file.type.includes('pdf') || file.type.includes('document'))) ||
      (filterType === 'videos' && file.type.startsWith('video/'));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">File Sharing</h2>
          <p className="text-muted-foreground">Share and manage files across your team</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button onClick={handleFileSelect} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search files..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'images' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('images')}
          >
            Images
          </Button>
          <Button
            variant={filterType === 'documents' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('documents')}
          >
            Documents
          </Button>
          <Button
            variant={filterType === 'videos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('videos')}
          >
            Videos
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleFileSelect}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
            <p className="text-muted-foreground">
              Support for images, documents, videos and more. Max file size: 50MB
            </p>
            
            {isUploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx"
          />
        </CardContent>
      </Card>

      {/* Files Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Shared Files ({filteredFiles.length})</span>
            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                  Clear Selection ({selectedFiles.length})
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFiles.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" 
                : "space-y-2"
            )}>
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "border rounded-lg p-4 hover:bg-muted/50 transition-colors group",
                    viewMode === 'list' && "flex items-center gap-4",
                    selectedFiles.includes(file.id) && "bg-primary/10 border-primary"
                  )}
                >
                  {viewMode === 'grid' ? (
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded"
                            onClick={() => setSelectedFilePreview(file)}
                          />
                        ) : (
                          getFileIcon(file.type)
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(file.uploaded_at), 'MMM d')}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedFilePreview(file)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleShareFile(file)}>
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => window.open(file.url, '_blank')}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteFile(file.id)}>
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{format(new Date(file.uploaded_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFilePreview(file)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShareFile(file)}>
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload files to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleFileSelect}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      {selectedFilePreview && (
        <Dialog open={!!selectedFilePreview} onOpenChange={() => setSelectedFilePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedFilePreview.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFilePreview(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {selectedFilePreview.type.startsWith('image/') ? (
                  <img
                    src={selectedFilePreview.url}
                    alt={selectedFilePreview.name}
                    className="max-w-full max-h-96 object-contain"
                  />
                ) : selectedFilePreview.type.startsWith('video/') ? (
                  <video
                    src={selectedFilePreview.url}
                    controls
                    className="max-w-full max-h-96"
                  />
                ) : (
                  <div className="text-center py-12">
                    {getFileIcon(selectedFilePreview.type)}
                    <p className="mt-4 text-muted-foreground">
                      Preview not available for this file type
                    </p>
                    <Button className="mt-4" onClick={() => window.open(selectedFilePreview.url, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Size: {formatFileSize(selectedFilePreview.size)}</p>
                  <p>Uploaded: {format(new Date(selectedFilePreview.uploaded_at), 'PPpp')}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => handleShareFile(selectedFilePreview)}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={() => window.open(selectedFilePreview.url, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}