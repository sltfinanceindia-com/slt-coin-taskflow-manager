import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Laptop, 
  Plus, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Package,
  Monitor,
  Smartphone,
  Key
} from 'lucide-react';

const ASSET_TYPES = [
  { value: 'laptop', label: 'Laptop', icon: Laptop },
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'mobile', label: 'Mobile Phone', icon: Smartphone },
  { value: 'tablet', label: 'Tablet', icon: Monitor },
  { value: 'monitor', label: 'Monitor', icon: Monitor },
  { value: 'keyboard', label: 'Keyboard', icon: Package },
  { value: 'mouse', label: 'Mouse', icon: Package },
  { value: 'headset', label: 'Headset', icon: Package },
  { value: 'id_card', label: 'ID Card', icon: Key },
  { value: 'access_key', label: 'Access Key', icon: Key },
  { value: 'other', label: 'Other', icon: Package },
];

const ASSET_CONDITIONS = [
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'excellent', label: 'Excellent', color: 'bg-blue-100 text-blue-800' },
  { value: 'good', label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fair', label: 'Fair', color: 'bg-orange-100 text-orange-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
];

export function AssetManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    asset_tag: '',
    asset_type: '',
    asset_name: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_value: '',
    assigned_to: '',
    notes: '',
  });

  // Fetch employees for assignment
  const { data: employees } = useQuery({
    queryKey: ['asset-employees', profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!profile?.organization_id && isAdmin,
  });

  // Fetch assets
  const { data: assets, isLoading } = useQuery({
    queryKey: ['asset-assignments', profile?.organization_id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('asset_assignments')
        .select(`
          *,
          assigned_user:profiles!asset_assignments_assigned_to_fkey(id, full_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('assigned_to', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async (asset: typeof newAsset) => {
      const { data, error } = await supabase
        .from('asset_assignments')
        .insert({
          organization_id: profile?.organization_id,
          asset_tag: asset.asset_tag,
          asset_type: asset.asset_type,
          asset_name: asset.asset_name,
          brand: asset.brand || null,
          model: asset.model || null,
          serial_number: asset.serial_number || null,
          purchase_date: asset.purchase_date || null,
          purchase_value: asset.purchase_value ? parseFloat(asset.purchase_value) : null,
          current_value: asset.purchase_value ? parseFloat(asset.purchase_value) : null,
          assigned_to: asset.assigned_to || null,
          assigned_by: asset.assigned_to ? profile?.id : null,
          assigned_date: asset.assigned_to ? new Date().toISOString() : null,
          status: asset.assigned_to ? 'assigned' : 'available',
          notes: asset.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-assignments'] });
      setIsCreateOpen(false);
      setNewAsset({
        asset_tag: '',
        asset_type: '',
        asset_name: '',
        brand: '',
        model: '',
        serial_number: '',
        purchase_date: '',
        purchase_value: '',
        assigned_to: '',
        notes: '',
      });
      toast({ title: 'Asset created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating asset', description: error.message, variant: 'destructive' });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30">Assigned</Badge>;
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30">Available</Badge>;
      case 'under_repair':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30">Under Repair</Badge>;
      case 'retired':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30">Retired</Badge>;
      case 'lost':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30">Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    const conditionConfig = ASSET_CONDITIONS.find(c => c.value === condition);
    return <Badge className={conditionConfig?.color || 'bg-gray-100'}>{conditionConfig?.label || condition}</Badge>;
  };

  const getAssetIcon = (type: string) => {
    const assetType = ASSET_TYPES.find(t => t.value === type);
    const IconComponent = assetType?.icon || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  // Calculate stats
  const totalAssets = assets?.length || 0;
  const assignedAssets = assets?.filter(a => a.status === 'assigned').length || 0;
  const availableAssets = assets?.filter(a => a.status === 'available').length || 0;
  const totalValue = assets?.reduce((sum, a) => sum + (Number(a.current_value) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage and track organization assets' : 'View your assigned assets'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>Register a new asset in the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Asset Tag *</Label>
                      <Input 
                        value={newAsset.asset_tag}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, asset_tag: e.target.value }))}
                        placeholder="e.g., LAP-001"
                      />
                    </div>
                    <div>
                      <Label>Asset Type *</Label>
                      <Select 
                        value={newAsset.asset_type} 
                        onValueChange={(v) => setNewAsset(prev => ({ ...prev, asset_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Asset Name *</Label>
                    <Input 
                      value={newAsset.asset_name}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, asset_name: e.target.value }))}
                      placeholder="e.g., Dell Latitude 5520"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Brand</Label>
                      <Input 
                        value={newAsset.brand}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="e.g., Dell"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input 
                        value={newAsset.model}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="e.g., Latitude 5520"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Serial Number</Label>
                    <Input 
                      value={newAsset.serial_number}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, serial_number: e.target.value }))}
                      placeholder="Serial number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Purchase Date</Label>
                      <Input 
                        type="date"
                        value={newAsset.purchase_date}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Purchase Value (₹)</Label>
                      <Input 
                        type="number"
                        value={newAsset.purchase_value}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_value: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Assign To (Optional)</Label>
                    <Select 
                      value={newAsset.assigned_to} 
                      onValueChange={(v) => setNewAsset(prev => ({ ...prev, assigned_to: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {employees?.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea 
                      value={newAsset.notes}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createAssetMutation.mutate(newAsset)}
                    disabled={createAssetMutation.isPending || !newAsset.asset_tag || !newAsset.asset_type || !newAsset.asset_name}
                  >
                    {createAssetMutation.isPending ? 'Creating...' : 'Add Asset'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{assignedAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Inventory</CardTitle>
          <CardDescription>
            {isAdmin ? 'All organization assets' : 'Assets assigned to you'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : assets && assets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Type</TableHead>
                    {isAdmin && <TableHead>Assigned To</TableHead>}
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAssetIcon(asset.asset_type)}
                          <div>
                            <div className="font-medium">{asset.asset_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {asset.brand} {asset.model}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{asset.asset_tag}</TableCell>
                      <TableCell className="capitalize">{asset.asset_type?.replace('_', ' ')}</TableCell>
                      {isAdmin && (
                        <TableCell>{(asset.assigned_user as any)?.full_name || '-'}</TableCell>
                      )}
                      <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell className="text-right">
                        {asset.current_value ? `₹${Number(asset.current_value).toLocaleString()}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assets found</p>
              <p className="text-sm">{isAdmin ? 'Add your first asset to get started' : 'No assets assigned to you'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
