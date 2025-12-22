import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Monitor, Smartphone, Tablet, Globe, Clock, Shield, 
  Search, Filter, MapPin, Download, Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportToCSV, formatDateForExport } from '@/lib/export';
import { ExportWrapper } from '@/components/ExportButton';

interface OrgSession {
  id: string;
  user_id: string;
  device_info: {
    browser?: string;
    os?: string;
    device_type?: string;
  };
  geo_location: {
    city?: string;
    country?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  ip_address: string | null;
  login_at: string;
  last_activity_at: string;
  is_active: boolean;
  work_mode: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

function getDeviceIcon(deviceType: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

function getDeviceBadgeColor(deviceType: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'tablet':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
}

export function AdminSessionViewer() {
  const { profile } = useAuth();
  const { canView } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Check if user has permission to view sessions
  const hasSessionsPermission = canView('sessions');

  // Fetch all organization sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['org-sessions', profile?.organization_id, statusFilter],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('active_sessions')
        .select(`
          *,
          profile:profiles!active_sessions_profile_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('organization_id', profile.organization_id)
        .order('login_at', { ascending: false });

      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return data as OrgSession[];
    },
    enabled: !!profile?.organization_id && hasSessionsPermission,
  });

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const deviceInfo = session.device_info || {};
    const userName = session.profile?.full_name?.toLowerCase() || '';
    const email = session.profile?.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    // Search filter
    if (searchQuery && !userName.includes(query) && !email.includes(query)) {
      return false;
    }

    // Device filter
    if (deviceFilter !== 'all') {
      const deviceType = deviceInfo.device_type?.toLowerCase() || 'desktop';
      if (deviceFilter !== deviceType) return false;
    }

    return true;
  });

  // Stats
  const totalSessions = filteredSessions.length;
  const mobileSessions = filteredSessions.filter(s => 
    s.device_info?.device_type?.toLowerCase() === 'mobile'
  ).length;
  const uniqueUsers = new Set(filteredSessions.map(s => s.user_id)).size;

  // Export
  const handleExport = () => {
    const exportData = filteredSessions.map(session => ({
      employee: session.profile?.full_name || 'Unknown',
      email: session.profile?.email || '',
      device: session.device_info?.device_type || 'Desktop',
      browser: session.device_info?.browser || 'Unknown',
      os: session.device_info?.os || 'Unknown',
      location: session.geo_location?.city 
        ? `${session.geo_location.city}, ${session.geo_location.country}` 
        : 'Unknown',
      work_mode: session.work_mode,
      login_time: formatDateForExport(session.login_at),
      last_activity: formatDateForExport(session.last_activity_at),
      status: session.is_active ? 'Active' : 'Inactive',
    }));

    exportToCSV(exportData, 'user_sessions', [
      { key: 'employee', label: 'Employee' },
      { key: 'email', label: 'Email' },
      { key: 'device', label: 'Device Type' },
      { key: 'browser', label: 'Browser' },
      { key: 'os', label: 'Operating System' },
      { key: 'location', label: 'Location' },
      { key: 'work_mode', label: 'Work Mode' },
      { key: 'login_time', label: 'Login Time' },
      { key: 'last_activity', label: 'Last Activity' },
      { key: 'status', label: 'Status' },
    ]);
  };

  if (!hasSessionsPermission) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view user sessions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">User Sessions</h2>
          <p className="text-muted-foreground text-sm">
            View all active and recent user sessions with device and location info
          </p>
        </div>
        <ExportWrapper>
          <Button onClick={handleExport} variant="outline" disabled={filteredSessions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Sessions
          </Button>
        </ExportWrapper>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile Sessions</p>
                <p className="text-2xl font-bold">{mobileSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Device Type</Label>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Showing {filteredSessions.length} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No Sessions Found</h3>
              <p className="text-muted-foreground">
                No user sessions match your current filters.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Work Mode</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map(session => {
                      const deviceInfo = session.device_info || {};
                      const geoLocation = session.geo_location || {};
                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={session.profile?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {session.profile?.full_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {session.profile?.full_name || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {session.profile?.email || ''}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={cn("gap-1", getDeviceBadgeColor(deviceInfo.device_type || 'desktop'))}
                              >
                                {getDeviceIcon(deviceInfo.device_type || 'desktop')}
                                {deviceInfo.device_type || 'Desktop'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {deviceInfo.browser || 'Unknown'} / {deviceInfo.os || 'Unknown'}
                            </p>
                          </TableCell>
                          <TableCell>
                            {geoLocation.city ? (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{geoLocation.city}, {geoLocation.country}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={session.work_mode === 'wfh' ? 'outline' : 'secondary'}>
                              {session.work_mode === 'wfh' ? 'WFH' : 'Office'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDistanceToNow(new Date(session.login_at), { addSuffix: true })}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.login_at), 'MMM dd, h:mm a')}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(session.last_activity_at), 'MMM dd, h:mm a')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={session.is_active ? 'default' : 'secondary'}>
                              {session.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}