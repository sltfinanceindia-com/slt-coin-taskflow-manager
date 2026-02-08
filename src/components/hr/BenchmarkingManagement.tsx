import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, Loader2, FileX, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useSalaryBenchmarks } from '@/hooks/useSalaryBenchmarks';

export function BenchmarkingManagement() {
  const { benchmarks, isLoading, error } = useSalaryBenchmarks();
  const [industry, setIndustry] = useState('tech');
  const [region, setRegion] = useState('india');

  const filteredBenchmarks = benchmarks.filter(b => 
    (industry === 'all' || b.industry === industry) &&
    (region === 'all' || b.region === region)
  );

  // Calculate stats first since other computed values depend on it
  const stats = {
    rolesAbove: filteredBenchmarks.filter(b => b.status === 'above').length,
    rolesBelow: filteredBenchmarks.filter(b => b.status === 'below').length,
    rolesAtMarket: filteredBenchmarks.filter(b => b.status === 'at').length,
  };

  // Aggregated comparison data from benchmarks - computed from real data
  const comparisonData = filteredBenchmarks.length > 0 
    ? [
        { 
          metric: 'Avg Salary (L)', 
          company: Math.round((filteredBenchmarks.reduce((sum, b) => sum + (b.internal_avg || 0), 0) / filteredBenchmarks.length) / 100000), 
          industry: Math.round((filteredBenchmarks.reduce((sum, b) => sum + (b.market_50 || 0), 0) / filteredBenchmarks.length) / 100000)
        },
        { metric: 'Above Market', company: stats.rolesAbove, industry: 0 },
        { metric: 'At Market', company: stats.rolesAtMarket, industry: filteredBenchmarks.length },
        { metric: 'Below Market', company: stats.rolesBelow, industry: 0 },
      ]
    : [];

  // Radar data - will show when benchmarks exist
  const radarData = filteredBenchmarks.length > 0
    ? [
        { subject: 'Compensation', A: stats.rolesAbove > stats.rolesBelow ? 80 : 60, B: 70, fullMark: 100 },
        { subject: 'Market Position', A: (stats.rolesAtMarket / Math.max(filteredBenchmarks.length, 1)) * 100, B: 70, fullMark: 100 },
        { subject: 'Competitiveness', A: stats.rolesBelow === 0 ? 90 : 70, B: 75, fullMark: 100 },
      ]
    : [];

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'above':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'below':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' }> = {
      above: { variant: 'default' },
      at: { variant: 'secondary' },
      below: { variant: 'destructive' },
    };
    return <Badge variant={config[status || 'at']?.variant || 'secondary'}>{(status || 'at').toUpperCase()}</Badge>;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '₹0';
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading benchmarks</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

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
              <SelectItem value="all">All Industries</SelectItem>
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
              <SelectItem value="all">All Regions</SelectItem>
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
                <p className="text-xl font-bold text-yellow-600">
                  {stats.rolesAtMarket > stats.rolesAbove && stats.rolesAtMarket > stats.rolesBelow ? 'At Market' : 
                   stats.rolesAbove > stats.rolesBelow ? 'Above Market' : 'Below Market'}
                </p>
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
          {filteredBenchmarks.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No benchmarks found</h3>
              <p className="text-muted-foreground">Add salary benchmarks to compare with market data</p>
            </div>
          ) : (
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
                {filteredBenchmarks.map((benchmark) => (
                  <TableRow key={benchmark.id}>
                    <TableCell className="font-medium">{benchmark.role}</TableCell>
                    <TableCell className="text-right">{formatCurrency(benchmark.internal_avg)}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
