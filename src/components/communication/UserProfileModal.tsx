import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User,
  MessageSquare,
  Phone,
  Video,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  UserPlus,
  UserMinus,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Bookmark,
  Activity,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  Award,
  TrendingUp,
  MessageCircle,
  Zap,
  Coffee
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  customStatus?: string;
  role: string;
  department: string;
  location: string;
  timezone: string;
  joinedAt: Date;
  lastSeen?: Date;
  bio?: string;
  skills: string[];
  interests: string[];
  pronouns?: string;
  phone?: string;
  isBlocked: boolean;
  isFriend: boolean;
  isMuted: boolean;
  isStarred: boolean;
  sharedChannels: Array<{
    id: string;
    name: string;
    type: 'public' | 'private';
  }>;
  stats: {
    messagesSent: number;
    callsMade: number;
    projectsCompleted: number;
    rating: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'message' | 'call' | 'project' | 'status';
    description: string;
    timestamp: Date;
  }>;
}

interface UserProfileModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (userId: string, type: 'voice' | 'video') => void;
  onBlock?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  onMute?: (userId: string) => void;
  onStar?: (userId: string) => void;
}

export default function UserProfileModal({
  userId,
  isOpen,
  onClose,
  onStartChat,
  onStartCall,
  onBlock,
  onAddFriend,
  onMute,
  onStar
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'shared'>('overview');

  useEffect(() => {
    if (userId && isOpen) {
      setIsLoading(true);
      
      // Mock user profile data
      const mockProfile: UserProfile = {
        id: userId,
        name: 'Sarah Wilson',
        username: 'sarah.wilson',
        email: 'sarah.wilson@company.com',
        avatar: '/avatars/sarah.png',
        status: 'online',
        customStatus: 'Working on new designs',
        role: 'Senior UI/UX Designer',
        department: 'Design',
        location: 'San Francisco, CA',
        timezone: 'PST (UTC-8)',
        joinedAt: new Date('2023-01-15'),
        lastSeen: new Date(),
        bio: 'Passionate designer focused on creating intuitive user experiences. Love to collaborate and bring ideas to life.',
        skills: ['UI Design', 'UX Research', 'Prototyping', 'Figma', 'Adobe Creative Suite'],
        interests: ['Photography', 'Travel', 'Coffee', 'Hiking'],
        pronouns: 'she/her',
        phone: '+1 (555) 123-4567',
        isBlocked: false,
        isFriend: true,
        isMuted: false,
        isStarred: false,
        sharedChannels: [
          { id: '1', name: 'design', type: 'public' },
          { id: '2', name: 'general', type: 'public' },
          { id: '3', name: 'project-alpha', type: 'private' }
        ],
        stats: {
          messagesSent: 1247,
          callsMade: 89,
          projectsCompleted: 23,
          rating: 4.8
        },
        recentActivity: [
          {
            id: '1',
            type: 'message',
            description: 'Shared design mockups in #design',
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            id: '2',
            type: 'call',
            description: 'Video call with John about project timeline',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
          },
          {
            id: '3',
            type: 'project',
            description: 'Completed wireframes for new dashboard',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
          }
        ]
      };

      setTimeout(() => {
        setProfile(mockProfile);
        setIsLoading(false);
      }, 500);
    }
  }, [userId, isOpen]);

  const getStatusIcon = (status: UserProfile['status']) => {
    const iconClass = "h-3 w-3";
    switch (status) {
      case 'online':
        return <div className={cn(iconClass, "bg-green-500 rounded-full")} />;
      case 'away':
        return <div className={cn(iconClass, "bg-yellow-500 rounded-full")} />;
      case 'busy':
        return <div className={cn(iconClass, "bg-red-500 rounded-full")} />;
      case 'offline':
        return <div className={cn(iconClass, "bg-gray-400 rounded-full")} />;
      default:
        return <div className={cn(iconClass, "bg-gray-400 rounded-full")} />;
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleAction = (action: string) => {
    if (!profile) return;

    switch (action) {
      case 'chat':
        onStartChat?.(profile.id);
        toast.success(`Starting chat with ${profile.name}...`);
        break;
      case 'call':
        onStartCall?.(profile.id, 'voice');
        toast.success(`Calling ${profile.name}...`);
        break;
      case 'video':
        onStartCall?.(profile.id, 'video');
        toast.success(`Starting video call with ${profile.name}...`);
        break;
      case 'friend':
        onAddFriend?.(profile.id);
        setProfile(prev => prev ? { ...prev, isFriend: !prev.isFriend } : null);
        toast.success(profile.isFriend ? 'Removed from friends' : 'Added to friends');
        break;
      case 'mute':
        onMute?.(profile.id);
        setProfile(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
        toast.success(profile.isMuted ? 'Unmuted user' : 'Muted user');
        break;
      case 'star':
        onStar?.(profile.id);
        setProfile(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
        toast.success(profile.isStarred ? 'Removed from starred' : 'Added to starred');
        break;
      case 'block':
        onBlock?.(profile.id);
        setProfile(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
        toast.success(profile.isBlocked ? 'Unblocked user' : 'Blocked user');
        break;
    }
  };

  if (!profile && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        ) : profile ? (
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                    {getStatusIcon(profile.status)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {profile.status}
                    </span>
                    {profile.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                  
                  <p className="text-muted-foreground mb-1">@{profile.username}</p>
                  
                  {profile.customStatus && (
                    <p className="text-sm text-muted-foreground italic">"{profile.customStatus}"</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{profile.role}</Badge>
                    <Badge variant="outline">{profile.department}</Badge>
                    {profile.pronouns && (
                      <Badge variant="outline">{profile.pronouns}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant={profile.isStarred ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAction('star')}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={profile.isMuted ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAction('mute')}
                  >
                    {profile.isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button onClick={() => handleAction('chat')} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" onClick={() => handleAction('call')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" onClick={() => handleAction('video')}>
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant={profile.isFriend ? 'default' : 'outline'}
                  onClick={() => handleAction('friend')}
                >
                  {profile.isFriend ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'activity', label: 'Activity', icon: Activity },
                  { id: 'shared', label: 'Shared', icon: Users }
                ].map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className="flex-1"
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.timezone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Joined {formatDate(profile.joinedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  {profile.skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.messagesSent}</div>
                          <div className="text-xs text-muted-foreground">Messages</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.callsMade}</div>
                          <div className="text-xs text-muted-foreground">Calls</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.projectsCompleted}</div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.rating}</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {profile.recentActivity.map(activity => (
                    <Card key={activity.id}>
                      <CardContent className="flex items-center gap-3 pt-4">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {activity.type === 'message' && <MessageCircle className="h-4 w-4" />}
                          {activity.type === 'call' && <Phone className="h-4 w-4" />}
                          {activity.type === 'project' && <Briefcase className="h-4 w-4" />}
                          {activity.type === 'status' && <Activity className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'shared' && (
                <div className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Shared Channels ({profile.sharedChannels.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {profile.sharedChannels.map(channel => (
                        <div key={channel.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">#{channel.name}</span>
                            <Badge variant={channel.type === 'private' ? 'secondary' : 'outline'} className="text-xs">
                              {channel.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant={profile.isBlocked ? 'default' : 'destructive'}
                  size="sm"
                  onClick={() => handleAction('block')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {profile.isBlocked ? 'Unblock' : 'Block'}
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}