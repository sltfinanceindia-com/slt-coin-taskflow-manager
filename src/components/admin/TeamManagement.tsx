/**
 * Team Management Component
 * CRUD operations for teams within the organization
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Users2, Target, Loader2 } from 'lucide-react';
import { useTeams, Team } from '@/hooks/useTeams';
import { useDepartments } from '@/hooks/useDepartments';

export function TeamManagement() {
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useTeams();
  const { departments } = useDepartments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.department?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description || '',
        departmentId: team.department_id || '',
        status: (team.status as 'active' | 'inactive') || 'active',
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        description: '',
        departmentId: '',
        status: 'active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      return;
    }

    try {
      if (editingTeam) {
        await updateTeam.mutateAsync({
          id: editingTeam.id,
          name: formData.name,
          description: formData.description,
          department_id: formData.departmentId || null,
          status: formData.status,
        });
      } else {
        await createTeam.mutateAsync({
          name: formData.name,
          description: formData.description,
          department_id: formData.departmentId || null,
          status: formData.status,
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Save team error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam.mutateAsync(id);
    } catch (error) {
      console.error('Delete team error:', error);
    }
  };

  const totalMembers = teams.reduce((sum, t) => sum + (t.member_count || 0), 0);
  const activeTeams = teams.filter((t) => t.status === 'active').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Create and manage teams across departments
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Total Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Users2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMembers}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTeams}</p>
                <p className="text-sm text-muted-foreground">Active Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Teams</CardTitle>
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTeams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teams found</p>
              <p className="text-sm">Create your first team to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Team Lead</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{team.department?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell>{team.lead?.full_name || 'Not assigned'}</TableCell>
                    <TableCell>{team.member_count || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={team.status === 'active' ? 'default' : 'secondary'}
                      >
                        {team.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(team)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(team.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'Add Team'}</DialogTitle>
            <DialogDescription>
              {editingTeam
                ? 'Update team information'
                : 'Create a new team in your organization'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Platform Team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, departmentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createTeam.isPending || updateTeam.isPending}
            >
              {(createTeam.isPending || updateTeam.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingTeam ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
