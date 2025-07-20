import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      
      addComment({
        task_id: taskId,
        content: newComment.trim(),
        attachments,
      });
      
      setNewComment('');
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: "Error uploading files",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadAttachment = async (attachment: any) => {
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
      toast({
        title: "Error downloading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border border-blue-200/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-3 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <span className="font-semibold">Comments</span>
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1">
                {comments.length}
              </Badge>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-blue-100/50 text-blue-700 hover:text-blue-800 transition-all duration-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6 animate-accordion-down">
          {/* Existing Comments */}
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No comments yet</p>
                <p className="text-xs text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="bg-white/70 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={comment.user_profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold">
                          {comment.user_profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">
                            {comment.user_profile?.full_name || 'Unknown User'}
                          </span>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50">
                            {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 bg-gray-50/50 p-3 rounded-lg">
                          {comment.content}
                        </p>
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Attachments:</p>
                            {comment.attachments.map((attachment: any, index: number) => (
                              <div key={index} className="flex items-center gap-3 text-xs bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-200/50">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="flex-1 truncate font-medium text-blue-800">{attachment.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  onClick={() => downloadAttachment(attachment)}
                                >
                                  <Download className="h-3 w-3 text-blue-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add New Comment */}
          <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 font-semibold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or provide updates..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500 border-blue-200 bg-white/80 transition-all duration-200"
                  />
                  
                  {/* File Attachments Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Attachments:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-2">
                          <FileText className="h-4 w-4" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(file.size / 1024)}KB
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-200"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach File
                      </Button>
                    </div>
                    <Button
                      onClick={handleSubmitComment}
                      disabled={(!newComment.trim() && selectedFiles.length === 0) || isAddingComment || isUploading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : isAddingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      )}
    </Card>
  );
}
