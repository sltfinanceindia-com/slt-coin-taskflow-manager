import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { VariableSizeList } from 'react-window';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import QuickActions from './QuickActions';
import { MessageSkeleton } from './SkeletonLoaders';

interface VirtualizedMessageListProps {
  messages: any[];
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentUser: any;
  onMessageAction?: (action: string, messageId: string) => void;
  className?: string;
  estimatedItemSize?: number;
  overscan?: number;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: any[];
    currentUser: any;
    onMessageAction?: (action: string, messageId: string) => void;
    getItemSize: (index: number) => number;
  };
}

function MessageItem({ index, style, data }: MessageItemProps) {
  const { messages, currentUser, onMessageAction } = data;
  const message = messages[index];
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!message) {
    return (
      <div style={style}>
        <MessageSkeleton />
      </div>
    );
  }

  const isOwn = message.sender_id === currentUser?.id;
  const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div ref={itemRef} style={style} className="px-4 py-2">
      {isVisible ? (
        <div className={cn(
          "group flex gap-3 hover:bg-muted/30 transition-colors rounded-lg p-2",
          isOwn && "flex-row-reverse"
        )}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            {showAvatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender_id === currentUser?.id ? currentUser?.avatar_url : undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(message.sender_name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8" />
            )}
          </div>

          {/* Message Content */}
          <div className={cn("flex-1 min-w-0", isOwn && "text-right")}>
            {/* Sender info */}
            {showAvatar && (
              <div className={cn("flex items-center gap-2 mb-1", isOwn && "justify-end")}>
                <span className="text-sm font-semibold text-foreground">
                  {message.sender_name || 'Unknown User'}
                </span>
                {message.sender_role && (
                  <Badge variant="secondary" className="text-xs">
                    {message.sender_role}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.created_at)}
                </span>
              </div>
            )}

            {/* Message bubble */}
            <div className={cn(
              "inline-block max-w-[70%] rounded-lg px-3 py-2 text-sm relative",
              isOwn 
                ? "bg-primary text-primary-foreground ml-auto" 
                : "bg-muted text-foreground"
            )}>
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {/* Message metadata */}
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.is_edited && <span>(edited)</span>}
                {!showAvatar && <span>{formatTime(message.created_at)}</span>}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1">
                    {message.reactions.map((reaction: any, idx: number) => (
                      <span key={idx} className="bg-background/20 rounded px-1">
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions - Only show on hover for performance */}
              <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <QuickActions
                  onReply={() => onMessageAction?.('reply', message.id)}
                  onEdit={() => onMessageAction?.('edit', message.id)}
                  onDelete={() => onMessageAction?.('delete', message.id)}
                  onPin={() => onMessageAction?.('pin', message.id)}
                  onStar={() => onMessageAction?.('star', message.id)}
                  onReact={(emoji) => onMessageAction?.('react', message.id)}
                  canEdit={isOwn}
                  canDelete={isOwn}
                  showInline={true}
                  className="bg-background/95 backdrop-blur-sm shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MessageSkeleton />
      )}
    </div>
  );
}

export default function VirtualizedMessageList({
  messages,
  onLoadMore,
  hasMore,
  isLoading,
  isLoadingMore,
  currentUser,
  onMessageAction,
  className,
  estimatedItemSize = 80,
  overscan = 5
}: VirtualizedMessageListProps) {
  const listRef = useRef<VariableSizeList>(null);
  const [itemSizes, setItemSizes] = useState<Map<number, number>>(new Map());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Memoized data for virtual list
  const itemData = useMemo(() => ({
    messages,
    currentUser,
    onMessageAction,
    getItemSize: (index: number) => itemSizes.get(index) || estimatedItemSize
  }), [messages, currentUser, onMessageAction, itemSizes, estimatedItemSize]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (isAtBottom && listRef.current && messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToItem(messages.length - 1, 'end');
      }, 100);
    }
  }, [messages.length, isAtBottom]);

  // Handle scroll events
  const handleScroll = useCallback(({
    scrollDirection,
    scrollOffset,
    scrollUpdateWasRequested
  }: any) => {
    if (!scrollUpdateWasRequested) {
      // Simple scroll detection for loading more
      if (scrollOffset < 100 && hasMore && !isLoadingMore) {
        onLoadMore();
      }
      
      setIsAtBottom(scrollOffset > 500);
      setShowScrollToBottom(scrollOffset < 400);
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Dynamic item size calculation
  const getItemSize = useCallback((index: number) => {
    return itemSizes.get(index) || estimatedItemSize;
  }, [itemSizes, estimatedItemSize]);

  // Scroll to bottom handler
  const scrollToBottom = useCallback(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
      setIsAtBottom(true);
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h3 className="font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm">
              Start the conversation! Send the first message.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 relative", className)}>
      {/* Load more indicator */}
      {isLoadingMore && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading older messages...</span>
          </div>
        </div>
      )}

      {/* Virtual scrolling list */}
      <VariableSizeList
        ref={listRef}
        height={600}
        width="100%"
        itemCount={messages.length}
        itemSize={getItemSize}
        itemData={itemData}
        onScroll={handleScroll}
        overscanCount={overscan}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
      >
        {MessageItem}
      </VariableSizeList>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg hover-scale bg-primary/90 backdrop-blur-sm"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            <span className="text-xs">New messages</span>
          </Button>
        </div>
      )}

      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          {messages.length} messages • Virtual scrolling active
        </div>
      )}
    </div>
  );
}