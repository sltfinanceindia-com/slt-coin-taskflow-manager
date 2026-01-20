import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Home, Plus, Settings, Users, Calendar, Shield, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface RemotePolicy {
  id: string;
  name: string;
  description: string;
  max_wfh_days: number;
  requires_approval: boolean;
  eligibility_criteria: string;
  equipment_allowance: number;
  is_active: boolean;
  created_at: string;
}

export function RemotePoliciesManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RemotePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_wfh_days: 2,
    requires_approval: true,
    eligibility_criteria: '',
    equipment_allowance: 0,
    is_active: true
  });

  const { data: policies, isLoading } = useQuery({
    queryKey: ['remote-policies'],
    queryFn: async () => {
      // Simulated data
      return [
        {
          id: '1',
          name: 'Standard Remote Policy',
          description: 'Default WFH policy for all employees',
          max_wfh_days: 2,
          requires_approval: true,
          eligibility_criteria: 'All full-time employees after 3 months',
          equipment_allowance: 500,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Flexible Remote Policy',
          description: 'Unlimited WFH for eligible roles',
          max_wfh_days: 5,
          requires_approval: false,
          eligibility_criteria: 'Senior developers and managers',
          equipment_allowance: 1000,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ] as RemotePolicy[];
    }
  });

  const handleSubmit = () => {
    toast.success(editingPolicy ? 'Policy updated successfully' : 'Policy created successfully');
    setIsDialogOpen(false);
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      max_wfh_days: 2,
      requires_approval: true,
      eligibility_criteria: '',
      equipment_allowance: 0,
      is_active: true
    });
  };

  const handleEdit = (policy: RemotePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      max_wfh_days: policy.max_wfh_days,
      requires_approval: policy.requires_approval,
      eligibility_criteria: policy.eligibility_criteria,
      equipment_allowance: policy.equipment_allowance,
      is_active: policy.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    toast.success('Policy deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['remote-policies'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-6 w-6" />
            Remote Work Policies
          </h2>
          <p className="text-muted-foreground">Configure WFH policies and guidelines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create Remote Policy'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Policy Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Remote Policy"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the policy..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max WFH Days/Week</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={formData.max_wfh_days}
                    onChange={(e) => setFormData({ ...formData, max_wfh_days: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Equipment Allowance ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.equipment_allowance}
                    onChange={(e) => setFormData({ ...formData, equipment_allowance: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eligibility Criteria</Label>
                <Textarea
                  value={formData.eligibility_criteria}
                  onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
                  placeholder="Who is eligible for this policy..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requires Manager Approval</Label>
                  <p className="text-sm text-muted-foreground">WFH requests need approval</p>
                </div>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(v) => setFormData({ ...formData, requires_approval: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Policy is currently in effect</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingPolicy ? 'Update Policy' : 'Create Policy'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{policies?.filter(p => p.is_active).length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg WFH Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {policies?.length ? Math.round(policies.reduce((a, b) => a + b.max_wfh_days, 0) / policies.length) : 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">--</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <Card className="col-span-2">
            <CardContent className="py-8 text-center">Loading policies...</CardContent>
          </Card>
        ) : policies?.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              No remote policies configured
            </CardContent>
          </Card>
        ) : (
          policies?.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {policy.name}
                      <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(policy)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(policy.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Max WFH Days</p>
                    <p className="font-medium">{policy.max_wfh_days} days/week</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Equipment Allowance</p>
                    <p className="font-medium">${policy.equipment_allowance}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Eligibility</p>
                    <p className="font-medium">{policy.eligibility_criteria}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Approval Required</p>
                    <Badge variant={policy.requires_approval ? 'default' : 'outline'}>
                      {policy.requires_approval ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
