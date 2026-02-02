/**
 * Profile Overview Tab
 * Basic profile information and quick stats
 */

import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Coins, User, Calendar, Mail, Briefcase, Building2 } from 'lucide-react';

export function ProfileOverviewTab() {
  const { profile } = useAuth();
  const { isAdmin, role } = useUserRole();
  const { organization } = useOrganization();
  const coinName = organization?.coin_name || 'Coins';

  const getRoleLabel = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Organization Admin';
      case 'admin': return 'Admin';
      case 'hr_admin': return 'HR Admin';
      case 'project_manager': return 'Project Manager';
      case 'finance_manager': return 'Finance Manager';
      case 'manager': return 'Manager';
      case 'team_lead': return 'Team Lead';
      case 'employee': return 'Employee';
      case 'intern': return 'Intern';
      default: return 'User';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <Card className="card-gradient lg:col-span-1">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AvatarUpload
              currentAvatarUrl={profile?.avatar_url}
              userName={profile?.full_name}
              size="lg"
            />
          </div>
          <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
          <CardDescription>
            <Badge variant={isAdmin ? 'default' : 'secondary'}>
              {getRoleLabel()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-coin-gold" />
              <span className="text-sm text-muted-foreground">Total {coinName}</span>
            </div>
            <div className="text-3xl font-bold text-coin-gold">
              {profile?.total_coins || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card className="card-gradient lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
            </div>

            {profile?.department && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{profile.department}</p>
                </div>
              </div>
            )}

            {profile?.employee_id && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{profile.employee_id}</p>
                </div>
              </div>
            )}

            {organization?.name && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{organization.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(profile?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
