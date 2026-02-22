import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, TrendingDown, TrendingUp, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, differenceInYears, differenceInMonths } from 'date-fns';

export function HRAnalytics() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState('year');

  // Fetch real headcount data from profiles
  const { data: profilesData, isLoading: loadingProfiles } = useQuery({
    queryKey: ['hr-profiles', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at, is_active, department_id, departments!profiles_department_id_fkey(name)')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch exit interviews for attrition data
  const { data: exitData, isLoading: loadingExits } = useQuery({
    queryKey: ['hr-exits', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exit_requests')
        .select('id, employee_id, reason, status, created_at, profiles!exit_requests_employee_id_fkey(department_id, departments!profiles_department_id_fkey(name))')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch open job postings
  const { data: jobPostings } = useQuery({
    queryKey: ['hr-jobs', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, status')
        .eq('organization_id', profile?.organization_id)
        .eq('status', 'open');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate headcount trend by month
  const headcountData = useMemo(() => {
    if (!profilesData) return [];
    
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStr = format(monthDate, 'MMM');
      
      // Count employees who existed at end of that month
      const headcount = profilesData.filter((p: any) => {
        const joinDate = new Date(p.created_at);
        return joinDate <= monthDate && p.is_active;
      }).length;
      
      // Count hires in that month
      const hires = profilesData.filter((p: any) => {
        const joinDate = new Date(p.created_at);
        return format(joinDate, 'yyyy-MM') === format(monthDate, 'yyyy-MM');
      }).length;
      
      // Count exits in that month
      const exits = exitData?.filter((e: any) => {
        const exitDate = new Date(e.created_at);
        return format(exitDate, 'yyyy-MM') === format(monthDate, 'yyyy-MM');
      }).length || 0;
      
      months.push({ month: monthStr, headcount, hires, exits });
    }
    
    return months;
  }, [profilesData, exitData]);

  // Calculate attrition by department
  const attritionByDept = useMemo(() => {
    if (!exitData || !profilesData) return [];
    
    const deptStats: Record<string, { total: number; exits: number }> = {};
    
    profilesData.forEach((p: any) => {
      const deptName = p.departments?.name || 'Unassigned';
      if (!deptStats[deptName]) deptStats[deptName] = { total: 0, exits: 0 };
      deptStats[deptName].total++;
    });
    
    exitData.forEach((e: any) => {
      const deptName = e.profiles?.departments?.name || 'Unassigned';
      if (deptStats[deptName]) deptStats[deptName].exits++;
    });
    
    return Object.entries(deptStats)
      .map(([department, stats]) => ({
        department,
        rate: stats.total > 0 ? Math.round((stats.exits / stats.total) * 100 * 10) / 10 : 0
      }))
      .filter(d => d.rate > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);
  }, [exitData, profilesData]);

  // Calculate tenure distribution
  const tenureDistribution = useMemo(() => {
    if (!profilesData) return [];
    
    const activeProfiles = profilesData.filter((p: any) => p.is_active);
    const now = new Date();
    
    const buckets = {
      '< 1 year': 0,
      '1-2 years': 0,
      '2-5 years': 0,
      '5-10 years': 0,
      '10+ years': 0,
    };
    
    activeProfiles.forEach((p: any) => {
      const joinDate = new Date(p.created_at);
      const years = differenceInYears(now, joinDate);
      
      if (years < 1) buckets['< 1 year']++;
      else if (years < 2) buckets['1-2 years']++;
      else if (years < 5) buckets['2-5 years']++;
      else if (years < 10) buckets['5-10 years']++;
      else buckets['10+ years']++;
    });
    
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
    return Object.entries(buckets).map(([name, value], i) => ({
      name, value, color: colors[i]
    }));
  }, [profilesData]);

  // Calculate exit reasons
  const exitReasons = useMemo(() => {
    if (!exitData) return [];
    
    const reasons: Record<string, number> = {};
    exitData.forEach((e: any) => {
      const reason = e.reason || 'Other';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    
    return Object.entries(reasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [exitData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEmployees = profilesData?.filter((p: any) => p.is_active).length || 0;
    const totalExits = exitData?.length || 0;
    const attritionRate = totalEmployees > 0 ? Math.round((totalExits / totalEmployees) * 100 * 10) / 10 : 0;
    
    // Calculate average tenure
    const activeProfiles = profilesData?.filter((p: any) => p.is_active) || [];
    const now = new Date();
    const avgTenureMonths = activeProfiles.length > 0
      ? activeProfiles.reduce((sum: number, p: any) => {
          const joinDate = new Date(p.created_at);
          return sum + differenceInMonths(now, joinDate);
        }, 0) / activeProfiles.length
      : 0;
    
    return {
      totalEmployees,
      avgTenure: Math.round(avgTenureMonths / 12 * 10) / 10,
      attritionRate,
      openPositions: jobPostings?.length || 0,
    };
  }, [profilesData, exitData, jobPostings]);

  const isLoading = loadingProfiles || loadingExits;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HR Analytics</h2>
          <p className="text-muted-foreground">Attrition, headcount, and workforce analytics</p>
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
      <div className="grid gap-4 md:grid-cols-4">
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
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold">{stats.openPositions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
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
            {attritionByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attritionByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'auto']} />
                  <YAxis dataKey="department" type="category" width={100} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="rate" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No attrition data available
              </div>
            )}
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

      {/* Exit Reasons */}
      {exitReasons.length > 0 && (
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
      )}
    </div>
  );
}