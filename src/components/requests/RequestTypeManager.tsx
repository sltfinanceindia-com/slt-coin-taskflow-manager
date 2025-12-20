import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, Edit, FileText, Monitor, Users, 
  Megaphone, DollarSign, HelpCircle, Settings2, Palette
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const ICON_OPTIONS = [
  { value: 'FileText', label: 'Document', icon: FileText },
  { value: 'Monitor', label: 'IT/Tech', icon: Monitor },
  { value: 'Users', label: 'HR/People', icon: Users },
  { value: 'Megaphone', label: 'Marketing', icon: Megaphone },
  { value: 'DollarSign', label: 'Finance', icon: DollarSign },
  { value: 'HelpCircle', label: 'Support', icon: HelpCircle },
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

interface RequestType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  default_priority: 'low' | 'medium' | 'high' | 'urgent';
  sla_response_hours: number;
  sla_resolution_hours: number;
  requires_approval: boolean;
  is_active: boolean;
}

export function RequestTypeManager() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RequestType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FileText',
    color: '#3B82F6',
    default_priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    sla_response_hours: 24,
    sla_resolution_hours: 72,
    requires_approval: false,
    is_active: true,
  });

  const { data: requestTypes = [], isLoading } = useQuery({
    queryKey: ['request-types-all', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('request_types')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');
      if (error) throw error;
      return data as RequestType[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('request_types')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-types'] });
      queryClient.invalidateQueries({ queryKey: ['request-types-all'] });
      toast({ title: 'Request type created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase
        .from('request_types')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-types'] });
      queryClient.invalidateQueries({ queryKey: ['request-types-all'] });
      toast({ title: 'Request type updated successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('request_types')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-types'] });
      queryClient.invalidateQueries({ queryKey: ['request-types-all'] });
      toast({ title: 'Request type deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'FileText',
      color: '#3B82F6',
      default_priority: 'medium',
      sla_response_hours: 24,
      sla_resolution_hours: 72,
      requires_approval: false,
      is_active: true,
    });
    setEditingType(null);
  };

  const handleOpenDialog = (type?: RequestType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || '',
        icon: type.icon,
        color: type.color,
        default_priority: type.default_priority,
        sla_response_hours: type.sla_response_hours,
        sla_resolution_hours: type.sla_resolution_hours,
        requires_approval: type.requires_approval,
        is_active: type.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(opt => opt.value === iconName);
    return option?.icon || FileText;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Request Types
            </CardTitle>
            <CardDescription>
              Configure the types of requests users can submit
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'Edit Request Type' : 'Create Request Type'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., IT Support"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this request type is for..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) => setFormData({ ...formData, icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: formData.color }} 
                            />
                            {COLOR_OPTIONS.find(c => c.value === formData.color)?.label}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: opt.value }} 
                              />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Priority</Label>
                  <Select
                    value={formData.default_priority}
                    onValueChange={(value: any) => setFormData({ ...formData, default_priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Response SLA (hours)</Label>
                    <Input
                      type="number"
                      value={formData.sla_response_hours}
                      onChange={(e) => setFormData({ ...formData, sla_response_hours: parseInt(e.target.value) || 0 })}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resolution SLA (hours)</Label>
                    <Input
                      type="number"
                      value={formData.sla_resolution_hours}
                      onChange={(e) => setFormData({ ...formData, sla_resolution_hours: parseInt(e.target.value) || 0 })}
                      min={1}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label>Requires Approval</Label>
                    <p className="text-xs text-muted-foreground">Requests need admin approval before processing</p>
                  </div>
                  <Switch
                    checked={formData.requires_approval}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">Users can submit this request type</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <DialogFooter className="gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingType ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {requestTypes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Request Types"
            description="Create request types to allow users to submit work requests"
            actionLabel="Add Request Type"
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requestTypes.map((type) => {
              const IconComponent = getIconComponent(type.icon);
              return (
                <Card key={type.id} className="relative group">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${type.color}15` }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: type.color }} />
                      </div>
                      <h3 className="font-semibold mb-1">{type.name}</h3>
                      {type.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {type.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                        <Badge variant="outline">{type.sla_response_hours}h response</Badge>
                        {!type.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this request type?')) {
                            deleteMutation.mutate(type.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}