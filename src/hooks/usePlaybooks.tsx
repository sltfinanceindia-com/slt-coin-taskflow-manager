import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  assignee_role: string;
  days_offset: number;
}

export interface Playbook {
  id: string;
  name: string;
  type: 'onboarding' | 'offboarding';
  department_id?: string;
  role?: string;
  description?: string;
  checklist_items: ChecklistItem[];
  is_active: boolean;
  created_by?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LifecycleInstance {
  id: string;
  playbook_id: string;
  employee_id: string;
  started_at: string;
  target_completion_date?: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_by?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  playbook?: Playbook;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface InstanceItem {
  id: string;
  instance_id: string;
  item_title: string;
  item_description?: string;
  category?: string;
  assignee_role?: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  sort_order: number;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export const usePlaybooks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all playbooks
  const { data: playbooks = [], isLoading: playbooksLoading } = useQuery({
    queryKey: ['lifecycle-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lifecycle_playbooks')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        type: p.type as 'onboarding' | 'offboarding',
        checklist_items: (p.checklist_items as unknown as ChecklistItem[]) || []
      })) as Playbook[];
    },
    enabled: !!user,
  });

  // Fetch all instances with related data
  const { data: instances = [], isLoading: instancesLoading } = useQuery({
    queryKey: ['lifecycle-instances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lifecycle_instances')
        .select(`
          *,
          playbook:lifecycle_playbooks(*),
          employee:profiles!lifecycle_instances_employee_id_fkey(id, full_name, email, avatar_url, role)
        `)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(instance => ({
        ...instance,
        status: instance.status as 'in_progress' | 'completed' | 'cancelled',
        playbook: instance.playbook ? {
          ...instance.playbook,
          type: instance.playbook.type as 'onboarding' | 'offboarding',
          checklist_items: (instance.playbook.checklist_items as unknown as ChecklistItem[]) || []
        } : undefined
      })) as LifecycleInstance[];
    },
    enabled: !!user,
  });

  // Fetch instance items for a specific instance
  const useInstanceItems = (instanceId: string) => {
    return useQuery({
      queryKey: ['lifecycle-instance-items', instanceId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('lifecycle_instance_items')
          .select(`
            *,
            assignee:profiles!lifecycle_instance_items_assigned_to_fkey(id, full_name, avatar_url)
          `)
          .eq('instance_id', instanceId)
          .order('sort_order');
        
        if (error) throw error;
        return data as InstanceItem[];
      },
      enabled: !!instanceId,
    });
  };

  // Create playbook
  const createPlaybook = useMutation({
    mutationFn: async (playbook: Omit<Playbook, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('lifecycle_playbooks')
        .insert({
          ...playbook,
          checklist_items: playbook.checklist_items as unknown as Json
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-playbooks'] });
      toast.success('Playbook created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create playbook: ' + error.message);
    },
  });

  // Update playbook
  const updatePlaybook = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Playbook> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.checklist_items) {
        updateData.checklist_items = updates.checklist_items as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('lifecycle_playbooks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-playbooks'] });
      toast.success('Playbook updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update playbook: ' + error.message);
    },
  });

  // Delete playbook
  const deletePlaybook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lifecycle_playbooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-playbooks'] });
      toast.success('Playbook deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete playbook: ' + error.message);
    },
  });

  // Start instance (apply playbook to employee)
  const startInstance = useMutation({
    mutationFn: async ({ 
      playbookId, 
      employeeId, 
      targetDate 
    }: { 
      playbookId: string; 
      employeeId: string; 
      targetDate?: string;
    }) => {
      // Get the playbook
      const { data: playbook, error: pbError } = await supabase
        .from('lifecycle_playbooks')
        .select('*')
        .eq('id', playbookId)
        .single();
      
      if (pbError) throw pbError;

      // Create instance
      const { data: instance, error: instError } = await supabase
        .from('lifecycle_instances')
        .insert({
          playbook_id: playbookId,
          employee_id: employeeId,
          target_completion_date: targetDate,
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (instError) throw instError;

      // Create checklist items from playbook
      const checklistItems = (playbook.checklist_items as unknown as ChecklistItem[]) || [];
      const startDate = new Date();
      
      const items = checklistItems.map((item, index) => ({
        instance_id: instance.id,
        item_title: item.title,
        item_description: item.description,
        category: item.category,
        assignee_role: item.assignee_role,
        due_date: new Date(startDate.getTime() + item.days_offset * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        sort_order: index
      }));

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('lifecycle_instance_items')
          .insert(items);
        
        if (itemsError) throw itemsError;
      }

      return instance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-instances'] });
      toast.success('Lifecycle process started successfully');
    },
    onError: (error) => {
      toast.error('Failed to start lifecycle process: ' + error.message);
    },
  });

  // Complete instance item
  const completeItem = useMutation({
    mutationFn: async ({ itemId, notes }: { itemId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('lifecycle_instance_items')
        .update({
          completed_at: new Date().toISOString(),
          notes
        })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-instance-items'] });
      toast.success('Item completed');
    },
    onError: (error) => {
      toast.error('Failed to complete item: ' + error.message);
    },
  });

  // Assign item to user
  const assignItem = useMutation({
    mutationFn: async ({ itemId, userId }: { itemId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('lifecycle_instance_items')
        .update({ assigned_to: userId })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-instance-items'] });
      toast.success('Item assigned');
    },
    onError: (error) => {
      toast.error('Failed to assign item: ' + error.message);
    },
  });

  // Complete instance
  const completeInstance = useMutation({
    mutationFn: async (instanceId: string) => {
      const { data, error } = await supabase
        .from('lifecycle_instances')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', instanceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-instances'] });
      toast.success('Lifecycle process completed');
    },
    onError: (error) => {
      toast.error('Failed to complete process: ' + error.message);
    },
  });

  // Cancel instance
  const cancelInstance = useMutation({
    mutationFn: async (instanceId: string) => {
      const { data, error } = await supabase
        .from('lifecycle_instances')
        .update({ status: 'cancelled' })
        .eq('id', instanceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifecycle-instances'] });
      toast.success('Lifecycle process cancelled');
    },
    onError: (error) => {
      toast.error('Failed to cancel process: ' + error.message);
    },
  });

  return {
    playbooks,
    playbooksLoading,
    instances,
    instancesLoading,
    useInstanceItems,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    startInstance,
    completeItem,
    assignItem,
    completeInstance,
    cancelInstance,
  };
};
