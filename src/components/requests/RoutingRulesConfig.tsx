import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, Trash2, GripVertical, Route, 
  ArrowRight, User, AlertCircle, Settings2 
} from 'lucide-react';
import { useRoutingRules, RoutingRule } from '@/hooks/useSLAMetrics';
import { useWorkRequests } from '@/hooks/useWorkRequests';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const conditionFields = [
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
];

const conditionOperators = [
  { value: 'equals', label: 'equals' },
  { value: 'contains', label: 'contains' },
];

const priorityValues = ['low', 'medium', 'high', 'urgent'];

export function RoutingRulesConfig() {
  const { rules, isLoading, createRule, updateRule, deleteRule, isCreating } = useRoutingRules();
  const { requestTypes } = useWorkRequests();
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['profiles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .in('role', ['admin', 'employee']);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const [formData, setFormData] = useState({
    name: '',
    request_type_id: '',
    condition_field: 'priority',
    condition_operator: 'equals',
    condition_value: '',
    assign_to_user_id: '',
    assign_to_team: '',
    priority_override: '',
    is_active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      request_type_id: '',
      condition_field: 'priority',
      condition_operator: 'equals',
      condition_value: '',
      assign_to_user_id: '',
      assign_to_team: '',
      priority_override: '',
      is_active: true,
      sort_order: rules.length,
    });
    setEditingRule(null);
  };

  const handleOpenDialog = (rule?: RoutingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        request_type_id: rule.request_type_id,
        condition_field: rule.condition_field,
        condition_operator: rule.condition_operator,
        condition_value: rule.condition_value,
        assign_to_user_id: rule.assign_to_user_id || '',
        assign_to_team: rule.assign_to_team || '',
        priority_override: rule.priority_override || '',
        is_active: rule.is_active,
        sort_order: rule.sort_order,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.request_type_id || !formData.condition_value) return;

    const ruleData = {
      ...formData,
      assign_to_user_id: formData.assign_to_user_id || null,
      assign_to_team: formData.assign_to_team || null,
      priority_override: formData.priority_override || null,
    };

    if (editingRule) {
      updateRule({ id: editingRule.id, ...ruleData });
    } else {
      createRule(ruleData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
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
              <Route className="h-5 w-5" />
              Routing Rules
            </CardTitle>
            <CardDescription>
              Automatically assign and prioritize incoming requests
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Routing Rule' : 'Create Routing Rule'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Rule Name */}
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., High priority to Senior Team"
                  />
                </div>

                {/* Request Type */}
                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <Select
                    value={formData.request_type_id}
                    onValueChange={(value) => setFormData({ ...formData, request_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label>When</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.condition_field}
                      onValueChange={(value) => setFormData({ ...formData, condition_field: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.condition_operator}
                      onValueChange={(value) => setFormData({ ...formData, condition_operator: value })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOperators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formData.condition_field === 'priority' ? (
                      <Select
                        value={formData.condition_value}
                        onValueChange={(value) => setFormData({ ...formData, condition_value: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityValues.map((val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.condition_value}
                        onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                        placeholder="Value"
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-2 border-t">
                  <Label className="text-muted-foreground">Then do the following:</Label>

                  {/* Assign to user */}
                  <div className="space-y-2">
                    <Label>Assign to</Label>
                    <Select
                      value={formData.assign_to_user_id}
                      onValueChange={(value) => setFormData({ ...formData, assign_to_user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No assignment</SelectItem>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Override priority */}
                  <div className="space-y-2">
                    <Label>Override Priority</Label>
                    <Select
                      value={formData.priority_override}
                      onValueChange={(value) => setFormData({ ...formData, priority_override: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Keep original (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Keep original</SelectItem>
                        {priorityValues.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label>Rule is active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isCreating}>
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <Settings2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No routing rules configured</p>
            <p className="text-sm text-muted-foreground">
              Create rules to automatically route requests to the right team members
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const requestType = requestTypes?.find(t => t.id === rule.request_type_id);
              const assignee = users?.find(u => u.id === rule.assign_to_user_id);

              return (
                <div
                  key={rule.id}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{rule.name}</span>
                      {!rule.is_active && (
                        <Badge variant="outline" className="text-xs">Disabled</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {requestType?.name || 'Unknown type'}
                      </Badge>
                      <span>when</span>
                      <Badge variant="outline" className="text-xs">
                        {rule.condition_field} {rule.condition_operator} {rule.condition_value}
                      </Badge>
                      
                      {(rule.assign_to_user_id || rule.priority_override) && (
                        <>
                          <ArrowRight className="h-3 w-3" />
                          {assignee && (
                            <Badge className="text-xs gap-1">
                              <User className="h-3 w-3" />
                              {assignee.full_name}
                            </Badge>
                          )}
                          {rule.priority_override && (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {rule.priority_override}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
