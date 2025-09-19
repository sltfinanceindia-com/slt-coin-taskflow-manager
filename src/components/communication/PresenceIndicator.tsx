import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/usePresence';

interface PresenceIndicatorProps {
  userId: string;
  showText?: boolean;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
}

interface StatusOption {
  value: string;
  label: string;
  color: string;
  description: string;
}

const statusOptions: StatusOption[] = [
  {
    value: 'Available',
    label: 'Available',
    color: 'bg-green-500',
    description: 'Ready to collaborate'
  },
  {
    value: 'Busy',
    label: 'Busy',
    color: 'bg-red-500',
    description: 'Do not disturb'
  },
  {
    value: 'Away',
    label: 'Away',
    color: 'bg-yellow-500',
    description: 'Stepped away'
  },
  {
    value: 'In a meeting',
    label: 'In a meeting',
    color: 'bg-purple-500',
    description: 'Currently in a meeting'
  },
  {
    value: 'Focusing',
    label: 'Focusing',
    color: 'bg-blue-500',
    description: 'Deep work mode'
  },
  {
    value: 'Offline',
    label: 'Appear offline',
    color: 'bg-gray-400',
    description: 'Invisible to others'
  }
];

export function PresenceIndicator({ 
  userId, 
  showText = false, 
  showAvatar = false,
  size = 'md',
  className,
  interactive = false
}: PresenceIndicatorProps) {
  const { getUserPresence, getStatusBadgeColor, getStatusText, setUserStatus } = usePresence();
  
  const presence = getUserPresence(userId);
  
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const avatarSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const handleStatusChange = async (status: string) => {
    await setUserStatus(status);
  };

  const statusDot = (
    <div className={cn(
      "rounded-full border-2 border-background",
      getStatusBadgeColor(presence),
      sizeClasses[size]
    )} />
  );

  if (interactive && presence) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className={cn("p-0 h-auto", className)}>
            <div className="flex items-center space-x-2">
              {showAvatar && presence.profile && (
                <div className="relative">
                  <Avatar className={avatarSizeClasses[size]}>
                    <AvatarImage src={presence.profile.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {presence.profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {statusDot}
                  </div>
                </div>
              )}
              {!showAvatar && statusDot}
              {showText && (
                <span className="text-sm text-muted-foreground">
                  {getStatusText(presence)}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={presence.profile?.avatar_url} />
                <AvatarFallback>
                  {presence.profile?.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{presence.profile?.full_name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {presence.profile?.role}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Set your status</p>
              <div className="grid grid-cols-1 gap-1">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className="justify-start h-auto p-2"
                    onClick={() => handleStatusChange(option.value)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={cn("h-3 w-3 rounded-full", option.color)} />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {presence.status_message && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  "{presence.status_message}"
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {showAvatar && presence?.profile && (
        <div className="relative">
          <Avatar className={avatarSizeClasses[size]}>
            <AvatarImage src={presence.profile.avatar_url} />
            <AvatarFallback className="text-xs">
              {presence.profile.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5">
            {statusDot}
          </div>
        </div>
      )}
      {!showAvatar && statusDot}
      {showText && (
        <span className="text-sm text-muted-foreground">
          {getStatusText(presence)}
        </span>
      )}
    </div>
  );
}