import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, MessageCircle, Calendar, Mail } from 'lucide-react';
import type { TeamMember } from '@/hooks/useCommunication';
import { usePresence } from '@/hooks/usePresence';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TeamMember | null;
  onStartCall?: (callType: 'voice' | 'video') => void;
  onSendMessage?: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onStartCall,
  onSendMessage
}: UserProfileModalProps) {
  const { getUserPresence, getStatusText, getStatusIcon } = usePresence();

  if (!user) return null;

  const presence = getUserPresence(user.id);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 text-xl">
                {getStatusIcon(presence)}
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{user.full_name}</h2>
              <Badge variant="outline" className="font-normal">
                {user.role}
              </Badge>
              {user.department && (
                <p className="text-sm text-muted-foreground">{user.department}</p>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium">
                {getStatusText(presence)}
              </span>
            </div>
            
            {presence?.status_message && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Message</span>
                <span className="text-sm">{presence.status_message}</span>
              </div>
            )}
            
            {!user.is_online && presence?.last_seen && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last seen</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(presence.last_seen))} ago
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  onSendMessage?.();
                  onClose();
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Share File
              </Button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              {user.department && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}