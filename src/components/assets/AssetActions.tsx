import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, differenceInYears } from 'date-fns';
import { 
  Undo2, 
  Wrench, 
  TrendingDown, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Asset {
  id: string;
  asset_name: string;
  asset_tag: string;
  status: string;
  assigned_to?: string;
  purchase_value?: number;
  purchase_date?: string;
  current_value?: number;
}

// Return/Unassign Asset Component
interface ReturnAssetProps {
  asset: Asset;
  onSuccess?: () => void;
}

export function ReturnAsset({ asset, onSuccess }: ReturnAssetProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState('good');
  const [notes, setNotes] = useState('');

  const returnMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('asset_assignments')
        .update({
          assigned_to: null,
          status: 'available',
          return_date: new Date().toISOString(),
          condition: returnCondition,
          notes: notes ? `Returned: ${notes}` : `Returned on ${format(new Date(), 'PPP')}`
        })
        .eq('id', asset.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-assignments'] });
      setIsOpen(false);
      toast({ title: 'Asset returned successfully' });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Undo2 className="h-3 w-3" />
          Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            Returning: {asset.asset_name} ({asset.asset_tag})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Return Condition</Label>
            <Select value={returnCondition} onValueChange={setReturnCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor - Needs Repair</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the asset condition..."
              rows={3}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={() => returnMutation.mutate()}
            disabled={returnMutation.isPending}
          >
            {returnMutation.isPending ? 'Processing...' : 'Confirm Return'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Maintenance Scheduler Component
interface MaintenanceSchedulerProps {
  assetId: string;
}

export function MaintenanceScheduler({ assetId }: MaintenanceSchedulerProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    maintenance_type: 'preventive',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    estimated_cost: ''
  });

  // Maintenance records would be stored in notes or a separate tracking system
  const maintenanceRecords: any[] = [];

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      // Update asset with maintenance note
      const { error } = await supabase
        .from('asset_assignments')
        .update({
          notes: `Maintenance scheduled: ${formData.maintenance_type} on ${formData.scheduled_date}. ${formData.description}`,
          status: 'under_repair'
        })
        .eq('id', assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] });
      setIsOpen(false);
      setFormData({
        maintenance_type: 'preventive',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        estimated_cost: ''
      });
      toast({ title: 'Maintenance scheduled' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Maintenance Schedule
        </h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Maintenance Type</Label>
                <Select 
                  value={formData.maintenance_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, maintenance_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective/Repair</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the maintenance work..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Estimated Cost (₹)</Label>
                <Input
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => scheduleMutation.mutate()}
                disabled={scheduleMutation.isPending}
              >
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {maintenanceRecords && maintenanceRecords.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceRecords.slice(0, 5).map((record: any) => (
              <TableRow key={record.id}>
                <TableCell className="capitalize">{record.maintenance_type}</TableCell>
                <TableCell>{format(new Date(record.scheduled_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                    {record.status === 'completed' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" />Done</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" />Scheduled</>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {record.actual_cost ? `₹${record.actual_cost.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No maintenance records yet
        </p>
      )}
    </div>
  );
}

// Depreciation Calculator Component
interface DepreciationTrackerProps {
  asset: Asset;
}

export function DepreciationTracker({ asset }: DepreciationTrackerProps) {
  if (!asset.purchase_value || !asset.purchase_date) {
    return null;
  }

  const purchaseDate = new Date(asset.purchase_date);
  const yearsOwned = differenceInYears(new Date(), purchaseDate);
  const annualDepreciationRate = 0.20; // 20% annual depreciation (straight line)
  
  // Calculate depreciated value
  const depreciatedValue = Math.max(
    asset.purchase_value * 0.1, // Minimum 10% residual value
    asset.purchase_value * Math.pow(1 - annualDepreciationRate, yearsOwned)
  );
  
  const totalDepreciation = asset.purchase_value - depreciatedValue;
  const depreciationPercentage = (totalDepreciation / asset.purchase_value) * 100;

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-amber-600" />
          Depreciation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Purchase Value</p>
            <p className="font-bold">₹{asset.purchase_value.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Value</p>
            <p className="font-bold text-green-600">₹{Math.round(depreciatedValue).toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Depreciation ({yearsOwned} years)</span>
            <span className="text-amber-600">-₹{Math.round(totalDepreciation).toLocaleString('en-IN')}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${depreciationPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(depreciationPercentage)}% depreciated
          </p>
        </div>

        {depreciationPercentage > 80 && (
          <div className="flex items-center gap-2 text-amber-600 text-xs">
            <AlertTriangle className="h-3 w-3" />
            Consider replacement or major maintenance
          </div>
        )}
      </CardContent>
    </Card>
  );
}
