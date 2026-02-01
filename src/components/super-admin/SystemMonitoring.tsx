/**
 * System Monitoring Component for Super Admin
 * Platform health and performance metrics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
}

const services: ServiceStatus[] = [
  { name: 'API Server', status: 'healthy', latency: 45, uptime: 99.99 },
  { name: 'Database', status: 'healthy', latency: 12, uptime: 99.97 },
  { name: 'Authentication', status: 'healthy', latency: 28, uptime: 99.99 },
  { name: 'Storage', status: 'healthy', latency: 65, uptime: 99.95 },
  { name: 'Email Service', status: 'healthy', latency: 120, uptime: 99.90 },
  { name: 'Background Jobs', status: 'healthy', latency: 5, uptime: 99.98 },
];

export function SystemMonitoring() {
  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-600';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'down':
        return 'bg-red-500/10 text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <p className="text-muted-foreground">
          Platform health, performance metrics, and service status
        </p>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
                <p className="text-sm text-muted-foreground">System Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.97%</p>
                <p className="text-sm text-muted-foreground">Uptime (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">45ms</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12,450</p>
                <p className="text-sm text-muted-foreground">Requests/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Services Status</CardTitle>
          <CardDescription>
            Real-time status of all platform services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Latency: {service.latency}ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.uptime}%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">42%</span>
              <Badge variant="secondary">Normal</Badge>
            </div>
            <Progress value={42} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Peak (24h)</p>
                <p className="font-medium">78%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Average (24h)</p>
                <p className="font-medium">45%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">65%</span>
              <Badge variant="secondary">Normal</Badge>
            </div>
            <Progress value={65} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-medium">13.2 GB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-medium">7.2 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">28%</span>
              <Badge className="bg-green-500/10 text-green-600">Healthy</Badge>
            </div>
            <Progress value={28} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Connections</p>
                <p className="font-medium">142 / 500</p>
              </div>
              <div>
                <p className="text-muted-foreground">Query Time</p>
                <p className="font-medium">8ms avg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">52%</span>
              <Badge variant="secondary">Normal</Badge>
            </div>
            <Progress value={52} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-medium">520 GB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">1 TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
