
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

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
      });
      setNewComment('');
    }
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
          className="w-full justify-between p-3 h-auto bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 transition-all duration-300 rounded-lg border border-border/50 hover:border-border"
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
        <Card className="bg-gradient-to-br from-muted/20 to-muted/30 border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* Add New Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none bg-background/80 border-border/50 focus:border-primary transition-colors"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                size="sm"
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                {isAddingComment ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground">Be the first to add a comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-background/60 rounded-lg p-3 border border-border/30 space-y-2 animate-fade-in">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={comment.user_profile?.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {comment.user_profile?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-foreground truncate">
                              {comment.user_profile?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground flex-shrink-0">
                              {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                          
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                rows={2}
                                className="text-sm resize-none bg-background border-border/50 focus:border-primary"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={!editingContent.trim() || isUpdatingComment}
                                  size="sm"
                                  variant="default"
                                  className="text-xs h-7"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={cancelEdit}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {comment.user_id === profile?.id && editingCommentId !== comment.id && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            onClick={() => startEdit(comment.id, comment.content)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-muted/50"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => deleteComment(comment.id)}
                            size="sm"
                            variant="ghost"
                            disabled={isDeletingComment}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
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
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
