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
import { Building2, Users, Activity, Plus, Search, ExternalLink } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  employeeCount: number;
  adminEmail: string;
  createdAt: string;
  lastActiveAt: string;
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    plan: 'enterprise',
    status: 'active',
    employeeCount: 250,
    adminEmail: 'admin@acme.com',
    createdAt: '2024-01-15',
    lastActiveAt: '2025-02-01',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    plan: 'professional',
    status: 'active',
    employeeCount: 45,
    adminEmail: 'hr@techstart.io',
    createdAt: '2024-03-20',
    lastActiveAt: '2025-01-31',
  },
  {
    id: '3',
    name: 'Global Retail Co',
    plan: 'starter',
    status: 'trial',
    employeeCount: 15,
    adminEmail: 'admin@globalretail.com',
    createdAt: '2025-01-10',
    lastActiveAt: '2025-02-01',
  },
];

export function OrganizationsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations] = useState<Organization[]>(mockOrganizations);

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanColor = (plan: Organization['plan']) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-500/10 text-purple-600';
      case 'professional':
        return 'bg-blue-500/10 text-blue-600';
      case 'starter':
        return 'bg-green-500/10 text-green-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusColor = (status: Organization['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

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
                <p className="text-2xl font-bold">
                  {organizations.filter((o) => o.status === 'active').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {organizations.reduce((sum, o) => sum + o.employeeCount, 0)}
                </p>
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
                <p className="text-2xl font-bold">
                  {organizations.filter((o) => o.status === 'trial').length}
                </p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(org.plan)}>{org.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(org.status) as any}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.employeeCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {org.adminEmail}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString()}
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
        </CardContent>
      </Card>
    </div>
  );
}
