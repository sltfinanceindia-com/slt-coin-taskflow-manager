import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAssets, AssetType, EmployeeAsset } from '@/hooks/useAssets';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { 
  Package, Plus, Laptop, Smartphone, Tablet, CreditCard, 
  Key, Monitor, Headphones, MoreVertical, RotateCcw, Trash2,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ASSET_TYPES: { value: AssetType; label: string; icon: React.ReactNode }[] = [
  { value: 'laptop', label: 'Laptop', icon: <Laptop className="h-4 w-4" /> },
  { value: 'phone', label: 'Phone', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'tablet', label: 'Tablet', icon: <Tablet className="h-4 w-4" /> },
  { value: 'id_card', label: 'ID Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'access_card', label: 'Access Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'keys', label: 'Keys', icon: <Key className="h-4 w-4" /> },
  { value: 'monitor', label: 'Monitor', icon: <Monitor className="h-4 w-4" /> },
  { value: 'headset', label: 'Headset', icon: <Headphones className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <Package className="h-4 w-4" /> },
];

const getAssetIcon = (type: AssetType) => {
  const assetType = ASSET_TYPES.find(t => t.value === type);
  return assetType?.icon || <Package className="h-4 w-4" />;
};

interface AssetTrackerProps {
  employeeId?: string;
}

export const AssetTracker: React.FC<AssetTrackerProps> = ({ employeeId }) => {
  const { assets, isLoading, activeAssets, returnedAssets, assignAsset, returnAsset, deleteAsset } = useAssets(employeeId);
  const { employees = [] } = useEmployeeDirectory();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<EmployeeAsset | null>(null);
  
  const [newAsset, setNewAsset] = useState({
    employee_id: employeeId || '',
    asset_type: 'laptop' as AssetType,
    asset_name: '',
    serial_number: '',
    asset_tag: '',
    condition_on_assign: '',
    notes: ''
  });

  const [returnData, setReturnData] = useState({
    condition: '',
    notes: ''
  });

  const handleAssignAsset = () => {
    if (!newAsset.employee_id || !newAsset.asset_name) return;
    
    assignAsset.mutate({
      employee_id: newAsset.employee_id,
      asset_type: newAsset.asset_type,
      asset_name: newAsset.asset_name,
      serial_number: newAsset.serial_number || undefined,
      asset_tag: newAsset.asset_tag || undefined,
      condition_on_assign: newAsset.condition_on_assign || undefined,
      notes: newAsset.notes || undefined,
      assigned_at: new Date().toISOString()
    });
    
    setIsAssignDialogOpen(false);
    setNewAsset({
      employee_id: employeeId || '',
      asset_type: 'laptop',
      asset_name: '',
      serial_number: '',
      asset_tag: '',
      condition_on_assign: '',
      notes: ''
    });
  };

  const handleReturnAsset = () => {
    if (!selectedAsset) return;
    
    returnAsset.mutate({
      assetId: selectedAsset.id,
      condition: returnData.condition || undefined,
      notes: returnData.notes || undefined
    });
    
    setIsReturnDialogOpen(false);
    setSelectedAsset(null);
    setReturnData({ condition: '', notes: '' });
  };

  const openReturnDialog = (asset: EmployeeAsset) => {
    setSelectedAsset(asset);
    setIsReturnDialogOpen(true);
  };

  // Group active assets by type
  const assetsByType = activeAssets.reduce((acc, asset) => {
    if (!acc[asset.asset_type]) acc[asset.asset_type] = [];
    acc[asset.asset_type].push(asset);
    return acc;
  }, {} as Record<AssetType, EmployeeAsset[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asset Tracker
          </h3>
          <p className="text-sm text-muted-foreground">
            Track equipment assigned to employees
          </p>
        </div>
        
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign New Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!employeeId && (
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select
                    value={newAsset.employee_id}
                    onValueChange={(value) => setNewAsset(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={emp.avatar_url} />
                              <AvatarFallback>{emp.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {emp.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select
                    value={newAsset.asset_type}
                    onValueChange={(value: AssetType) => setNewAsset(prev => ({ ...prev, asset_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Asset Name</Label>
                  <Input
                    placeholder="e.g., MacBook Pro 14"
                    value={newAsset.asset_name}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, asset_name: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    placeholder="Optional"
                    value={newAsset.serial_number}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, serial_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asset Tag</Label>
                  <Input
                    placeholder="Optional"
                    value={newAsset.asset_tag}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, asset_tag: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Condition</Label>
                <Input
                  placeholder="e.g., New, Good, Fair"
                  value={newAsset.condition_on_assign}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, condition_on_assign: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional notes..."
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignAsset}
                  disabled={!newAsset.employee_id || !newAsset.asset_name || assignAsset.isPending}
                >
                  Assign Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activeAssets.length}</p>
                <p className="text-sm text-muted-foreground">Active Assets</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{returnedAssets.length}</p>
                <p className="text-sm text-muted-foreground">Returned</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Object.keys(assetsByType).length}</p>
                <p className="text-sm text-muted-foreground">Asset Types</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Laptop className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{assets.length}</p>
                <p className="text-sm text-muted-foreground">Total Tracked</p>
              </div>
              <div className="rounded-full bg-muted p-3">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
          <CardDescription>
            Equipment assigned to employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No assets tracked yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start by assigning assets to employees
              </p>
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Assign Asset
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Serial/Tag</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-muted p-2">
                            {getAssetIcon(asset.asset_type)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.asset_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {asset.asset_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={asset.employee?.avatar_url} />
                            <AvatarFallback>
                              {asset.employee?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {asset.employee?.full_name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {asset.serial_number && (
                            <p className="font-mono text-xs">{asset.serial_number}</p>
                          )}
                          {asset.asset_tag && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {asset.asset_tag}
                            </Badge>
                          )}
                          {!asset.serial_number && !asset.asset_tag && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(asset.assigned_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {asset.returned_at ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Returned
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!asset.returned_at && (
                              <DropdownMenuItem onClick={() => openReturnDialog(asset)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Mark as Returned
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteAsset.mutate(asset.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <div className="rounded-md bg-muted p-2">
                  {getAssetIcon(selectedAsset.asset_type)}
                </div>
                <div>
                  <p className="font-medium">{selectedAsset.asset_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Assigned to {selectedAsset.employee?.full_name}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Condition on Return</Label>
                <Input
                  placeholder="e.g., Good, Minor scratches"
                  value={returnData.condition}
                  onChange={(e) => setReturnData(prev => ({ ...prev, condition: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any notes about the return..."
                  value={returnData.notes}
                  onChange={(e) => setReturnData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReturnAsset} disabled={returnAsset.isPending}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Return
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
