import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Search, DollarSign, Users, TrendingUp, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  budget: number;
  actual: number;
  headcount: number;
  status: 'active' | 'inactive';
}

export function CostCentersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const costCenters: CostCenter[] = [
    { id: '1', code: 'CC-ENG-001', name: 'Engineering - Core', department: 'Engineering', manager: 'John Doe', budget: 30000000, actual: 28000000, headcount: 45, status: 'active' },
    { id: '2', code: 'CC-ENG-002', name: 'Engineering - Platform', department: 'Engineering', manager: 'Jane Smith', budget: 20000000, actual: 18500000, headcount: 30, status: 'active' },
    { id: '3', code: 'CC-MKT-001', name: 'Marketing - Digital', department: 'Marketing', manager: 'Alice Brown', budget: 8000000, actual: 9200000, headcount: 15, status: 'active' },
    { id: '4', code: 'CC-SAL-001', name: 'Sales - Enterprise', department: 'Sales', manager: 'Bob Wilson', budget: 12000000, actual: 11000000, headcount: 20, status: 'active' },
    { id: '5', code: 'CC-OPS-001', name: 'Operations', department: 'Operations', manager: 'Carol White', budget: 5000000, actual: 4500000, headcount: 10, status: 'active' },
    { id: '6', code: 'CC-HR-001', name: 'Human Resources', department: 'HR', manager: 'David Chen', budget: 3000000, actual: 2800000, headcount: 8, status: 'active' },
  ];

  const filteredCostCenters = costCenters.filter(cc =>
    cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cc.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = costCenters.map(cc => ({
    name: cc.code.split('-')[1],
    budget: cc.budget / 1000000,
    actual: cc.actual / 1000000,
  }));

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const totalBudget = costCenters.reduce((acc, cc) => acc + cc.budget, 0);
  const totalActual = costCenters.reduce((acc, cc) => acc + cc.actual, 0);
  const totalHeadcount = costCenters.reduce((acc, cc) => acc + cc.headcount, 0);

  const stats = {
    totalCenters: costCenters.length,
    totalBudget,
    totalActual,
    totalHeadcount,
  };

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
              <Input placeholder="Cost Center Code (e.g., CC-ENG-003)" />
              <Input placeholder="Cost Center Name" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Cost Center Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Smith</SelectItem>
                  <SelectItem value="3">Alice Brown</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Annual Budget (₹)" />
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Create</Button>
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
                <p className="text-2xl font-bold">{stats.totalCenters}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalActual)}</p>
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
                <p className="text-2xl font-bold">{stats.totalHeadcount}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
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
              <Tooltip formatter={(value) => `₹${value}M`} />
              <Legend />
              <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              <Bar dataKey="actual" fill="#22c55e" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCostCenters.map((cc) => {
                const variance = cc.budget - cc.actual;
                const variancePercent = Math.round((variance / cc.budget) * 100);
                return (
                  <TableRow key={cc.id}>
                    <TableCell className="font-mono text-sm">{cc.code}</TableCell>
                    <TableCell className="font-medium">{cc.name}</TableCell>
                    <TableCell>{cc.department}</TableCell>
                    <TableCell>{cc.manager}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(cc.budget)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(cc.actual)}</TableCell>
                    <TableCell className={`text-right font-mono ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {variance >= 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)
                    </TableCell>
                    <TableCell className="text-center">{cc.headcount}</TableCell>
                    <TableCell>
                      <Badge variant={cc.status === 'active' ? 'default' : 'secondary'}>
                        {cc.status.charAt(0).toUpperCase() + cc.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                    </TableCell>
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
