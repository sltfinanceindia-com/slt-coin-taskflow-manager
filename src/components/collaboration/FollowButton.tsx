/**
 * Follow Button
 * Follow/unfollow toggle for entities
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  entityType: string;
  entityId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
  className?: string;
}

export function FollowButton({
  entityType,
  entityId,
  size = 'sm',
  variant = 'outline',
  showLabel = true,
  className,
}: FollowButtonProps) {
  // For now, use local state until the follow feature is fully implemented
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsFollowing(!isFollowing);
    setIsLoading(false);
  };

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "gap-1.5",
        isFollowing && "bg-primary",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      {showLabel && (
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      )}
    </Button>
  );
}
