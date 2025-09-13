import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Briefcase,
  Building,
  Globe,
  UserPlus,
  MoreHorizontal,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Circle,
  Zap,
  Award,
  TrendingUp,
  FileText
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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
    location?: string;
    timezone?: string;
    phone?: string;
    manager?: string;
    join_date?: string;
    skills?: string[];
    projects?: { id: string; name: string; status: string }[];
    stats?: {
      tasks_completed: number;
      hours_logged: number;
      projects_active: number;
      team_rating: number;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStartMessage?: () => void;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
  onAddToFavorites?: (userId: string) => void;
  onScheduleMeeting?: (userId: string) => void;
  onViewFullProfile?: (userId: string) => void;
  currentUserId?: string;
}

export function UserProfileModal({ 
  user, 
  isOpen, 
  onClose, 
  onStartMessage, 
  onStartCall, 
  onStartVideoCall,
  onAddToFavorites,
  onScheduleMeeting,
  onViewFullProfile,
  currentUserId
}: UserProfileModalProps) {
  const { getUserPresence, getStatusText, getStatusBadgeColor } = usePresence();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const presence = useMemo(() => {
    return user ? getUserPresence(user.user_id) : null;
  }, [user, getUserPresence]);

  const statusColor = presence ? getStatusBadgeColor(presence) : 'bg-gray-400';
  const statusText = presence ? getStatusText(presence) : 'Unknown';

  const handleCopyEmail = async () => {
    if (user?.email) {
      await navigator.clipboard.writeText(user.email);
    }
  };

  const getPresenceIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'available':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'busy':
      case 'do not disturb':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'away':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTimeZoneInfo = () => {
    if (!user?.timezone) return null;
    try {
      const now = new Date();
      const timeZone = user.timezone;
      const time = now.toLocaleTimeString('en-US', { 
        timeZone, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `${time} (${timeZone})`;
    } catch {
      return user.timezone;
    }
  };

  if (!user) return null;

  const isCurrentUser = currentUserId === user.user_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">{user.full_name} Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Profile Header */}
          <div className="px-6 pb-4">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                    {user.full_name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-background shadow-sm",
                  statusColor
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-foreground truncate">
                      {user.full_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="font-medium">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                      {user.department && (
                        <Badge variant="outline" className="text-xs">
                          <Building className="h-3 w-3 mr-1" />
                          {user.department}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {getPresenceIcon(statusText)}
                      <span className="text-sm font-medium capitalize">{statusText}</span>
                      {presence?.last_seen && statusText !== 'online' && (
                        <span className="text-xs text-muted-foreground">
                          • Last seen {formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            {!isCurrentUser && (
              <div className="flex gap-3 mt-6">
                <Button onClick={onStartMessage} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" onClick={onStartCall}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" onClick={onStartVideoCall}>
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="outline" onClick={() => onScheduleMeeting?.(user.user_id)}>
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 py-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </h3>
                  
                  <div className="grid gap-3">
                    {user.email && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Email</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${user.email}`}>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {user.phone && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Phone</div>
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`tel:${user.phone}`}>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}

                    {user.location && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Location</div>
                          <div className="text-sm text-muted-foreground">{user.location}</div>
                        </div>
                      </div>
                    )}

                    {getTimeZoneInfo() && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Local Time</div>
                          <div className="text-sm text-muted-foreground">{getTimeZoneInfo()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {user.stats && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{user.stats.tasks_completed}</div>
                        <div className="text-xs text-blue-600/80">Tasks Completed</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{user.stats.hours_logged}h</div>
                        <div className="text-xs text-green-600/80">Hours Logged</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{user.stats.projects_active}</div>
                        <div className="text-xs text-purple-600/80">Active Projects</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{user.stats.team_rating}/5</div>
                        <div className="text-xs text-orange-600/80">Team Rating</div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-0 space-y-4">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Activity tracking coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-0 space-y-4">
                {user.projects && user.projects.length > 0 ? (
                  <div className="space-y-3">
                    {user.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{project.name}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Projects</h3>
                    <p className="text-sm text-muted-foreground">No active projects found</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer Actions */}
          <div className="border-t p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isCurrentUser && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAddToFavorites?.(user.user_id)}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Add to Favorites
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewFullProfile?.(user.user_id)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full Profile
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {user.join_date && `Joined ${formatDistanceToNow(new Date(user.join_date), { addSuffix: true })}`}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
