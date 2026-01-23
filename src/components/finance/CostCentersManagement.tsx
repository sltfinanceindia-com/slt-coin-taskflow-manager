import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Search, DollarSign, Users, TrendingUp, Edit, Loader2, FileX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCostCenters } from '@/hooks/useCostCenters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function CostCentersManagement() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    manager_id: '',
    budget: 0,
  });

  const { costCenters, isLoading, error, createCostCenter } = useCostCenters();

  const { data: employees } = useQuery({
    queryKey: ['employees-for-manager', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.department) return;
    
    createCostCenter.mutate({
      code: formData.code,
      name: formData.name,
      department: formData.department,
      manager_id: formData.manager_id || null,
      budget: formData.budget,
      actual_spend: 0,
      headcount: 0,
    });
    
    setIsDialogOpen(false);
    setFormData({ code: '', name: '', department: '', manager_id: '', budget: 0 });
  };

  const filteredCostCenters = costCenters.filter(cc =>
    cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cc.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredCostCenters.map(cc => ({
    name: cc.code,
    budget: (cc.budget || 0) / 1000000,
    actual: (cc.actual_spend || 0) / 1000000,
  }));

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const totalBudget = costCenters.reduce((acc, cc) => acc + (cc.budget || 0), 0);
  const totalActual = costCenters.reduce((acc, cc) => acc + (cc.actual_spend || 0), 0);
  const totalHeadcount = costCenters.reduce((acc, cc) => acc + (cc.headcount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <FileX className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading cost centers</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Centers</h2>
          <p className="text-muted-foreground">Manage organizational cost centers and allocations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Cost Center
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Cost Center</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Cost Center Code</Label>
                <Input 
                  placeholder="e.g., CC-ENG-003" 
                  value={formData.code}
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input 
                  placeholder="Cost Center Name" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Manager</Label>
                <Select value={formData.manager_id} onValueChange={(v) => setFormData(p => ({ ...p, manager_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Annual Budget (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="Enter budget"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(p => ({ ...p, budget: Number(e.target.value) }))}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createCostCenter.isPending}>
                {createCostCenter.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost Centers</p>
                <p className="text-2xl font-bold">{costCenters.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
                <p className="text-2xl font-bold">{totalHeadcount}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Cost Center</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(1)}M`} />
                <Legend />
                <Bar dataKey="budget" fill="hsl(var(--primary))" name="Budget" />
                <Bar dataKey="actual" fill="hsl(var(--secondary))" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cost centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Centers</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCostCenters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cost centers found</p>
              <p className="text-sm">Create your first cost center to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-center">Headcount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCostCenters.map((cc) => {
                  const variance = (cc.budget || 0) - (cc.actual_spend || 0);
                  const variancePercent = cc.budget ? Math.round((variance / cc.budget) * 100) : 0;
                  return (
                    <TableRow key={cc.id}>
                      <TableCell className="font-mono text-sm">{cc.code}</TableCell>
                      <TableCell className="font-medium">{cc.name}</TableCell>
                      <TableCell>{cc.department}</TableCell>
                      <TableCell>{cc.manager?.full_name || '-'}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(cc.budget || 0)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(cc.actual_spend || 0)}</TableCell>
                      <TableCell className={`text-right font-mono ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)
                      </TableCell>
                      <TableCell className="text-center">{cc.headcount || 0}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
