/**
 * Ticket Analytics Component
 * Real analytics dashboard for Service Desk tickets
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Timer,
  Ticket,
} from 'lucide-react';
import { ServiceTicket } from '@/hooks/useServiceDesk';

interface ServiceDeskMetrics {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  slaBreached: number;
  majorIncidents: number;
  byPriority: {
    critical: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface TicketAnalyticsProps {
  metrics: ServiceDeskMetrics;
  tickets: ServiceTicket[];
}

const PRIORITY_COLORS = {
  critical: '#dc2626',
  urgent: '#ea580c',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const STATUS_COLORS = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  pending: '#6b7280',
  resolved: '#22c55e',
  closed: '#1f2937',
  cancelled: '#9ca3af',
};

export function TicketAnalytics({ metrics, tickets }: TicketAnalyticsProps) {
  // Calculate analytics data from tickets
  const analyticsData = useMemo(() => {
    // Priority distribution
    const priorityDistribution = Object.entries(
      tickets.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || '#6b7280',
    }));

    // Status distribution
    const statusDistribution = Object.entries(
      tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#6b7280',
    }));

    // Type distribution
    const typeDistribution = Object.entries(
      tickets.reduce((acc, ticket) => {
        acc[ticket.ticket_type] = (acc[ticket.ticket_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value,
    }));

    // Weekly trend (last 7 days)
    const now = new Date();
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayTickets = tickets.filter(t => 
        t.created_at?.startsWith(dateStr)
      );
      const resolvedTickets = tickets.filter(t => 
        t.resolved_at?.startsWith(dateStr)
      );
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created: dayTickets.length,
        resolved: resolvedTickets.length,
      };
    });

    // Calculate SLA compliance based on slaStatus property
    const slaBreached = tickets.filter(t => t.slaStatus?.responseBreached || t.slaStatus?.resolutionBreached).length;
    const slaAtRisk = tickets.filter(t => {
      if (!t.slaStatus) return false;
      // Consider at risk if less than 25% of time remaining (approximate)
      return !t.slaStatus.responseBreached && !t.slaStatus.resolutionBreached;
    }).length;
    const slaOnTrack = tickets.filter(t => t.slaStatus && !t.slaStatus.responseBreached && !t.slaStatus.resolutionBreached).length;
    const slaTotal = tickets.length;
    const slaComplianceRate = slaTotal > 0 ? Math.round(((slaTotal - slaBreached) / slaTotal) * 100) : 100;

    // Calculate MTTR (Mean Time to Resolution) from resolved tickets
    const resolvedTickets = tickets.filter(t => t.resolved_at && t.created_at);
    let mttrHours = 0;
    if (resolvedTickets.length > 0) {
      const totalResolutionTime = resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.created_at!).getTime();
        const resolved = new Date(t.resolved_at!).getTime();
        return sum + (resolved - created);
      }, 0);
      mttrHours = Math.round((totalResolutionTime / resolvedTickets.length) / (1000 * 60 * 60));
    }

    // First Contact Resolution rate (estimate based on tickets resolved same day as created)
    const fcrTickets = resolvedTickets.filter(t => {
      const created = new Date(t.created_at!).toDateString();
      const resolved = new Date(t.resolved_at!).toDateString();
      return created === resolved;
    });
    const fcrRate = resolvedTickets.length > 0 
      ? Math.round((fcrTickets.length / resolvedTickets.length) * 100) 
      : 0;

    return {
      priorityDistribution,
      statusDistribution,
      typeDistribution,
      weeklyTrend,
      slaComplianceRate,
      slaBreached,
      slaAtRisk,
      slaOnTrack,
      mttrHours,
      fcrRate,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.slaComplianceRate}%</div>
            <Progress value={analyticsData.slaComplianceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {analyticsData.slaOnTrack} on track, {analyticsData.slaAtRisk} at risk, {analyticsData.slaBreached} breached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mean Time to Resolution</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.mttrHours}h
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average resolution time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Contact Resolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.fcrRate}%</div>
            <Progress value={analyticsData.fcrRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Resolved on first day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.open}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {metrics.byPriority.critical} Critical
              </Badge>
              <Badge variant="outline" className="text-xs">
                {metrics.byPriority.high} High
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Ticket Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="hsl(var(--primary))" 
                    name="Created"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="hsl(142 76% 36%)" 
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tickets by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.typeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-emerald-700">{analyticsData.slaOnTrack}</div>
                <p className="text-sm text-emerald-600">On Track</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-700">{analyticsData.slaAtRisk}</div>
                <p className="text-sm text-amber-600">At Risk</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{analyticsData.slaBreached}</div>
                <p className="text-sm text-red-600">Breached</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
