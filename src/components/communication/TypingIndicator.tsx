import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Edit3, 
  Mic, 
  Video, 
  FileText, 
  Image, 
  MessageSquare,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Settings,
  Info,
  Clock,
  Zap,
  Brain,
  Globe,
  Wifi,
  WifiOff,
  Activity,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  typingStartedAt?: Date;
  lastActivity?: Date;
  isTypingFast?: boolean;
  typingSpeed?: number; // characters per minute
  currentAction?: 'typing' | 'voice_recording' | 'uploading_file' | 'taking_photo' | 'selecting_emoji' | 'thinking';
  estimatedTimeToComplete?: number; // seconds
  language?: string;
  location?: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
  variant?: 'minimal' | 'detailed' | 'compact' | 'floating' | 'inline';
  showAvatars?: boolean;
  showDeviceType?: boolean;
  showTypingSpeed?: boolean;
  showEstimatedTime?: boolean;
  showUserDetails?: boolean;
  enableSounds?: boolean;
  enableAnimations?: boolean;
  maxVisibleUsers?: number;
  animationStyle?: 'dots' | 'wave' | 'pulse' | 'typing' | 'modern' | 'gradient';
  colorScheme?: 'default' | 'primary' | 'accent' | 'muted' | 'rainbow';
  position?: 'bottom' | 'top' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  priority?: 'normal' | 'high';
  onUserClick?: (user: TypingUser) => void;
  onDismiss?: () => void;
  className?: string;
}

const typingAnimations = {
  dots: 'animate-bounce',
  wave: 'animate-pulse',
  pulse: 'animate-ping',
  typing: 'animate-pulse',
  modern: 'animate-bounce',
  gradient: 'animate-pulse'
};

const actionMessages = {
  typing: 'typing',
  voice_recording: 'recording voice message',
  uploading_file: 'uploading file',
  taking_photo: 'taking photo',
  selecting_emoji: 'selecting emoji',
  thinking: 'thinking'
};

const actionIcons = {
  typing: Edit3,
  voice_recording: Mic,
  uploading_file: FileText,
  taking_photo: Image,
  selecting_emoji: MessageSquare,
  thinking: Brain
};

const deviceIcons = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet
};

