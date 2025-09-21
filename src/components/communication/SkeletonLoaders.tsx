import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3 p-4", className)}>
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ChannelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-2", className)}>
      <Skeleton className="h-4 w-4" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  );
}

export function MemberSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-2", className)}>
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
  );
}

export function ChatAreaSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-border">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="h-full bg-card">
      {/* Search Skeleton */}
      <div className="p-4 border-b border-border">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Tabs Skeleton */}
      <div className="p-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="px-2 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <ChannelSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DetailsPanelSkeleton() {
  return (
    <div className="h-full bg-card">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Channel Info Skeleton */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="p-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Members List Skeleton */}
      <div className="px-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MemberSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function FullLayoutSkeleton() {
  return (
    <div className="h-screen bg-gradient-background flex flex-col">
      {/* Header Skeleton */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border">
          <SidebarSkeleton />
        </div>

        {/* Center Panel */}
        <div className="flex-1">
          <ChatAreaSkeleton />
        </div>

        {/* Details Panel */}
        <div className="w-80 border-l border-border">
          <DetailsPanelSkeleton />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ 
  size = 'default', 
  className 
}: { 
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", sizeClasses[size], className)} />
  );
}

export function TypingSkeleton() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <div className="flex items-center gap-1">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-muted-foreground ml-2">typing...</span>
      </div>
    </div>
  );
}