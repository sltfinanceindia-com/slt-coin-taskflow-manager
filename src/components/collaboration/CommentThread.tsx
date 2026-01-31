/**
 * Comment Thread
 * Comments with replies and @mentions
 */

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityComments, EntityComment } from '@/hooks/useEntityComments';
import { MentionInput } from './MentionInput';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Flag,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentThreadProps {
  entityType: string;
  entityId: string;
  title?: string;
  allowDecisions?: boolean;
  className?: string;
}

export function CommentThread({ 
  entityType, 
  entityId, 
  title = 'Comments',
  allowDecisions = true,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isDecision, setIsDecision] = useState(false);
  const { comments, isLoading, addComment, markAsDecision, isAdding } = useEntityComments(entityType as any, entityId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Extract mentions from the comment
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      mentions.push(match[2]); // User ID
    }

    addComment({
      entity_type: entityType as any,
      entity_id: entityId,
      content: newComment,
      mentions: mentions.length > 0 ? mentions : undefined,
      is_decision: isDecision,
    });
    setNewComment('');
    setIsDecision(false);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {comments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            placeholder="Add a comment... Use @ to mention someone"
            className="min-h-[80px]"
          />
          <div className="flex items-center justify-between">
            {allowDecisions && (
              <Button
                type="button"
                variant={isDecision ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsDecision(!isDecision)}
                className="gap-1"
              >
                <Flag className="h-4 w-4" />
                Mark as Decision
              </Button>
            )}
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newComment.trim() || isAdding}
              className="ml-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {isDecision ? 'Log Decision' : 'Comment'}
            </Button>
          </div>
        </form>

        <Separator />

        {/* Comments List */}
        <ScrollArea className="max-h-[400px]">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2 text-sm">No comments yet</p>
              <p className="text-xs">Be the first to comment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment}
                  onMarkAsDecision={() => markAsDecision(comment.id)}
                  allowDecisions={allowDecisions}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface CommentItemProps {
  comment: EntityComment;
  onMarkAsDecision: () => void;
  allowDecisions: boolean;
}

function CommentItem({ comment, onMarkAsDecision, allowDecisions }: CommentItemProps) {
  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg transition-colors",
      comment.is_decision && "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {comment.user?.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.user?.full_name || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_decision && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Decision
              </Badge>
            )}
          </div>

          {allowDecisions && !comment.is_decision && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onMarkAsDecision}>
                  <Flag className="h-4 w-4 mr-2" />
                  Mark as Decision
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="mt-1 text-sm whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {comment.attachments.map((attachment, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                📎 {typeof attachment === 'object' && attachment !== null ? (attachment as any).name || 'Attachment' : String(attachment)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
