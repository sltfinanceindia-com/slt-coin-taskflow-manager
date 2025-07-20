
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Paperclip, FileText, Download, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [isOpen, setIsOpen] = useState(false);
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between p-3 h-auto bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 transition-all duration-300 rounded-lg border border-border/50 hover:border-border animate-fade-in"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="h-4 w-4 text-primary" />
            Comments ({comments?.length || 0})
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3 animate-accordion-down">
        <Card className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border-l-4 border-l-primary/30 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* Comment List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-border/30 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                        <AvatarImage src={comment.user_profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {comment.user_profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {comment.user_profile?.full_name || 'Unknown User'}
                            </span>
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              User
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-2 rounded border border-border/20">
                          {comment.content}
                        </p>
                        
                        {/* Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {comment.attachments.map((attachment: any, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary/20 transition-all duration-200 hover:scale-105 text-xs"
                                onClick={() => handleDownloadAttachment(attachment)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {attachment.name}
                                <Download className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="p-4 bg-muted/10 rounded-lg border border-dashed border-muted-foreground/20">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet. Be the first to comment!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="space-y-3 pt-3 border-t border-border/20">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts, updates, or questions..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none border border-primary/20 focus:border-primary focus:ring-primary/20 bg-background/80 text-sm"
                  />
                  
                  {/* File Upload */}
                  <div className="flex items-center justify-between bg-muted/20 p-2 rounded border border-border/20">
                    <div className="flex items-center gap-2">
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
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:bg-primary/10 border border-primary/20 hover:border-primary/30 text-xs"
                      >
                        <Paperclip className="h-3 w-3 mr-1" />
                        Attach
                      </Button>
                      {selectedFiles.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedFiles.length} file(s)
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleSubmitComment}
                      disabled={(!newComment.trim() && selectedFiles.length === 0) || isAddingComment || isUploading}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-xs px-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {(isAddingComment || isUploading) ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Posting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-3 w-3" />
                          Post
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-muted/10 rounded border border-border/20">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-background px-2 py-1 rounded border border-border/30 text-xs">
                          <FileText className="h-3 w-3 text-primary" />
                          <span className="font-medium truncate max-w-20">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 h-auto hover:bg-red-100 hover:text-red-600 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
