import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  MapPin,
  Square,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  Move,
  Send
} from 'lucide-react';
import { useFileAnnotations, FileAnnotation } from '@/hooks/useFileVersions';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface FileProofingProps {
  fileVersionId: string;
  fileUrl: string;
  fileName: string;
}

type AnnotationTool = 'select' | 'pin' | 'comment' | 'highlight';

export const FileProofing = ({ fileVersionId, fileUrl, fileName }: FileProofingProps) => {
  const { annotations, isLoading, createAnnotation, resolveAnnotation } = useFileAnnotations(fileVersionId);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
  const [zoom, setZoom] = useState(1);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Load image from storage
  useEffect(() => {
    const loadImage = async () => {
      try {
        const { data } = await supabase.storage
          .from('task-attachments')
          .createSignedUrl(fileUrl, 3600);

        if (data?.signedUrl) {
          setImageSrc(data.signedUrl);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage();
  }, [fileUrl]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'select') return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingAnnotation({ x, y });
  };

  const handleAddAnnotation = () => {
    if (!pendingAnnotation || !newComment.trim()) return;

    createAnnotation.mutate({
      annotation_type: activeTool,
      position_data: pendingAnnotation,
      content: newComment.trim(),
    });

    setPendingAnnotation(null);
    setNewComment('');
  };

  const handleResolve = (annotationId: string) => {
    resolveAnnotation.mutate(annotationId);
    setSelectedAnnotation(null);
  };

  const openAnnotations = annotations.filter(a => a.status === 'open');
  const resolvedAnnotations = annotations.filter(a => a.status === 'resolved');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Image Area */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg truncate">{fileName}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool('select')}
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'pin' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool('pin')}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === 'comment' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool('comment')}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={containerRef}
              className="relative bg-muted rounded-lg overflow-hidden cursor-crosshair"
              style={{ 
                height: '500px',
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
              onClick={handleCanvasClick}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={fileName}
                  className="w-full h-full object-contain"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Loading image...
                </div>
              )}

              {/* Render annotations */}
              {imageLoaded && annotations.map(annotation => (
                <div
                  key={annotation.id}
                  className={`absolute cursor-pointer transition-transform hover:scale-110 ${
                    annotation.status === 'resolved' ? 'opacity-50' : ''
                  }`}
                  style={{
                    left: `${annotation.position_data.x}%`,
                    top: `${annotation.position_data.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotation(annotation.id);
                  }}
                >
                  <div className={`p-1 rounded-full ${
                    annotation.status === 'resolved' 
                      ? 'bg-green-500' 
                      : selectedAnnotation === annotation.id 
                        ? 'bg-primary' 
                        : 'bg-orange-500'
                  }`}>
                    {annotation.annotation_type === 'pin' ? (
                      <MapPin className="h-4 w-4 text-white" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              ))}

              {/* Pending annotation */}
              {pendingAnnotation && (
                <div
                  className="absolute"
                  style={{
                    left: `${pendingAnnotation.x}%`,
                    top: `${pendingAnnotation.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="p-1 rounded-full bg-primary animate-pulse">
                    <MapPin className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Add annotation form */}
            {pendingAnnotation && (
              <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={handleAddAnnotation} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPendingAnnotation(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Annotations Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Annotations
              <Badge variant="outline">{openAnnotations.length} open</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : openAnnotations.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No annotations yet</p>
                  <p className="text-xs">Click on the image to add one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {openAnnotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAnnotation === annotation.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={annotation.user?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {annotation.user?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {annotation.user?.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(annotation.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{annotation.content}</p>
                        </div>
                      </div>
                      {selectedAnnotation === annotation.id && (
                        <div className="mt-2 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(annotation.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {resolvedAnnotations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Resolved ({resolvedAnnotations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {resolvedAnnotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className="p-2 rounded-lg bg-muted/50 opacity-60"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm truncate">{annotation.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
