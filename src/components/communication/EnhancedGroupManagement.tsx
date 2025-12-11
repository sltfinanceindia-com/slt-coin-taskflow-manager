import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Crown,
  Search,
  X,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface GroupMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_private: boolean;
  member_count: number;
  created_by: string;
  created_at: string;
}

interface EnhancedGroupManagementProps {
  groups: Group[];
  selectedGroup?: Group;
  members: GroupMember[];
  availableUsers: { id: string; name: string; email: string; avatar_url?: string }[];
  currentUserId: string;
  isAdmin?: boolean;
  onCreateGroup: (data: { name: string; description?: string; is_private: boolean }) => Promise<void>;
  onUpdateGroup: (groupId: string, data: Partial<Group>) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onAddMember: (groupId: string, userId: string, role?: string) => Promise<void>;
  onRemoveMember: (groupId: string, userId: string) => Promise<void>;
  onUpdateMemberRole: (groupId: string, userId: string, role: string) => Promise<void>;
  onSelectGroup: (group: Group) => void;
  className?: string;
}

export default function EnhancedGroupManagement({
  groups,
  selectedGroup,
  members,
  availableUsers,
  currentUserId,
  isAdmin = false,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onSelectGroup,
  className
}: EnhancedGroupManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_private: false
  });

  const filteredUsers = availableUsers.filter(user => 
    !members.some(m => m.user_id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({ title: "Error", description: "Group name is required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await onCreateGroup(newGroup);
      setShowCreateDialog(false);
      setNewGroup({ name: '', description: '', is_private: false });
      toast({ title: "Success", description: "Group created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;
    
    setIsLoading(true);
    try {
      await onAddMember(selectedGroup.id, userId);
      toast({ title: "Success", description: "Member added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add member", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;
    
    setIsLoading(true);
    try {
      await onRemoveMember(selectedGroup.id, userId);
      toast({ title: "Success", description: "Member removed successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    if (!selectedGroup) return;
    
    try {
      await onUpdateMemberRole(selectedGroup.id, userId, role);
      toast({ title: "Success", description: "Role updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-amber-500 text-white"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500 text-white"><Shield className="h-3 w-3 mr-1" />Mod</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const currentUserRole = members.find(m => m.user_id === currentUserId)?.role;
  const canManageMembers = isAdmin || currentUserRole === 'admin' || currentUserRole === 'moderator';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Group Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Groups
        </h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description (Optional)</Label>
                <Textarea
                  id="group-description"
                  placeholder="What's this group about?"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Private Group</Label>
                  <p className="text-xs text-muted-foreground">Only invited members can join</p>
                </div>
                <Switch
                  checked={newGroup.is_private}
                  onCheckedChange={(checked) => setNewGroup(prev => ({ ...prev, is_private: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateGroup} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group List */}
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No groups yet</p>
                <p className="text-xs text-muted-foreground">Create a group to start collaborating</p>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => (
              <Card
                key={group.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  selectedGroup?.id === group.id && "border-primary bg-muted/50"
                )}
                onClick={() => onSelectGroup(group)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {group.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{group.name}</p>
                      {group.is_private && (
                        <Badge variant="outline" className="text-[10px] h-4">Private</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {selectedGroup?.id === group.id && canManageMembers && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettingsDialog(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Selected Group Members */}
      {selectedGroup && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Members ({members.length})</CardTitle>
              {canManageMembers && (
                <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Members</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <ScrollArea className="h-64">
                        {filteredUsers.length === 0 ? (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            No users available to add
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback>
                                      {user.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddMember(user.id)}
                                  disabled={isLoading}
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    {canManageMembers && member.user_id !== currentUserId && member.role !== 'admin' && (
                      <div className="flex items-center gap-1">
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleUpdateRole(member.user_id, value)}
                        >
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
