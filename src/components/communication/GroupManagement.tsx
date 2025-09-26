import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { 
  Users,
  Plus,
  Search,
  Crown,
  Shield,
  UserMinus,
  Settings,
  X,
  Edit3,
  Upload,
  Volume2,
  VolumeX,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import type { TeamMember } from '@/hooks/useCommunication';

interface GroupMember extends TeamMember {
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  is_muted?: boolean;
}

interface GroupChannel {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  member_count: number;
  created_at: string;
  created_by: string;
  settings: {
    allow_member_invites: boolean;
    mute_notifications: boolean;
    pin_to_sidebar: boolean;
  };
}

interface GroupManagementProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupChannel | null;
  members: GroupMember[];
  availableUsers: TeamMember[];
  currentUser: any;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateMemberRole: (userId: string, role: 'admin' | 'member') => void;
  onUpdateGroupSettings: (settings: Partial<GroupChannel['settings']>) => void;
  onUpdateGroupInfo: (info: { name: string; description?: string }) => void;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
}

export default function GroupManagement({
  isOpen,
  onClose,
  group,
  members,
  availableUsers,
  currentUser,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onUpdateGroupSettings,
  onUpdateGroupInfo,
  onLeaveGroup,
  onDeleteGroup
}: GroupManagementProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'settings' | 'info'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group?.name || '');
  const [editDescription, setEditDescription] = useState(group?.description || '');

  if (!isOpen || !group) return null;

  const currentUserMember = members.find(m => m.id === currentUser?.id);
  const isOwner = currentUserMember?.role === 'owner';
  const isAdmin = currentUserMember?.role === 'admin' || isOwner;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredAvailableUsers = availableUsers.filter(user => 
    !members.some(member => member.id === user.id) &&
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveInfo = () => {
    onUpdateGroupInfo({
      name: editName,
      description: editDescription
    });
    setIsEditing(false);
  };

  const renderMembersTab = () => (
    <div className="space-y-4">
      {/* Add Members Section */}
      {isAdmin && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Add Members</h4>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
            <Input
              placeholder="Search people to add..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {searchQuery && (
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {filteredAvailableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAddMember(user.id);
                        setSearchQuery('');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
                {filteredAvailableUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
          <Separator />
        </div>
      )}

      {/* Current Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            Members ({members.length})
          </h4>
        </div>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 group"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{member.full_name}</p>
                      {getRoleIcon(member.role)}
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Member Actions */}
                {isAdmin && member.id !== currentUser?.id && member.role !== 'owner' && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {member.role === 'member' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateMemberRole(member.id, 'admin')}
                      >
                        Make Admin
                      </Button>
                    )}
                    {member.role === 'admin' && isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateMemberRole(member.id, 'member')}
                      >
                        Remove Admin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveMember(member.id)}
                      className="text-destructive"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Group Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow members to add people</p>
              <p className="text-xs text-muted-foreground">
                Let any member invite new people to this group
              </p>
            </div>
            <Switch
              checked={group.settings.allow_member_invites}
              onCheckedChange={(checked) => 
                onUpdateGroupSettings({ allow_member_invites: checked })
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mute notifications</p>
              <p className="text-xs text-muted-foreground">
                Disable notifications for this group
              </p>
            </div>
            <Switch
              checked={group.settings.mute_notifications}
              onCheckedChange={(checked) => 
                onUpdateGroupSettings({ mute_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pin to sidebar</p>
              <p className="text-xs text-muted-foreground">
                Keep this group at the top of your chat list
              </p>
            </div>
            <Switch
              checked={group.settings.pin_to_sidebar}
              onCheckedChange={(checked) => 
                onUpdateGroupSettings({ pin_to_sidebar: checked })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Danger Zone</h4>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-destructive"
            onClick={onLeaveGroup}
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Leave Group
          </Button>
          
          {isOwner && (
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={onDeleteGroup}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderInfoTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-4">
          <Avatar className="w-full h-full">
            <AvatarImage src={group.avatar_url} />
            <AvatarFallback className="text-2xl">
              {getInitials(group.name)}
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <Button
              size="sm"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter group description (optional)"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveInfo}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(group.name);
                  setEditDescription(group.description || '');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Members</p>
            <p className="font-medium">{group.member_count}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">
              {new Date(group.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Group Settings</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-3 space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'members' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('members')}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-1" />
              Members
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('settings')}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button
              variant={activeTab === 'info' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('info')}
              className="flex-1"
            >
              Info
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {activeTab === 'members' && renderMembersTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'info' && renderInfoTab()}
        </ScrollArea>
      </div>
    </div>
  );
}