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
import { Plus, Pencil, Trash2, Users2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  departmentName: string;
  leadId: string | null;
  leadName: string | null;
  memberCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Platform Team',
    description: 'Core platform development',
    departmentId: '1',
    departmentName: 'Engineering',
    leadId: '1',
    leadName: 'John Smith',
    memberCount: 8,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Mobile Team',
    description: 'iOS and Android development',
    departmentId: '1',
    departmentName: 'Engineering',
    leadId: '2',
    leadName: 'Jane Doe',
    memberCount: 6,
    status: 'active',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Talent Acquisition',
    description: 'Recruitment and hiring',
    departmentId: '2',
    departmentName: 'Human Resources',
    leadId: '3',
    leadName: 'Mike Johnson',
    memberCount: 4,
    status: 'active',
    createdAt: '2024-02-01',
  },
];

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description,
        departmentId: team.departmentId,
        status: team.status,
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

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingTeam) {
      setTeams(
        teams.map((team) =>
          team.id === editingTeam.id ? { ...team, ...formData } : team
        )
      );
      toast({
        title: 'Team Updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        ...formData,
        departmentName: 'Engineering', // This would come from lookup
        leadId: null,
        leadName: null,
        memberCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTeams([...teams, newTeam]);
      toast({
        title: 'Team Created',
        description: `${formData.name} has been created successfully.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const team = teams.find((t) => t.id === id);
    setTeams(teams.filter((t) => t.id !== id));
    toast({
      title: 'Team Deleted',
      description: `${team?.name} has been deleted.`,
    });
  };

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
                <p className="text-2xl font-bold">
                  {teams.reduce((sum, t) => sum + t.memberCount, 0)}
                </p>
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
                <p className="text-2xl font-bold">
                  {teams.filter((t) => t.status === 'active').length}
                </p>
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
          <Table>
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
                    <Badge variant="outline">{team.departmentName}</Badge>
                  </TableCell>
                  <TableCell>{team.leadName || 'Not assigned'}</TableCell>
                  <TableCell>{team.memberCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={team.status === 'active' ? 'default' : 'secondary'}
                    >
                      {team.status}
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
          </Table>
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
                  <SelectItem value="1">Engineering</SelectItem>
                  <SelectItem value="2">Human Resources</SelectItem>
                  <SelectItem value="3">Finance</SelectItem>
                  <SelectItem value="4">Marketing</SelectItem>
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
            <Button onClick={handleSave}>
              {editingTeam ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
