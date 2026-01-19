import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, TrendingDown, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

export function HRAnalytics() {
  const [period, setPeriod] = useState('year');

  // Mock data
  const headcountData = [
    { month: 'Jan', headcount: 142, hires: 8, exits: 3 },
    { month: 'Feb', headcount: 147, hires: 7, exits: 2 },
    { month: 'Mar', headcount: 151, hires: 6, exits: 2 },
    { month: 'Apr', headcount: 155, hires: 8, exits: 4 },
    { month: 'May', headcount: 158, hires: 5, exits: 2 },
    { month: 'Jun', headcount: 160, hires: 6, exits: 4 },
    { month: 'Jul', headcount: 162, hires: 7, exits: 5 },
    { month: 'Aug', headcount: 165, hires: 8, exits: 5 },
    { month: 'Sep', headcount: 168, hires: 6, exits: 3 },
    { month: 'Oct', headcount: 172, hires: 9, exits: 5 },
    { month: 'Nov', headcount: 175, hires: 7, exits: 4 },
    { month: 'Dec', headcount: 178, hires: 5, exits: 2 },
  ];

  const attritionByDept = [
    { department: 'Engineering', rate: 8.5 },
    { department: 'Sales', rate: 15.2 },
    { department: 'Marketing', rate: 10.1 },
    { department: 'HR', rate: 5.5 },
    { department: 'Finance', rate: 6.2 },
    { department: 'Operations', rate: 12.3 },
  ];

  const tenureDistribution = [
    { name: '< 1 year', value: 35, color: '#ef4444' },
    { name: '1-2 years', value: 45, color: '#f97316' },
    { name: '2-5 years', value: 60, color: '#eab308' },
    { name: '5-10 years', value: 28, color: '#22c55e' },
    { name: '10+ years', value: 10, color: '#3b82f6' },
  ];

  const costPerEmployee = [
    { month: 'Jan', salary: 85000, benefits: 15000, training: 2000 },
    { month: 'Feb', salary: 86000, benefits: 15200, training: 1800 },
    { month: 'Mar', salary: 87000, benefits: 15400, training: 2500 },
    { month: 'Apr', salary: 88000, benefits: 15600, training: 2200 },
    { month: 'May', salary: 89000, benefits: 15800, training: 1900 },
    { month: 'Jun', salary: 90000, benefits: 16000, training: 2100 },
  ];

  const exitReasons = [
    { reason: 'Better Opportunity', count: 15 },
    { reason: 'Salary', count: 12 },
    { reason: 'Work-Life Balance', count: 8 },
    { reason: 'Career Growth', count: 10 },
    { reason: 'Relocation', count: 5 },
    { reason: 'Personal', count: 6 },
  ];

  const stats = {
    totalEmployees: 178,
    avgTenure: 3.2,
    attritionRate: 9.8,
    costPerEmployee: 102000,
    openPositions: 12,
    timeToHire: 28,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HR Analytics</h2>
          <p className="text-muted-foreground">Attrition, headcount, and cost analytics dashboard</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Tenure</p>
                <p className="text-2xl font-bold">{stats.avgTenure} yrs</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attrition Rate</p>
                <p className="text-2xl font-bold text-red-600">{stats.attritionRate}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost/Employee</p>
                <p className="text-2xl font-bold">${(stats.costPerEmployee / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold">{stats.openPositions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time to Hire</p>
                <p className="text-2xl font-bold">{stats.timeToHire} days</p>
              </div>
              <BarChart3 className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="headcount" stroke="#3b82f6" fill="#3b82f680" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hires vs Exits</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hires" fill="#22c55e" name="Hires" />
                <Bar dataKey="exits" fill="#ef4444" name="Exits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attrition by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attritionByDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 20]} />
                <YAxis dataKey="department" type="category" width={100} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="rate" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenure Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tenureDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tenureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costPerEmployee}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="salary" stackId="1" stroke="#3b82f6" fill="#3b82f680" name="Salary" />
                <Area type="monotone" dataKey="benefits" stackId="1" stroke="#22c55e" fill="#22c55e80" name="Benefits" />
                <Area type="monotone" dataKey="training" stackId="1" stroke="#f97316" fill="#f9731680" name="Training" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exit Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exitReasons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="reason" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
