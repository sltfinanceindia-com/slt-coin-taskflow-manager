import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  Phone, 
  Calendar, 
  FileText, 
  Users, 
  Settings,
  Activity
} from 'lucide-react';

interface TeamsNavigationProps {
  activeView: 'chats' | 'calls' | 'calendar' | 'files' | 'teams';
  onViewChange: (view: 'chats' | 'calls' | 'calendar' | 'files' | 'teams') => void;
  unreadCount?: number;
  missedCallsCount?: number;
}

const navigationItems = [
  { id: 'chats', icon: MessageCircle, label: 'Chat', badgeKey: 'unreadCount' },
  { id: 'calls', icon: Phone, label: 'Calls', badgeKey: 'missedCallsCount' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'files', icon: FileText, label: 'Files' },
  { id: 'teams', icon: Users, label: 'Teams' }
];

export default function TeamsNavigation({
  activeView,
  onViewChange,
  unreadCount = 0,
  missedCallsCount = 0
}: TeamsNavigationProps) {
  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === 'unreadCount') return unreadCount;
    if (badgeKey === 'missedCallsCount') return missedCallsCount;
    return 0;
  };

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 space-y-2">
      {/* Activity Indicator */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 rounded-full"
        >
          <Activity className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* Navigation Items */}
      {navigationItems.map((item) => {
        const badgeCount = getBadgeCount(item.badgeKey);
        const isActive = activeView === item.id;
        
        return (
          <div key={item.id} className="relative group">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-10 w-10 p-0 rounded-lg transition-all hover-scale",
                isActive && "bg-primary/10 text-primary border-l-2 border-primary"
              )}
              onClick={() => onViewChange(item.id as any)}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            </Button>

            {/* Badge */}
            {badgeCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </Badge>
            )}

            {/* Tooltip */}
            <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          </div>
        );
      })}

      {/* Settings at Bottom */}
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0 rounded-lg"
      >
        <Settings className="h-5 w-5 text-muted-foreground" />
      </Button>
    </div>
  );
}