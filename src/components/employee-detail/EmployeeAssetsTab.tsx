/**
 * Employee Assets Tab
 * Assigned assets, asset details, return requests
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Laptop, Smartphone, Monitor, Package, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface EmployeeAssetsTabProps {
  employeeId: string;
}

export function EmployeeAssetsTab({ employeeId }: EmployeeAssetsTabProps) {
  const { data: assets = [] } = useQuery({
    queryKey: ['employee-assets', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_assignments')
        .select('*')
        .eq('assigned_to', employeeId)
        .order('assigned_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const getAssetIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop className="h-5 w-5" />;
      case 'phone': return <Smartphone className="h-5 w-5" />;
      case 'monitor': return <Monitor className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Assign Asset
        </Button>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigned Assets</CardTitle>
          <CardDescription>Hardware and equipment assigned to this employee</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assets assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset: any) => (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-background rounded-lg">
                      {getAssetIcon(asset.asset_type)}
                    </div>
                    <div>
                      <p className="font-medium">{asset.asset_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{asset.asset_tag}</span>
                        {asset.serial_number && (
                          <>
                            <span>•</span>
                            <span>SN: {asset.serial_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getConditionColor(asset.condition)}>
                      {asset.condition || 'Unknown'}
                    </Badge>
                    {asset.assigned_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned {format(parseISO(asset.assigned_date), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
