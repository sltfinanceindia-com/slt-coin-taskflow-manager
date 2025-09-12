import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Mail, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Shield,
  Users,
  Activity,
  Briefcase
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';

interface UserProfileModalProps {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
    email?: string;
    department?: string;
    bio?: string;
    user_id: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStartMessage?: () => void;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
}

export function UserProfileModal({ 
  user, 
  isOpen, 
  onClose, 
  onStartMessage, 
  onStartCall, 
  onStartVideoCall 
}: UserProfileModalProps) {
  const { getUserPresence, getStatusText, getStatusBadgeColor } = usePresence();
  
  if (!user) return null;

  const presence = getUserPresence(user.user_id);
  const statusColor = getStatusBadgeColor(presence);
  const statusText = getStatusText(presence);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${statusColor}`} />
            </div>
            
            <h3 className="text-xl font-semibold mt-3">{user.full_name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {statusText}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onStartMessage}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onStartCall}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onStartVideoCall}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h4>
            
            <div className="space-y-2 text-sm">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                    {user.email}
                  </a>
                </div>
              )}
              
              {user.department && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span>{user.department}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{statusText}</span>
              </div>
              
              {presence?.last_seen && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Last seen:</span>
                  <span>{new Date(presence.last_seen).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              </div>
            </>
          )}

          {/* Work Information */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Work Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-lg">24</div>
                <div className="text-muted-foreground">Tasks</div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-lg">156h</div>
                <div className="text-muted-foreground">Hours</div>
              </div>
            </div>
          </div>

          {/* Team Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Team Features
            </h4>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Add to Favorites
              </Badge>
              
              {user.role === 'admin' && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Schedule Meeting
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}