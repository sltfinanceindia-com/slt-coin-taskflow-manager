import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    isAdding,
    isUpdating,
    isDeleting,
  } = useTaskComments(taskId);

  // Smooth open/close transitions
  const [parent] = useAutoAnimate();

  // Auto-focus textarea when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      addComment({ task_id: taskId, content: newComment.trim() });
      setNewComment('');
    }
  }, [newComment, addComment, taskId]);

  const handleEditComment = useCallback(() => {
    if (editingCommentId && editingContent.trim()) {
      updateComment({ commentId: editingCommentId, content: editingContent.trim() });
      setEditingCommentId(null);
      setEditingContent('');
    }
  }, [editingCommentId, editingContent, updateComment]);

  const startEdit = useCallback(
    (commentId: string, currentContent: string) => {
      setEditingCommentId(commentId);
      setEditingContent(currentContent);
    },
    []
  );

  const cancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={clsx(
            'w-full justify-between p-2 font-mono',
            'bg-gradient-to-r from-muted/20 to-muted/30',
            'hover:from-muted/30 hover:to-muted/40 rounded border border-border/30',
            'hover:shadow-sm hover:border-border/40 text-xs font-medium',
            'transition-all duration-200 ease-in-out'
          )}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3 w-3 text-primary" />
            Comments <span className="bg-primary/10 rounded-full px-1.5">{comments.length}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </CollapsibleTrigger>

      <motion.div
        className={clsx(
          'mt-2 p-2 bg-gradient-to-br from-muted/5 to-muted/10',
          'border-l-4 border-l-primary/90 rounded-r border border-border/30',
          'space-y-2 transition-all duration-200'
        )}
        initial={{ opacity: 0, height: 0, transform: 'translateY(-8px)' }}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
        }}
        exit={{ opacity: 0, height: 0, transform: 'translateY(-8px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Add New Comment */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Textarea
            ref={textareaRef}
            placeholder={profile ? 'Add a comment...' : 'Sign in to comment'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!profile}
            rows={2}
            className={clsx(
              'resize-none bg-background/90 text-xs border-border/40',
              'focus:border-primary focus:ring-1 focus:ring-primary/20',
              'transition-all duration-150 ease-in-out'
            )}
          />
          <Button
            onClick={handleAddComment}
            disabled={!profile || !newComment.trim() || isAdding}
            size="sm"
            className={clsx(
              'w-full gap-1 transition-all duration-200',
              'from-primary/90 to-primary/70 hover:from-primary/100 hover:to-primary/80',
              'text-xs h-7 font-medium text-primary-foreground',
              isAdding ? 'animate-pulse' : ''
            )}
          >
            <Send className="h-3 w-3" />
            {isAdding ? 'Adding...' : 'Add Comment'}
          </Button>
        </motion.div>

        {/* Comments List */}
        <div
          ref={parent}
          className="space-y-2 max-h-48 overflow-y-auto overscroll-contain custom-scrollbar"
        >
          {isLoading ? (
            <motion.div
              className="text-center py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
              <p className="text-xs text-muted-foreground mt-1">Loading comments...</p>
            </motion.div>
          ) : comments.length === 0 ? (
            <motion.div
              className="text-center py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <MessageSquare className="h-6 w-6 text-muted-foreground/60 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground/80">
                No comments yet for this task.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={clsx(
                    'bg-background/60 rounded p-2 border border-border/20',
                    'space-y-1.5 shadow-sm hover:shadow-md transition-all duration-150',
                    'group hover:border-border/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={comment.user_profile?.avatar_url} alt="" />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {comment.user_profile?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                            {comment.user_profile?.full_name || 'Unknown User'}
                          </p>
                          <span className="text-[10px] text-muted-foreground/75 flex-shrink-0">
                            {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="animate-fade-in space-y-1.5 mt-1">
                            <Textarea
                              autoFocus
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={2}
                              className="text-xs resize-none bg-background border-border/50 focus:border-primary"
                            />
                            <div className="flex gap-1">
                              <Button
                                onClick={handleEditComment}
                                disabled={!editingContent.trim() || isUpdating}
                                size="sm"
                                className="text-xs h-6 px-2"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                size="sm"
                                variant="outline"
                                className="text-xs h-6 px-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed mt-0.5">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {comment.user_id === profile?.id && editingCommentId !== comment.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button
                          onClick={() => startEdit(comment.id, comment.content)}
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 hover:bg-muted/50"
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          onClick={() => deleteComment(comment.id)}
                          size="sm"
                          variant="ghost"
                          disabled={isDeleting}
                          className="h-5 w-5 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </Collapsible>
  );
}
