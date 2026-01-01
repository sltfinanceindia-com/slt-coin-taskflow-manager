import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'url' | 'textarea';

export interface CustomFieldDefinition {
  id: string;
  organization_id: string;
  entity_type: string;
  name: string;
  field_type: CustomFieldType;
  options?: Json;
  is_required: boolean | null;
  is_active: boolean | null;
  position: number | null;
  created_at: string | null;
}

export interface CustomFieldValue {
  id: string;
  field_id: string;
  entity_id: string;
  entity_type: string;
  value: Json;
  created_at: string | null;
}

export function useCustomFields(entityType: string = 'task', entityId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch field definitions
  const definitionsQuery = useQuery({
    queryKey: ['custom-field-definitions', profile?.organization_id, entityType],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('custom_field_definitions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('entity_type', entityType)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data || []) as CustomFieldDefinition[];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch field values for specific entity
  const valuesQuery = useQuery({
    queryKey: ['custom-field-values', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('custom_field_values')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType);

      if (error) throw error;
      return (data || []) as CustomFieldValue[];
    },
    enabled: !!entityId,
  });

  // Create field definition
  const createDefinitionMutation = useMutation({
    mutationFn: async (field: Omit<CustomFieldDefinition, 'id' | 'created_at' | 'organization_id'>) => {
      const { data, error } = await supabase
        .from('custom_field_definitions')
        .insert({
          name: field.name,
          entity_type: field.entity_type,
          field_type: field.field_type,
          options: field.options ?? null,
          is_required: field.is_required,
          is_active: field.is_active,
          position: field.position,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-definitions'] });
      toast({ title: 'Custom Field Created', description: 'Field has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update field definition
  const updateDefinitionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CustomFieldDefinition> }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.field_type !== undefined) updateData.field_type = updates.field_type;
      if (updates.options !== undefined) updateData.options = updates.options;
      if (updates.is_required !== undefined) updateData.is_required = updates.is_required;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.position !== undefined) updateData.position = updates.position;

      const { data, error } = await supabase
        .from('custom_field_definitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-definitions'] });
      toast({ title: 'Custom Field Updated', description: 'Field has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete field definition
  const deleteDefinitionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_field_definitions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-definitions'] });
      toast({ title: 'Custom Field Deleted', description: 'Field has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Save field value
  const saveValueMutation = useMutation({
    mutationFn: async ({ fieldId, entityId, value }: { fieldId: string; entityId: string; value: Json }) => {
      // Check if value exists
      const { data: existing } = await supabase
        .from('custom_field_values')
        .select('id')
        .eq('field_id', fieldId)
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('custom_field_values')
          .update({ value })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('custom_field_values')
          .insert({
            field_id: fieldId,
            entity_id: entityId,
            entity_type: entityType,
            value,
            organization_id: profile?.organization_id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-values'] });
    },
  });

  // Bulk save values
  const saveAllValuesMutation = useMutation({
    mutationFn: async ({ entityId, values }: { entityId: string; values: Record<string, Json> }) => {
      for (const [fieldId, value] of Object.entries(values)) {
        await saveValueMutation.mutateAsync({ fieldId, entityId, value });
      }
    },
  });

  // Get value for a specific field
  const getFieldValue = (fieldId: string): Json | undefined => {
    const fieldValue = valuesQuery.data?.find(v => v.field_id === fieldId);
    return fieldValue?.value;
  };

  return {
    definitions: definitionsQuery.data || [],
    values: valuesQuery.data || [],
    isLoadingDefinitions: definitionsQuery.isLoading,
    isLoadingValues: valuesQuery.isLoading,
    createDefinition: createDefinitionMutation.mutate,
    updateDefinition: updateDefinitionMutation.mutate,
    deleteDefinition: deleteDefinitionMutation.mutate,
    saveValue: saveValueMutation.mutate,
    saveAllValues: saveAllValuesMutation.mutate,
    getFieldValue,
    isCreating: createDefinitionMutation.isPending,
    isUpdating: updateDefinitionMutation.isPending,
    isSaving: saveValueMutation.isPending || saveAllValuesMutation.isPending,
  };
}
