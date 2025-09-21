import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageSkeleton, TypingSkeleton } from './SkeletonLoaders';

interface InfiniteMessageScrollProps {
  messages: any[];
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  children: React.ReactNode;
  className?: string;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
  typingUsers?: any[];
}

export default function InfiniteMessageScroll({
  messages,
  onLoadMore,
  hasMore,
  isLoading,
  isLoadingMore,
  children,
  className,
  showScrollToBottom = true,
  onScrollToBottom,
  typingUsers = []
}: InfiniteMessageScrollProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Observer for loading more messages when scrolling to top
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px'
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    setupIntersectionObserver();
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [setupIntersectionObserver]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && showScrollToBottom);
    
    // Disable auto-scroll if user scrolls up manually
    if (distanceFromBottom > 200) {
      setAutoScroll(false);
    }
  }, [showScrollToBottom]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messages.length > lastMessageCount && (autoScroll || isNearBottom)) {
      scrollToBottom();
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, autoScroll, isNearBottom]);

  // Re-enable auto-scroll when user scrolls to bottom
  useEffect(() => {
    if (isNearBottom) {
      setAutoScroll(true);
    }
  }, [isNearBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
    onScrollToBottom?.();
    setAutoScroll(true);
  }, [onScrollToBottom]);

  if (isLoading) {
    return (
      <div className={cn("flex-1 overflow-hidden", className)}>
        <div className="h-full space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 relative overflow-hidden", className)}>
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-full"
        onScrollCapture={handleScroll}
      >
        <div className="relative">
          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading older messages...</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Scroll up to load more messages
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="min-h-0">
            {children}
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <TypingSkeleton />
          )}

          {/* Bottom Spacer */}
          <div className="h-4" />
        </div>
      </ScrollArea>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="sm"
            onClick={() => scrollToBottom()}
            className="rounded-full shadow-lg hover-scale bg-primary/90 backdrop-blur-sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* New Message Indicator */}
      {!autoScroll && messages.length > lastMessageCount && (
        <div className="absolute bottom-16 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scrollToBottom()}
            className="rounded-full shadow-lg hover-scale bg-secondary/90 backdrop-blur-sm"
          >
            New messages ↓
          </Button>
        </div>
      )}

      {/* Scroll Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{
            width: `${Math.min(100, ((scrollAreaRef.current?.scrollTop || 0) / 
              Math.max(1, (scrollAreaRef.current?.scrollHeight || 1) - (scrollAreaRef.current?.clientHeight || 0))) * 100)}%`
          }}
        />
      </div>
    </div>
  );
}