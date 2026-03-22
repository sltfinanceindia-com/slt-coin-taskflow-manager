import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calculator, Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Loader2, FileX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { useBudgets } from '@/hooks/useBudgets';

export function BudgetPlanningManagement() {
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    category: '',
    allocated_amount: 0,
    fiscal_year: '2024-25',
  });

  const { budgets, isLoading, error, createBudget } = useBudgets();

  const handleSubmit = () => {
    if (!formData.department || !formData.category || formData.allocated_amount <= 0) return;
    
    createBudget.mutate({
      department: formData.department,
      category: formData.category,
      allocated_amount: formData.allocated_amount,
      spent_amount: 0,
      fiscal_year: formData.fiscal_year,
      status: 'on_track',
    });
    
    setIsDialogOpen(false);
    setFormData({ department: '', category: '', allocated_amount: 0, fiscal_year: '2024-25' });
  };

  const filteredBudgets = budgets.filter(b => b.fiscal_year === selectedYear);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'On Track' },
      at_risk: { variant: 'secondary', label: 'At Risk' },
      over_budget: { variant: 'destructive', label: 'Over Budget' },
    };
    const cfg = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const totalAllocated = filteredBudgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
  const totalSpent = filteredBudgets.reduce((acc, b) => acc + (b.spent_amount || 0), 0);
  const utilizationRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  // Prepare chart data
  const departmentData = filteredBudgets.reduce((acc, b) => {
    const existing = acc.find(d => d.name === b.department);
    if (existing) {
      existing.budget += (b.allocated_amount || 0) / 1000000;
      existing.actual += (b.spent_amount || 0) / 1000000;
    } else {
      acc.push({ name: b.department, budget: (b.allocated_amount || 0) / 1000000, actual: (b.spent_amount || 0) / 1000000 });
    }
    return acc;
  }, [] as { name: string; budget: number; actual: number }[]);

  const pieData = filteredBudgets.reduce((acc, b) => {
    const existing = acc.find(d => d.name === b.category);
    if (existing) {
      existing.value += (b.allocated_amount || 0);
    } else {
      acc.push({ name: b.category, value: (b.allocated_amount || 0), color: `hsl(${acc.length * 60}, 70%, 50%)` });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

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
        <h3 className="mt-4 font-semibold">Error loading budgets</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Budget Planning</h2>
          <p className="text-muted-foreground">Annual budget allocation and tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">FY 2024-25</SelectItem>
              <SelectItem value="2023-24">FY 2023-24</SelectItem>
              <SelectItem value="2025-26">FY 2025-26</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Budget Allocation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Department</Label>
                  <Select value={formData.department} onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salaries">Salaries</SelectItem>
                      <SelectItem value="Tools & Software">Tools & Software</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allocated Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter amount"
                    value={formData.allocated_amount || ''}
                    onChange={(e) => setFormData(p => ({ ...p, allocated_amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Fiscal Year</Label>
                  <Select value={formData.fiscal_year} onValueChange={(v) => setFormData(p => ({ ...p, fiscal_year: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">FY 2024-25</SelectItem>
                      <SelectItem value="2025-26">FY 2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={createBudget.isPending}>
                  {createBudget.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Budget'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAllocated)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{utilizationRate}%</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Lines</p>
                <p className="text-2xl font-bold">{filteredBudgets.length}</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {filteredBudgets.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
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

          <Card>
            <CardHeader>
              <CardTitle>Budget Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No budget allocations found</p>
              <p className="text-sm">Create your first budget allocation to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => {
                  const remaining = (budget.allocated_amount || 0) - (budget.spent_amount || 0);
                  const utilization = budget.allocated_amount ? Math.round((budget.spent_amount || 0) / budget.allocated_amount * 100) : 0;
                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.department}</TableCell>
                      <TableCell>{budget.category}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(budget.allocated_amount || 0)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(budget.spent_amount || 0)}</TableCell>
                      <TableCell className={`text-right font-mono ${remaining < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(utilization, 100)} className="h-2 w-20" />
                          <span className="text-sm">{utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(budget.status || 'active')}</TableCell>
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
