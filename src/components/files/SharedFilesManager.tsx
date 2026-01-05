import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  File, FileText, Image, Download, Trash2, Share2, Search,
  Upload, Eye, Folder, Clock, User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SharedFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  shared_with: string[];
  is_public: boolean;
  created_at: string;
  uploader?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function SharedFilesManager() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Fetch files from storage
  const { data: files, isLoading } = useQuery({
    queryKey: ['shared-files', profile?.organization_id],
    queryFn: async () => {
      // First get the list of files from the organization's bucket folder
      const { data: storageFiles, error } = await supabase
        .storage
        .from('organization-files')
        .list(`${profile?.organization_id}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      // Map storage files to our format
      return (storageFiles || []).map(file => ({
        id: file.id || file.name,
        name: file.name,
        file_path: `${profile?.organization_id}/${file.name}`,
        file_type: getFileType(file.name),
        file_size: file.metadata?.size || 0,
        uploaded_by: file.metadata?.uploadedBy || '',
        shared_with: [],
        is_public: false,
        created_at: file.created_at || new Date().toISOString(),
      })) as SharedFile[];
    },
    enabled: !!profile?.organization_id,
  });

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(ext)) return 'presentation';
    return 'file';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-pink-500" />;
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
      case 'document': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'spreadsheet': return <FileText className="h-8 w-8 text-green-500" />;
      case 'presentation': return <FileText className="h-8 w-8 text-orange-500" />;
      default: return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file: SharedFile) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('organization-files')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handlePreview = async (file: SharedFile) => {
    try {
      const { data } = await supabase
        .storage
        .from('organization-files')
        .getPublicUrl(file.file_path);

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to preview file');
    }
  };

  const handleDelete = async (file: SharedFile) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase
        .storage
        .from('organization-files')
        .remove([file.file_path]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['shared-files'] });
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filePath = `${profile?.organization_id}/${Date.now()}_${file.name}`;
      
      const { error } = await supabase
        .storage
        .from('organization-files')
        .upload(filePath, file, {
          metadata: {
            uploadedBy: profile?.id,
            uploadedByName: profile?.full_name,
          },
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['shared-files'] });
      setIsUploadOpen(false);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  };

  const filteredFiles = files?.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shared Files</h2>
          <p className="text-muted-foreground">Manage and share files with your team</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop a file here, or click to browse
                </p>
                <Input
                  type="file"
                  onChange={handleUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Files Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            All Files ({filteredFiles?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredFiles?.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFiles?.map((file) => (
                  <Card 
                    key={file.id} 
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      selectedFile?.id === file.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedFile(file)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(file.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(file.file_size)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {file.file_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-3 pt-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(file);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Share feature coming soon');
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
