import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calculator, Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from 'recharts';

interface Budget {
  id: string;
  department: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  fiscal_year: string;
  status: 'on_track' | 'at_risk' | 'over_budget';
}

export function BudgetPlanningManagement() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const budgets: Budget[] = [
    { id: '1', department: 'Engineering', category: 'Salaries', allocated: 50000000, spent: 42000000, remaining: 8000000, fiscal_year: '2024', status: 'on_track' },
    { id: '2', department: 'Engineering', category: 'Tools & Software', allocated: 5000000, spent: 4800000, remaining: 200000, fiscal_year: '2024', status: 'at_risk' },
    { id: '3', department: 'Marketing', category: 'Campaigns', allocated: 10000000, spent: 11500000, remaining: -1500000, fiscal_year: '2024', status: 'over_budget' },
    { id: '4', department: 'HR', category: 'Training', allocated: 3000000, spent: 1500000, remaining: 1500000, fiscal_year: '2024', status: 'on_track' },
    { id: '5', department: 'Operations', category: 'Infrastructure', allocated: 8000000, spent: 6000000, remaining: 2000000, fiscal_year: '2024', status: 'on_track' },
  ];

  const departmentData = [
    { name: 'Engineering', budget: 55, actual: 47 },
    { name: 'Marketing', budget: 10, actual: 11.5 },
    { name: 'HR', budget: 3, actual: 1.5 },
    { name: 'Operations', budget: 8, actual: 6 },
    { name: 'Sales', budget: 12, actual: 10 },
  ];

  const pieData = [
    { name: 'Salaries', value: 65, color: '#3b82f6' },
    { name: 'Operations', value: 15, color: '#22c55e' },
    { name: 'Marketing', value: 10, color: '#f97316' },
    { name: 'Training', value: 5, color: '#8b5cf6' },
    { name: 'Tools', value: 5, color: '#ec4899' },
  ];

  const getStatusBadge = (status: Budget['status']) => {
    const config: Record<Budget['status'], { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      on_track: { variant: 'default', label: 'On Track' },
      at_risk: { variant: 'secondary', label: 'At Risk' },
      over_budget: { variant: 'destructive', label: 'Over Budget' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const utilizationRate = Math.round((totalSpent / totalAllocated) * 100);

  const stats = {
    totalBudget: totalAllocated,
    totalSpent: totalSpent,
    utilization: utilizationRate,
    overBudget: budgets.filter(b => b.status === 'over_budget').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              <SelectItem value="2024">FY 2024</SelectItem>
              <SelectItem value="2023">FY 2023</SelectItem>
              <SelectItem value="2025">FY 2025</SelectItem>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaries">Salaries</SelectItem>
                    <SelectItem value="tools">Tools & Software</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Allocated Amount (₹)" />
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Create Budget</Button>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
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
                <p className="text-2xl font-bold">{stats.utilization}%</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Over Budget</p>
                <p className="text-2xl font-bold text-red-600">{stats.overBudget}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
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
                <Tooltip formatter={(value) => `₹${value}M`} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="actual" fill="#22c55e" name="Actual" />
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
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocations</CardTitle>
        </CardHeader>
        <CardContent>
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
              {budgets.map((budget) => {
                const utilization = Math.round((budget.spent / budget.allocated) * 100);
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.department}</TableCell>
                    <TableCell>{budget.category}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(budget.allocated)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(budget.spent)}</TableCell>
                    <TableCell className={`text-right font-mono ${budget.remaining < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(budget.remaining)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(utilization, 100)} className="h-2 w-20" />
                        <span className="text-sm">{utilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(budget.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
