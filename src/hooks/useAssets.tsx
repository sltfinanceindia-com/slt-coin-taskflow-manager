import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type AssetType = 'laptop' | 'phone' | 'tablet' | 'id_card' | 'access_card' | 'keys' | 'monitor' | 'headset' | 'other';

export interface EmployeeAsset {
  id: string;
  employee_id: string;
  asset_type: AssetType;
  asset_name: string;
  serial_number?: string;
  asset_tag?: string;
  assigned_at: string;
  returned_at?: string;
  condition_on_assign?: string;
  condition_on_return?: string;
  notes?: string;
  assigned_by?: string;
  received_by?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export const useAssets = (employeeId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all assets or filter by employee
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['employee-assets', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('employee_assets')
        .select(`
          *,
          employee:profiles!employee_assets_employee_id_fkey(id, full_name, email, avatar_url)
        `)
        .order('assigned_at', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(asset => ({
        ...asset,
        asset_type: asset.asset_type as AssetType
      })) as EmployeeAsset[];
    },
    enabled: !!user,
  });

  // Assign asset to employee
  const assignAsset = useMutation({
    mutationFn: async (asset: Omit<EmployeeAsset, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase
        .from('employee_assets')
        .insert(asset)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-assets'] });
      toast.success('Asset assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign asset: ' + error.message);
    },
  });

  // Return asset
  const returnAsset = useMutation({
    mutationFn: async ({ 
      assetId, 
      condition, 
      notes 
    }: { 
      assetId: string; 
      condition?: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_assets')
        .update({
          returned_at: new Date().toISOString(),
          condition_on_return: condition,
          notes
        })
        .eq('id', assetId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-assets'] });
      toast.success('Asset returned successfully');
    },
    onError: (error) => {
      toast.error('Failed to return asset: ' + error.message);
    },
  });

  // Update asset
  const updateAsset = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeAsset> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-assets'] });
      toast.success('Asset updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update asset: ' + error.message);
    },
  });

  // Delete asset
  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_assets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-assets'] });
      toast.success('Asset deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete asset: ' + error.message);
    },
  });

  // Get assets by type
  const getAssetsByType = (type: AssetType) => {
    return assets.filter(a => a.asset_type === type);
  };

  // Get active (not returned) assets
  const activeAssets = assets.filter(a => !a.returned_at);
  
  // Get returned assets
  const returnedAssets = assets.filter(a => a.returned_at);

  return {
    assets,
    isLoading,
    activeAssets,
    returnedAssets,
    getAssetsByType,
    assignAsset,
    returnAsset,
    updateAsset,
    deleteAsset,
  };
};
