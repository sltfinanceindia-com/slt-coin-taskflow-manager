/**
 * Organizations Tab for Super Admin
 * Manage all organizations in the platform
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Users, Activity, Plus, Search, ExternalLink, Loader2, FileX } from 'lucide-react';
import { useOrganizations, useOrganizationUserCounts } from '@/hooks/useOrganizations';

export function OrganizationsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: organizations = [], isLoading, error } = useOrganizations();
  const { data: userCounts = {} } = useOrganizationUserCounts();

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'canceled':
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const activeCount = organizations.filter((o) => o.subscription_status === 'active').length;
  const trialCount = organizations.filter((o) => o.subscription_status === 'trialing').length;
  const totalUsers = Object.values(userCounts).reduce((sum, count) => sum + count, 0);

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
        <FileX className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading organizations</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Organizations</h2>
          <p className="text-muted-foreground">
            Manage all organizations on the platform
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{organizations.length}</p>
                <p className="text-sm text-muted-foreground">Total Orgs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trialCount}</p>
                <p className="text-sm text-muted-foreground">On Trial</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Organizations</CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No organizations found</h3>
              <p className="text-muted-foreground">Create an organization to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Max Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-muted-foreground">{org.subdomain}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(org.subscription_status) as any}>
                        {org.subscription_status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{userCounts[org.id] || 0}</TableCell>
                    <TableCell>{org.max_users === -1 ? 'Unlimited' : org.max_users || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {org.created_at ? new Date(org.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
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
