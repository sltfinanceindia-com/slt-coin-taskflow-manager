import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Download,
  Upload,
  Clock,
  Eye,
  GitBranch,
  FileImage,
  FileVideo,
  File
} from 'lucide-react';
import { useFileVersions, FileVersion } from '@/hooks/useFileVersions';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VersionHistoryProps {
  taskId?: string;
  projectId?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return FileImage;
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return FileVideo;
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const VersionHistory = ({ taskId, projectId }: VersionHistoryProps) => {
  const { versions, isLoading, uploadVersion } = useFileVersions(taskId, projectId);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [selectedOriginalId, setSelectedOriginalId] = useState<string | null>(null);

  // Group versions by original file
  const groupedVersions = versions.reduce((acc, version) => {
    const key = version.original_file_id || version.id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(version);
    return acc;
  }, {} as Record<string, FileVersion[]>);

  const handleUpload = async () => {
    if (!selectedFile) return;

    await uploadVersion.mutateAsync({
      file: selectedFile,
      taskId,
      projectId,
      changeDescription,
      originalFileId: selectedOriginalId || undefined,
    });

    setUploadDialogOpen(false);
    setSelectedFile(null);
    setChangeDescription('');
    setSelectedOriginalId(null);
  };

  const handleDownload = async (version: FileVersion) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(version.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = version.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the file',
        variant: 'destructive',
      });
    }
  };

  const renderVersion = (version: FileVersion, isLatest: boolean) => {
    const FileIcon = getFileIcon(version.file_name);

    return (
      <div
        key={version.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
          isLatest ? 'border-primary/50 bg-primary/5' : 'border-border'
        }`}
      >
        <div className="p-2 rounded-lg bg-muted">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{version.file_name}</span>
            <Badge variant="outline" className="text-xs">
              v{version.version_number}
            </Badge>
            {isLatest && (
              <Badge variant="default" className="text-xs">Latest</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              <AvatarImage src={version.uploader?.avatar_url || undefined} />
              <AvatarFallback className="text-[8px]">
                {version.uploader?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <span>{version.uploader?.full_name}</span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}</span>
            <span>•</span>
            <span>{formatFileSize(version.file_size)}</span>
          </div>

          {version.change_description && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              "{version.change_description}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDownload(version)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedOriginalId(version.original_file_id || version.id);
              setUploadDialogOpen(true);
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version History
          </CardTitle>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setSelectedOriginalId(null)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedOriginalId ? 'Upload New Version' : 'Upload File'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Change Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what changed..."
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadVersion.isPending}
                >
                  {uploadVersion.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : Object.keys(groupedVersions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedVersions).map(([key, fileVersions]) => (
                <div key={key} className="space-y-2">
                  {fileVersions.length > 1 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-3">
                      <GitBranch className="h-3 w-3" />
                      <span>{fileVersions.length} versions</span>
                    </div>
                  )}
                  {fileVersions.map((version, index) => 
                    renderVersion(version, index === 0)
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
