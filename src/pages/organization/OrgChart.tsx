import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Users,
  UserPlus,
  Download,
  RefreshCw,
  List,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrgChartViewer } from '@/components/rbac/OrgChartViewer';
import { TeamMemberList } from '@/components/rbac/TeamMemberList';
import { ReportingManagerAssignment } from '@/components/rbac/ReportingManagerAssignment';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export default function OrgChartPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState('chart');
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowAssignment(true);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            Organization Chart
          </h1>
          <p className="text-muted-foreground">
            View your organization's reporting structure
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => setShowAssignment(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Manager
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Chart View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="my-team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Organization Hierarchy</CardTitle>
              <CardDescription>
                Click on any employee to view details. Expand nodes to see their direct reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrgChartViewer onSelectUser={handleSelectUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                View all employees with their reporting managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMemberList
                showAll
                onSelectUser={handleSelectUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-team">
          <Card>
            <CardHeader>
              <CardTitle>My Direct Reports</CardTitle>
              <CardDescription>
                Employees who report directly to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMemberList
                managerId={profile?.id}
                onSelectUser={handleSelectUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manager Assignment Dialog */}
      {showAssignment && (
        <ReportingManagerAssignment
          userId={selectedUserId}
          open={showAssignment}
          onOpenChange={(open) => {
            setShowAssignment(open);
            if (!open) setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}
