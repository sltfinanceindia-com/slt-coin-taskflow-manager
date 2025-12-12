import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlaybooks, ChecklistItem, Playbook } from '@/hooks/usePlaybooks';
import { 
  Plus, Trash2, GripVertical, BookOpen, UserPlus, UserMinus, 
  Edit2, Copy, ToggleLeft, ToggleRight, ChevronDown, ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Documentation', 'IT Setup', 'HR Tasks', 'Training', 'Access & Permissions', 'Equipment', 'Meetings', 'Other'];
const ASSIGNEE_ROLES = ['HR', 'IT', 'Manager', 'Employee', 'Admin', 'Security'];

export const PlaybookBuilder: React.FC = () => {
  const { playbooks, playbooksLoading, createPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null);
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'onboarding' as 'onboarding' | 'offboarding',
    description: '',
    role: '',
    checklist_items: [] as ChecklistItem[],
    is_active: true
  });

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'Other',
    assignee_role: 'HR',
    days_offset: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'onboarding',
      description: '',
      role: '',
      checklist_items: [],
      is_active: true
    });
    setNewItem({
      title: '',
      description: '',
      category: 'Other',
      assignee_role: 'HR',
      days_offset: 0
    });
    setEditingPlaybook(null);
  };

  const handleEdit = (playbook: Playbook) => {
    setEditingPlaybook(playbook);
    setFormData({
      name: playbook.name,
      type: playbook.type,
      description: playbook.description || '',
      role: playbook.role || '',
      checklist_items: playbook.checklist_items,
      is_active: playbook.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDuplicate = (playbook: Playbook) => {
    setFormData({
      name: `${playbook.name} (Copy)`,
      type: playbook.type,
      description: playbook.description || '',
      role: playbook.role || '',
      checklist_items: playbook.checklist_items,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const addChecklistItem = () => {
    if (!newItem.title.trim()) return;
    
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      ...newItem
    };
    
    setFormData(prev => ({
      ...prev,
      checklist_items: [...prev.checklist_items, item]
    }));
    
    setNewItem({
      title: '',
      description: '',
      category: 'Other',
      assignee_role: 'HR',
      days_offset: 0
    });
  };

  const removeChecklistItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    if (editingPlaybook) {
      updatePlaybook.mutate({
        id: editingPlaybook.id,
        ...formData
      });
    } else {
      createPlaybook.mutate(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const toggleActive = (playbook: Playbook) => {
    updatePlaybook.mutate({
      id: playbook.id,
      is_active: !playbook.is_active
    });
  };

  const onboardingPlaybooks = playbooks.filter(p => p.type === 'onboarding');
  const offboardingPlaybooks = playbooks.filter(p => p.type === 'offboarding');

  const PlaybookCard = ({ playbook }: { playbook: Playbook }) => {
    const isExpanded = expandedPlaybook === playbook.id;
    
    return (
      <Card className={cn(
        "transition-all",
        !playbook.is_active && "opacity-60"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{playbook.name}</CardTitle>
                {!playbook.is_active && (
                  <Badge variant="outline" className="text-xs">Inactive</Badge>
                )}
              </div>
              {playbook.role && (
                <Badge variant="secondary" className="mt-1 text-xs">{playbook.role}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleActive(playbook)}
              >
                {playbook.is_active ? (
                  <ToggleRight className="h-4 w-4 text-primary" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDuplicate(playbook)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(playbook)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deletePlaybook.mutate(playbook.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {playbook.description && (
            <CardDescription className="mt-1">{playbook.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {playbook.checklist_items.length} checklist items
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedPlaybook(isExpanded ? null : playbook.id)}
            >
              {isExpanded ? (
                <>Hide items <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Show items <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-2">
              {playbook.checklist_items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{item.title}</span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge variant="secondary" className="text-xs">{item.assignee_role}</Badge>
                      <span className="text-xs text-muted-foreground">Day {item.days_offset}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Playbook Builder</h2>
          <p className="text-muted-foreground">Create onboarding and offboarding checklists</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Playbook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlaybook ? 'Edit Playbook' : 'Create New Playbook'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Playbook Name</Label>
                  <Input
                    placeholder="e.g., Engineering Onboarding"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'onboarding' | 'offboarding') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">
                        <div className="flex items-center">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Onboarding
                        </div>
                      </SelectItem>
                      <SelectItem value="offboarding">
                        <div className="flex items-center">
                          <UserMinus className="mr-2 h-4 w-4" />
                          Offboarding
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Role (Optional)</Label>
                <Input
                  placeholder="e.g., Software Engineer, Sales Rep"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this playbook..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label>Checklist Items</Label>
                
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      placeholder="Task title"
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      className="min-h-[60px]"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={newItem.assignee_role}
                        onValueChange={(value) => setNewItem(prev => ({ ...prev, assignee_role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assignee Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNEE_ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">Day</Label>
                        <Input
                          type="number"
                          min="0"
                          value={newItem.days_offset}
                          onChange={(e) => setNewItem(prev => ({ 
                            ...prev, 
                            days_offset: parseInt(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={addChecklistItem}
                      disabled={!newItem.title.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </CardContent>
                </Card>

                {formData.checklist_items.length > 0 && (
                  <div className="space-y-2">
                    {formData.checklist_items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-md border bg-background p-3"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            <Badge variant="secondary" className="text-xs">{item.assignee_role}</Badge>
                            <span className="text-xs text-muted-foreground">Day {item.days_offset}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeChecklistItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name.trim() || createPlaybook.isPending || updatePlaybook.isPending}
                >
                  {editingPlaybook ? 'Update Playbook' : 'Create Playbook'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playbooksLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Onboarding Playbooks</h3>
              <Badge variant="outline">{onboardingPlaybooks.length}</Badge>
            </div>
            {onboardingPlaybooks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No onboarding playbooks yet</p>
                  <Button variant="link" onClick={() => {
                    setFormData(prev => ({ ...prev, type: 'onboarding' }));
                    setIsDialogOpen(true);
                  }}>
                    Create your first one
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {onboardingPlaybooks.map(playbook => (
                  <PlaybookCard key={playbook.id} playbook={playbook} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Offboarding Playbooks</h3>
              <Badge variant="outline">{offboardingPlaybooks.length}</Badge>
            </div>
            {offboardingPlaybooks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No offboarding playbooks yet</p>
                  <Button variant="link" onClick={() => {
                    setFormData(prev => ({ ...prev, type: 'offboarding' }));
                    setIsDialogOpen(true);
                  }}>
                    Create your first one
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {offboardingPlaybooks.map(playbook => (
                  <PlaybookCard key={playbook.id} playbook={playbook} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
