import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Paperclip, FileText, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { profile } = useAuth();
  const { comments, addComment, isAddingComment } = useTaskComments(taskId);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitComment = async () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      let attachments: any[] = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          attachments.push({
            name: file.name,
            path: uploadData.path,
            size: file.size,
            type: file.type,
          });
        }
      }
      
      await addComment({
        task_id: taskId,
        content: newComment,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      
      setNewComment('');
      setSelectedFiles([]);
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(attachment.path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="space-y-8 bg-gradient-to-br from-background via-muted/10 to-primary/5 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-500">
      <CardHeader 
        className="cursor-pointer hover:bg-primary/5 transition-colors duration-300 rounded-xl -m-1 p-6 group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-black text-primary flex items-center gap-3 group-hover:scale-105 transition-transform duration-300">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-6 w-6" />
            </div>
            Comments ({comments?.length || 0})
          </CardTitle>
          <Button variant="ghost" size="lg" className="hover:bg-primary/15 hover:scale-110 transition-all duration-300 rounded-full">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-8">
          {/* Comment List - Ultra Prominent */}
          <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id} className="p-6 bg-gradient-to-br from-background via-background/95 to-muted/20 hover:shadow-lg transition-all duration-300 border-2 border-border/30 hover:border-primary/30 hover:scale-[1.02] transform">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12 ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={comment.user_profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary font-black text-lg">
                        {comment.user_profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-foreground text-lg">
                            {comment.user_profile?.full_name || 'Unknown User'}
                          </span>
                          <Badge variant="outline" className="text-sm font-bold px-3 py-1">
                            User
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap font-medium bg-muted/20 p-4 rounded-lg border border-border/30">
                        {comment.content}
                      </p>
                      
                      {/* Attachments - Enhanced */}
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {comment.attachments.map((attachment: any, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary/20 transition-all duration-300 hover:scale-110 p-3 text-sm font-bold"
                              onClick={() => handleDownloadAttachment(attachment)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              {attachment.name}
                              <Download className="h-4 w-4 ml-2" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No comments yet. Be the first to comment!</p>
                </div>
              </div>
            )}
          </div>

          {/* Add Comment Form - Ultra Enhanced */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-muted/10 border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-14 w-14 ring-4 ring-primary/30">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary font-black text-xl">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Share your thoughts, updates, or questions..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[120px] resize-none border-2 border-primary/30 focus:border-primary focus:ring-primary/30 bg-background/80 backdrop-blur-sm text-base font-medium"
                  />
                  
                  {/* File Upload - Enhanced */}
                  <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/30">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:bg-primary/15 border-2 border-primary/30 hover:border-primary/50 font-bold transition-all duration-300 hover:scale-105"
                      >
                        <Paperclip className="h-5 w-5 mr-2" />
                        Attach Files
                      </Button>
                      {selectedFiles.length > 0 && (
                        <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                          {selectedFiles.length} file(s) selected
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleSubmitComment}
                      disabled={(!newComment.trim() && selectedFiles.length === 0) || isAddingComment || isUploading}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-black px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {(isAddingComment || isUploading) ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Posting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Send className="h-5 w-5" />
                          Post Comment
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  {/* Selected Files Preview - Enhanced */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 p-4 bg-muted/20 rounded-xl border-2 border-border/30">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 bg-background px-4 py-3 rounded-lg border-2 border-border/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-bold">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="p-2 h-auto hover:bg-red-100 hover:text-red-600 rounded-full transition-all duration-300 hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </CardContent>
      )}
    </Card>
  );
}