import { useState } from 'react';
import {
  Users,
  UserPlus,
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
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

export default function OrgChartPage() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState('chart');
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowAssignment(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab="org-chart" onTabChange={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <GitBranch className="h-5 w-5 sm:h-6 sm:w-6" />
                    Organization Chart
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    View your organization's reporting structure
                  </p>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button onClick={() => setShowAssignment(true)} size="sm" className="sm:size-default">
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
          </main>
          {isMobile && <BottomNavigation variant="private" activeTab="org-chart" onTabChange={() => {}} />}
        </div>
      </div>
    </SidebarProvider>
  );
}