import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Circle,
  Clock,
  Calendar,
  MapPin,
  Settings,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Users,
  Activity,
  Zap,
  Coffee,
  Home,
  Briefcase,
  Plane,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserPresence {
  status: 'online' | 'away' | 'busy' | 'offline';
  customMessage?: string;
  lastSeen?: Date;
  isVisible: boolean;
  autoAwayEnabled: boolean;
  autoAwayTimeout: number; // minutes
  showLastSeen: boolean;
  timezone?: string;
}

interface CustomStatus {
  id: string;
  text: string;
  emoji: string;
  expiresAt?: Date;
}

interface PresenceIndicatorProps {
  userId: string;
  initialPresence?: UserPresence;
  onPresenceChange?: (presence: UserPresence) => void;
  showSettings?: boolean;
  className?: string;
}

export default function PresenceIndicator({
  userId,
  initialPresence,
  onPresenceChange,
  showSettings = false,
  className
}: PresenceIndicatorProps) {
  const [presence, setPresence] = useState<UserPresence>(
    initialPresence || {
      status: 'online',
      isVisible: true,
      autoAwayEnabled: true,
      autoAwayTimeout: 10,
      showLastSeen: true
    }
  );

  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([
    { id: '1', text: 'In a meeting', emoji: '📅' },
    { id: '2', text: 'Working from home', emoji: '🏠' },
    { id: '3', text: 'On vacation', emoji: '🏖️' },
    { id: '4', text: 'Lunch break', emoji: '🍽️' },
    { id: '5', text: 'Focusing', emoji: '🎯' }
  ]);

  const [newCustomStatus, setNewCustomStatus] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledStatuses, setScheduledStatuses] = useState<Array<{
    id: string;
    status: UserPresence['status'];
    time: string;
    message?: string;
  }>>([]);

  useEffect(() => {
    let awayTimer: NodeJS.Timeout;

    if (presence.autoAwayEnabled && presence.status === 'online') {
      awayTimer = setTimeout(() => {
        updatePresence({ status: 'away' });
        toast.info('Status changed to Away due to inactivity');
      }, presence.autoAwayTimeout * 60 * 1000);
    }

    return () => {
      if (awayTimer) clearTimeout(awayTimer);
    };
  }, [presence.status, presence.autoAwayEnabled, presence.autoAwayTimeout]);

  const updatePresence = (updates: Partial<UserPresence>) => {
    const newPresence = { ...presence, ...updates };
    setPresence(newPresence);
    onPresenceChange?.(newPresence);
  };

  const getStatusIcon = (status: UserPresence['status']) => {
    const iconClass = "h-3 w-3";
    switch (status) {
      case 'online':
        return <Circle className={cn(iconClass, "text-green-500 fill-current")} />;
      case 'away':
        return <Circle className={cn(iconClass, "text-yellow-500 fill-current")} />;
      case 'busy':
        return <Circle className={cn(iconClass, "text-red-500 fill-current")} />;
      case 'offline':
        return <Circle className={cn(iconClass, "text-gray-400 fill-current")} />;
      default:
        return <Circle className={cn(iconClass, "text-gray-400")} />;
    }
  };

  const getStatusText = (status: UserPresence['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleStatusChange = (newStatus: UserPresence['status']) => {
    updatePresence({ 
      status: newStatus,
      lastSeen: newStatus === 'offline' ? new Date() : undefined
    });
    
    toast.success(`Status changed to ${getStatusText(newStatus)}`);
  };

  const handleCustomStatusAdd = () => {
    if (newCustomStatus.trim()) {
      const newStatus: CustomStatus = {
        id: Date.now().toString(),
        text: newCustomStatus.trim(),
        emoji: selectedEmoji
      };
      
      setCustomStatuses(prev => [...prev, newStatus]);
      updatePresence({ customMessage: newCustomStatus.trim() });
      setNewCustomStatus('');
      setIsEditing(false);
      toast.success('Custom status added');
    }
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const commonEmojis = ['😊', '🎯', '☕', '🏠', '📅', '✈️', '🌙', '🔥', '💪', '🎉'];

  if (!showSettings) {
    // Simple presence indicator
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {getStatusIcon(presence.status)}
        <span className="text-sm font-medium">{getStatusText(presence.status)}</span>
        {presence.customMessage && (
          <span className="text-sm text-muted-foreground">
            - {presence.customMessage}
          </span>
        )}
        {presence.status === 'offline' && presence.lastSeen && presence.showLastSeen && (
          <span className="text-xs text-muted-foreground">
            Last seen {formatLastSeen(presence.lastSeen)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Presence Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['online', 'away', 'busy', 'offline'] as const).map((status) => (
              <Button
                key={status}
                variant={presence.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status)}
                className="justify-start"
              >
                {getStatusIcon(status)}
                <span className="ml-2">{getStatusText(status)}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Custom Message */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Custom Message</Label>
          
          {/* Quick Status Options */}
          <div className="space-y-2">
            {customStatuses.slice(0, 3).map((status) => (
              <Button
                key={status.id}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => updatePresence({ customMessage: status.text })}
              >
                <span className="mr-2">{status.emoji}</span>
                {status.text}
              </Button>
            ))}
          </div>

          {/* Custom Input */}
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select value={selectedEmoji} onValueChange={setSelectedEmoji}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonEmojis.map(emoji => (
                      <SelectItem key={emoji} value={emoji}>
                        {emoji}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="What's your status?"
                  value={newCustomStatus}
                  onChange={(e) => setNewCustomStatus(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomStatusAdd()}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCustomStatusAdd}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              <Activity className="h-4 w-4 mr-2" />
              Set custom status
            </Button>
          )}

          {presence.customMessage && (
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">{presence.customMessage}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updatePresence({ customMessage: undefined })}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Privacy Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Privacy</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Show presence to others</Label>
              <p className="text-xs text-muted-foreground">
                Allow team members to see your status
              </p>
            </div>
            <Switch
              checked={presence.isVisible}
              onCheckedChange={(checked) => updatePresence({ isVisible: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Show last seen</Label>
              <p className="text-xs text-muted-foreground">
                Display when you were last active
              </p>
            </div>
            <Switch
              checked={presence.showLastSeen}
              onCheckedChange={(checked) => updatePresence({ showLastSeen: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Auto-Away Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Auto-Away</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Enable auto-away</Label>
              <p className="text-xs text-muted-foreground">
                Automatically set status to away when inactive
              </p>
            </div>
            <Switch
              checked={presence.autoAwayEnabled}
              onCheckedChange={(checked) => updatePresence({ autoAwayEnabled: checked })}
            />
          </div>

          {presence.autoAwayEnabled && (
            <div className="space-y-2">
              <Label className="text-sm">Away timeout (minutes)</Label>
              <Select
                value={presence.autoAwayTimeout.toString()}
                onValueChange={(value) => updatePresence({ autoAwayTimeout: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Current Info */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Status</Label>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {getStatusIcon(presence.status)}
            <div className="flex-1">
              <div className="text-sm font-medium">{getStatusText(presence.status)}</div>
              {presence.customMessage && (
                <div className="text-xs text-muted-foreground">{presence.customMessage}</div>
              )}
              {presence.status === 'offline' && presence.lastSeen && (
                <div className="text-xs text-muted-foreground">
                  Last seen {formatLastSeen(presence.lastSeen)}
                </div>
              )}
            </div>
            {!presence.isVisible && (
              <Badge variant="secondary">
                <EyeOff className="h-3 w-3 mr-1" />
                Hidden
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}