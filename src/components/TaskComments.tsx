
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Edit2, Trash2, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileUpload } from '@/components/FileUpload';

interface TaskCommentsProps {
  taskId: string;
  defaultOpen?: boolean;
}

export function TaskComments({ taskId, defaultOpen = false }: TaskCommentsProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [attachments, setAttachments] = useState<Array<{url: string, name: string, type: string}>>([]);

  const {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    isAddingComment,
    isUpdatingComment,
    isDeletingComment,
  } = useTaskComments(taskId);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment({
        task_id: taskId,
        content: newComment.trim(),
        attachments: attachments,
      });
      setNewComment('');
      setAttachments([]);
    }
  };

  const handleFileUpload = (fileUrl: string, fileName: string, fileType: string) => {
    setAttachments(prev => [...prev, { url: fileUrl, name: fileName, type: fileType }]);
  };

  const handleEditComment = (commentId: string) => {
    if (editingContent.trim()) {
      updateComment({ commentId, content: editingContent.trim() });
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const startEdit = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between p-3 h-auto bg-gradient-to-r from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 rounded border border-border/30 hover:border-border"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-primary" />
            Comments ({comments.length})
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3 animate-accordion-down">
        <div className="bg-gradient-to-br from-muted/10 to-muted/20 border-l-4 border-l-primary rounded-r border border-border/30 p-4 space-y-4">
          {/* Add New Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none bg-background/80 border-border/50 focus:border-primary transition-colors text-sm"
            />
            <div className="flex items-center justify-between">
              <FileUpload 
                onFileUpload={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                maxSize={20}
                multiple={true}
                taskId={taskId}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                size="sm"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                {isAddingComment ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                <p className="text-xs text-muted-foreground mt-1">Loading...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No comments yet</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-background/80 rounded-lg p-4 border border-border/20 space-y-3 animate-fade-in shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.user_profile?.avatar_url} />
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                          {comment.user_profile?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-sm text-foreground">
                            {comment.user_profile?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={3}
                              className="text-sm resize-none bg-background border-border/50 focus:border-primary"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editingContent.trim() || isUpdatingComment}
                                size="sm"
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-2">
                              {comment.content}
                            </p>
                            
                            {/* Attachments */}
                            {comment.attachments && Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Attachments:</p>
                                <div className="flex flex-wrap gap-2">
                                  {comment.attachments.map((attachment: any, index: number) => (
                                    <a
                                      key={index}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs bg-muted/50 hover:bg-muted/70 rounded px-2 py-1 transition-colors"
                                    >
                                      <Download className="h-3 w-3" />
                                      {attachment.name}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {comment.user_id === profile?.id && editingCommentId !== comment.id && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          onClick={() => startEdit(comment.id, comment.content)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted/50"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => deleteComment(comment.id)}
                          size="sm"
                          variant="ghost"
                          disabled={isDeletingComment}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
