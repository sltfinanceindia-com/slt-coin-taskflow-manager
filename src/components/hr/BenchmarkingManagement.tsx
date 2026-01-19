import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Target, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export function BenchmarkingManagement() {
  const [industry, setIndustry] = useState('tech');
  const [region, setRegion] = useState('india');

  // Mock salary benchmark data
  const salaryBenchmarks = [
    { role: 'Software Engineer', internal: 1200000, market_25: 1000000, market_50: 1300000, market_75: 1600000, status: 'below' },
    { role: 'Senior Engineer', internal: 2000000, market_25: 1800000, market_50: 2200000, market_75: 2800000, status: 'at' },
    { role: 'Engineering Manager', internal: 3500000, market_25: 3200000, market_50: 3800000, market_75: 4500000, status: 'at' },
    { role: 'Product Manager', internal: 2500000, market_25: 2200000, market_50: 2600000, market_75: 3200000, status: 'at' },
    { role: 'Data Scientist', internal: 1800000, market_25: 1600000, market_50: 2000000, market_75: 2500000, status: 'at' },
    { role: 'UX Designer', internal: 1100000, market_25: 1200000, market_50: 1500000, market_75: 1800000, status: 'below' },
  ];

  const comparisonData = [
    { metric: 'Avg Salary', company: 18, industry: 20 },
    { metric: 'Benefits %', company: 15, industry: 18 },
    { metric: 'Bonus %', company: 12, industry: 10 },
    { metric: 'Training Days', company: 8, industry: 10 },
    { metric: 'Leave Days', company: 25, industry: 22 },
  ];

  const radarData = [
    { subject: 'Compensation', A: 75, B: 80, fullMark: 100 },
    { subject: 'Benefits', A: 80, B: 78, fullMark: 100 },
    { subject: 'Work-Life', A: 85, B: 70, fullMark: 100 },
    { subject: 'Growth', A: 70, B: 75, fullMark: 100 },
    { subject: 'Culture', A: 88, B: 72, fullMark: 100 },
    { subject: 'Stability', A: 82, B: 80, fullMark: 100 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'above':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'below':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' }> = {
      above: { variant: 'default' },
      at: { variant: 'secondary' },
      below: { variant: 'destructive' },
    };
    return <Badge variant={config[status]?.variant || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  const stats = {
    avgMarketPosition: 'At Market',
    rolesAbove: 0,
    rolesBelow: 2,
    rolesAtMarket: 4,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Salary Benchmarking</h2>
          <p className="text-muted-foreground">Compare compensation with industry and market standards</p>
        </div>
        <div className="flex gap-2">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
            </SelectContent>
          </Select>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="usa">USA</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="apac">APAC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Position</p>
                <p className="text-xl font-bold text-yellow-600">{stats.avgMarketPosition}</p>
              </div>
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Above Market</p>
                <p className="text-2xl font-bold text-green-600">{stats.rolesAbove}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Market</p>
                <p className="text-2xl font-bold text-blue-600">{stats.rolesAtMarket}</p>
              </div>
              <Minus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Below Market</p>
                <p className="text-2xl font-bold text-red-600">{stats.rolesBelow}</p>
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
            <CardTitle>Company vs Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="company" fill="#3b82f6" name="Company" />
                <Bar dataKey="industry" fill="#94a3b8" name="Industry Avg" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Value Proposition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Company" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Industry" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Salary Benchmark Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role-wise Salary Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Internal Avg</TableHead>
                <TableHead className="text-right">25th %ile</TableHead>
                <TableHead className="text-right">50th %ile</TableHead>
                <TableHead className="text-right">75th %ile</TableHead>
                <TableHead className="text-center">Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryBenchmarks.map((benchmark, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{benchmark.role}</TableCell>
                  <TableCell className="text-right">{formatCurrency(benchmark.internal)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(benchmark.market_25)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(benchmark.market_50)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(benchmark.market_75)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(benchmark.status)}
                      {getStatusBadge(benchmark.status)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