export function TypingIndicator({ 
  users,
  variant = 'detailed',
  showAvatars = true,
  showDeviceType = false,
  showTypingSpeed = false,
  showEstimatedTime = false,
  showUserDetails = false,
  enableSounds = false,
  enableAnimations = true,
  maxVisibleUsers = 3,
  animationStyle = 'modern',
  colorScheme = 'default',
  position = 'bottom',
  size = 'md',
  priority = 'normal',
  onUserClick,
  onDismiss,
  className
}: TypingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSounds);
  const [animationsEnabled, setAnimationsEnabled] = useState(enableAnimations);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for accurate timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced typing duration tracking
  const typingDurations = useMemo(() => {
    return users.map(user => {
      if (user.typingStartedAt) {
        return differenceInSeconds(currentTime, user.typingStartedAt);
      }
      return 0;
    });
  }, [users, currentTime]);

  // Smart grouping and sorting
  const processedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      // Priority sorting: voice recording > file upload > typing
      const priorityOrder = {
        voice_recording: 4,
        uploading_file: 3,
        taking_photo: 2,
        typing: 1,
        thinking: 0
      };
      
      const aPriority = priorityOrder[a.currentAction || 'typing'] || 1;
      const bPriority = priorityOrder[b.currentAction || 'typing'] || 1;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Then by typing start time (most recent first)
      if (a.typingStartedAt && b.typingStartedAt) {
        return b.typingStartedAt.getTime() - a.typingStartedAt.getTime();
      }
      
      return a.name.localeCompare(b.name);
    });

    return sorted.slice(0, maxVisibleUsers);
  }, [users, maxVisibleUsers]);

  const remainingCount = users.length - processedUsers.length;

  // Enhanced text generation
  const getTypingText = useCallback(() => {
    if (processedUsers.length === 0) return '';

    const firstUser = processedUsers[0];
    const action = actionMessages[firstUser.currentAction || 'typing'];

    if (processedUsers.length === 1) {
      return `${firstUser.name} is ${action}`;
    } else if (processedUsers.length === 2) {
      const secondAction = actionMessages[processedUsers[1].currentAction || 'typing'];
      if (action === secondAction) {
        return `${firstUser.name} and ${processedUsers[1].name} are ${action}`;
      } else {
        return `${firstUser.name} is ${action}, ${processedUsers[1].name} is ${secondAction}`;
      }
    } else {
      const othersCount = processedUsers.length - 1 + remainingCount;
      return `${firstUser.name} and ${othersCount} others are typing`;
    }
  }, [processedUsers, remainingCount]);

  // Enhanced dot animation with different styles
  const renderDots = useCallback(() => {
    const baseClasses = "rounded-full transition-all duration-300";
    
    const sizeClasses = {
      sm: 'w-1 h-1',
      md: 'w-1.5 h-1.5',
      lg: 'w-2 h-2'
    };

    const colorClasses = {
      default: 'bg-current',
      primary: 'bg-primary',
      accent: 'bg-accent-foreground',
      muted: 'bg-muted-foreground',
      rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'
    };

    switch (animationStyle) {
      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  baseClasses,
                  sizeClasses[size],
                  colorClasses[colorScheme],
                  enableAnimations && 'animate-pulse'
                )}
                style={{ 
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  baseClasses,
                  sizeClasses[size],
                  colorClasses[colorScheme],
                  enableAnimations && 'animate-ping'
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        );
      
      case 'gradient':
        return (
          <div className="flex space-x-1">
            <div className={cn(
              baseClasses,
              sizeClasses[size],
              'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
              enableAnimations && 'animate-pulse'
            )} />
            <div className={cn(
              baseClasses,
              sizeClasses[size],
              'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500',
              enableAnimations && 'animate-pulse'
            )} style={{ animationDelay: '150ms' }} />
            <div className={cn(
              baseClasses,
              sizeClasses[size],
              'bg-gradient-to-r from-yellow-500 via-green-500 to-blue-500',
              enableAnimations && 'animate-pulse'
            )} style={{ animationDelay: '300ms' }} />
          </div>
        );
      
      case 'modern':
        return (
          <div className="flex items-center space-x-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all duration-300',
                  sizeClasses[size],
                  colorSchemes[colorScheme] || 'bg-primary',
                  enableAnimations && 'animate-bounce'
                )}
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'typing':
        return (
          <div className="flex items-center space-x-1">
            <div className="flex space-x-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-3 w-0.5 bg-current rounded-full',
                    enableAnimations && 'animate-pulse'
                  )}
                  style={{ 
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          </div>
        );
      
      default: // dots
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  baseClasses,
                  sizeClasses[size],
                  colorClasses[colorScheme],
                  enableAnimations && 'animate-bounce'
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        );
    }
  }, [animationStyle, size, colorScheme, enableAnimations, animationsEnabled]);

  const colorSchemes = {
    default: 'bg-current',
    primary: 'bg-primary',
    accent: 'bg-accent-foreground',
    muted: 'bg-muted-foreground',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'
  };

  // Enhanced avatar rendering with status and activity indicators
  const renderAvatars = useCallback(() => {
    if (!showAvatars) return null;

    return (
      <div className="flex -space-x-1">
        {processedUsers.slice(0, 3).map((user, index) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="relative cursor-pointer transition-transform hover:scale-110"
                  onClick={() => onUserClick?.(user)}
                >
                  <Avatar className={cn(
                    "border-2 border-background transition-all duration-200",
                    size === 'sm' ? "h-5 w-5" : size === 'lg' ? "h-8 w-8" : "h-6 w-6",
                    priority === 'high' && "ring-2 ring-orange-400 ring-offset-1"
                  )}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  {user.status && (
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                      user.status === 'online' && 'bg-green-500',
                      user.status === 'away' && 'bg-yellow-500',
                      user.status === 'busy' && 'bg-red-500',
                      user.status === 'offline' && 'bg-gray-400'
                    )} />
                  )}
                  
                  {/* Activity indicator */}
                  {user.currentAction && user.currentAction !== 'typing' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      {React.createElement(actionIcons[user.currentAction], { 
                        className: "h-1.5 w-1.5 text-white" 
                      })}
                    </div>
                  )}
                  
                  {/* Fast typing indicator */}
                  {user.isTypingFast && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Zap className="h-1.5 w-1.5 text-white" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {user.role && (
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      {actionMessages[user.currentAction || 'typing']}
                      {user.typingStartedAt && (
                        <span className="ml-1">
                          for {formatDistanceToNow(user.typingStartedAt)}
                        </span>
                      )}
                    </div>
                    
                    {showDeviceType && user.deviceType && (
                      <div className="flex items-center gap-1">
                        {React.createElement(deviceIcons[user.deviceType], { 
                          className: "h-3 w-3" 
                        })}
                        <span>{user.deviceType}</span>
                      </div>
                    )}
                    
                    {showTypingSpeed && user.typingSpeed && (
                      <div>{user.typingSpeed} CPM</div>
                    )}
                    
                    {showEstimatedTime && user.estimatedTimeToComplete && (
                      <div>~{user.estimatedTimeToComplete}s remaining</div>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {remainingCount > 0 && (
          <div className={cn(
            "border-2 border-background bg-muted rounded-full flex items-center justify-center text-xs font-medium",
            size === 'sm' ? "h-5 w-5" : size === 'lg' ? "h-8 w-8" : "h-6 w-6"
          )}>
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }, [showAvatars, processedUsers, remainingCount, size, priority, onUserClick, showDeviceType, showTypingSpeed, showEstimatedTime]);

  // Minimal variant
  const renderMinimal = () => (
    <div className={cn(
      "flex items-center space-x-2 px-3 py-1.5 text-muted-foreground",
      "transition-all duration-200 hover:bg-muted/30 rounded-lg",
      className
    )}>
      {showAvatars && renderAvatars()}
      <div className="flex items-center space-x-2">
        <span className="text-sm">{getTypingText()}</span>
        {renderDots()}
      </div>
    </div>
  );

  // Compact variant
  const renderCompact = () => (
    <div className={cn(
      "flex items-center space-x-2 px-2 py-1 bg-muted/50 rounded-full text-xs",
      "transition-all duration-200 hover:bg-muted/70",
      className
    )}>
      {showAvatars && renderAvatars()}
      <span className="text-muted-foreground truncate max-w-32">
        {processedUsers.length === 1 ? processedUsers[0].name : `${processedUsers.length} typing`}
      </span>
      {renderDots()}
    </div>
  );

  // Floating variant
  const renderFloating = () => (
    <Card className={cn(
      "fixed z-50 shadow-lg border transition-all duration-300 hover:shadow-xl",
      position === 'bottom' ? "bottom-4 right-4" : "top-4 right-4",
      "max-w-sm",
      className
    )}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Live Activity</span>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {processedUsers.map((user, index) => (
            <div key={user.id} className="flex items-center space-x-2">
              {showAvatars && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {actionMessages[user.currentAction || 'typing']}
                </div>
              </div>
              {renderDots()}
            </div>
          ))}
        </div>
        
        {showUserDetails && (
          <div className="mt-3 pt-2 border-t space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Active users:</span>
              <span>{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg typing time:</span>
              <span>{Math.round(typingDurations.reduce((a, b) => a + b, 0) / typingDurations.length || 0)}s</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  // Detailed variant (default)
  const renderDetailed = () => (
    <div className={cn(
      "flex items-center space-x-3 px-4 py-3 text-muted-foreground transition-all duration-200",
      "hover:bg-muted/20 rounded-lg group",
      priority === 'high' && "bg-orange-50 border-l-2 border-orange-400",
      className
    )}>
      {renderAvatars()}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={cn(
            "font-medium",
            size === 'sm' ? "text-xs" : size === 'lg' ? "text-base" : "text-sm"
          )}>
            {getTypingText()}
          </span>
          
          {showEstimatedTime && processedUsers[0]?.estimatedTimeToComplete && (
            <Badge variant="outline" className="text-xs">
              ~{processedUsers[0].estimatedTimeToComplete}s
            </Badge>
          )}
          
          {renderDots()}
        </div>
        
        {/* Enhanced details */}
        {(showUserDetails || showTypingSpeed) && (
          <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
            {showTypingSpeed && processedUsers[0]?.typingSpeed && (
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>{processedUsers[0].typingSpeed} CPM</span>
              </div>
            )}
            
            {showDeviceType && processedUsers[0]?.deviceType && (
              <div className="flex items-center space-x-1">
                {React.createElement(deviceIcons[processedUsers[0].deviceType], { 
                  className: "h-3 w-3" 
                })}
                <span>{processedUsers[0].deviceType}</span>
              </div>
            )}
            
            {processedUsers[0]?.typingStartedAt && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(processedUsers[0].typingStartedAt, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Progress indicator for estimated completion */}
      {showEstimatedTime && processedUsers[0]?.estimatedTimeToComplete && (
        <div className="w-16">
          <Progress 
            value={Math.max(0, 100 - (typingDurations[0] / processedUsers[0].estimatedTimeToComplete) * 100)} 
            className="h-1"
          />
        </div>
      )}
      
      {/* Expandable details */}
      {processedUsers.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );

  // Inline variant
  const renderInline = () => (
    <div className={cn(
      "inline-flex items-center space-x-2 text-muted-foreground transition-colors",
      className
    )}>
      {showAvatars && renderAvatars()}
      <span className="text-sm">{getTypingText()}</span>
      {renderDots()}
    </div>
  );

  if (users.length === 0) return null;

  // Expanded view for multiple users
  if (isExpanded && processedUsers.length > 1) {
    return (
      <div className={cn("space-y-2 px-4 py-3", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {users.length} people are active
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {processedUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3 text-sm">
              <Avatar className="h-5 w-5">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1">{user.name}</span>
              <span className="text-muted-foreground">
                {actionMessages[user.currentAction || 'typing']}
              </span>
              {renderDots()}
            </div>
          ))}
        </div>
        
        {remainingCount > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            +{remainingCount} more
          </div>
        )}
      </div>
    );
  }

  // Render based on variant
  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'compact':
      return renderCompact();
    case 'floating':
      return renderFloating();
    case 'inline':
      return renderInline();
    default:
      return renderDetailed();
  }
}

// Enhanced hook for managing typing state
export function useTypingIndicator() {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [typingTimeouts, setTypingTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  const addTypingUser = useCallback((user: Omit<TypingUser, 'typingStartedAt'>) => {
    const now = new Date();
    setTypingUsers(prev => {
      const existing = prev.find(u => u.id === user.id);
      if (existing) {
        return prev.map(u => u.id === user.id ? { ...u, ...user, typingStartedAt: existing.typingStartedAt } : u);
      }
      return [...prev, { ...user, typingStartedAt: now }];
    });

    // Clear existing timeout
    if (typingTimeouts[user.id]) {
      clearTimeout(typingTimeouts[user.id]);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      removeTypingUser(user.id);
    }, 5000); // Remove after 5 seconds of inactivity

    setTypingTimeouts(prev => ({ ...prev, [user.id]: timeout }));
  }, [typingTimeouts]);

  const removeTypingUser = useCallback((userId: string) => {
    setTypingUsers(prev => prev.filter(u => u.id !== userId));
    
    if (typingTimeouts[userId]) {
      clearTimeout(typingTimeouts[userId]);
      setTypingTimeouts(prev => {
        const { [userId]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [typingTimeouts]);

  const updateTypingUser = useCallback((userId: string, updates: Partial<TypingUser>) => {
    setTypingUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ));
  }, []);

  const clearAllTypingUsers = useCallback(() => {
    Object.values(typingTimeouts).forEach(timeout => clearTimeout(timeout));
    setTypingUsers([]);
    setTypingTimeouts({});
  }, [typingTimeouts]);

  return {
    typingUsers,
    addTypingUser,
    removeTypingUser,
    updateTypingUser,
    clearAllTypingUsers
  };
}
