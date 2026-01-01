import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Coins, User, Calendar, Mail, Briefcase, Settings } from 'lucide-react';
import { UserAssessmentResults } from '@/components/assessment/UserAssessmentResults';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const { isAdmin } = useUserRole();
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab="profile" onTabChange={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 max-w-7xl">
              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Profile
                </h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm">
                  Manage your account and view progress
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-1">
                  <Card className="card-gradient">
                    <CardHeader className="text-center px-3 sm:px-6 py-4 sm:py-6">
                      <div className="flex justify-end mb-2 sm:mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mb-3 sm:mb-4 flex justify-center">
                        <AvatarUpload
                          currentAvatarUrl={profile?.avatar_url}
                          userName={profile?.full_name}
                          size="lg"
                        />
                      </div>
                      <CardTitle className="text-lg sm:text-2xl truncate">{profile?.full_name}</CardTitle>
                      <CardDescription className="text-base sm:text-lg mt-1">
                        <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                          {isAdmin ? 'Administrator' : profile?.role || 'Employee'}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
                      <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 mb-1 sm:mb-2">
                          <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-coin-gold" />
                          <span className="text-xs sm:text-sm text-muted-foreground">Total Coins</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-coin-gold">
                          {profile?.total_coins || 0}
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{profile?.email}</span>
                        </div>
                        
                        {profile?.department && (
                          <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                            <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{profile.department}</span>
                          </div>
                        )}
                        
                        {profile?.employee_id && (
                          <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">ID: {profile.employee_id}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">Joined: {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Assessment Results */}
                <div className="lg:col-span-2">
                  <UserAssessmentResults />
                </div>
              </div>
            </div>
          </main>
          {isMobile && <BottomNavigation variant="private" activeTab="profile" onTabChange={() => {}} />}
        </div>
      </div>
    </SidebarProvider>
  );
}